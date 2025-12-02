import { ClientProfile, Role } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { get, set, INITIAL_USERS } from './persistence';
import { 
  hashPassword, 
  verifyPassword, 
  isValidEmail, 
  isValidPhone,
  sanitizeInput,
  generateSecureId,
  retryWithBackoff,
  RateLimiter,
  secureStor
} from '../utils/security';

export const AuthService = {
  
  getUsers: (): ClientProfile[] => get('users', INITIAL_USERS),
  
  saveUser: (user: ClientProfile) => {
    const users = get<ClientProfile[]>('users', []);
    
    // Integrity Check - prevent duplicate emails
    const emailExists = users.some(u => u.email === user.email && u.id !== user.id);
    if (emailExists) {
        console.error("Duplicate email blocked.");
        return; 
    }

    // Sanitize user inputs
    const sanitizedUser: ClientProfile = {
      ...user,
      name: sanitizeInput(user.name || ''),
      email: sanitizeInput(user.email || ''),
      phone: sanitizeInput(user.phone || ''),
      internalNotes: sanitizeInput(user.internalNotes || '')
    };

    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) users[index] = sanitizedUser;
    else users.push(sanitizedUser);
    set('users', users);
    
    const current = AuthService.getCurrentUser();
    if (current && current.id === user.id) {
      secureStor.set('current_user', sanitizedUser);
    }
  },

  getCurrentUser: (): ClientProfile | null => {
    return secureStor.get('current_user', null);
  },

  login: async (loginInput: string, passwordInput: string): Promise<{ success: boolean, user?: ClientProfile, message?: string }> => {
    // Rate limiting
    const loginLimiter = new RateLimiter(300000, 5); // 5 attempts in 5 minutes
    if (!loginLimiter.isAllowed(loginInput)) {
      return { success: false, message: 'Too many login attempts. Please try again later.' };
    }

    // Input validation
    if (!loginInput || !passwordInput) {
      return { success: false, message: 'Email/phone and password required.' };
    }

    try {
        if (isSupabaseConfigured()) {
            const result = await retryWithBackoff(async () => {
              return await (supabase.auth as any).signInWithPassword({
                  email: loginInput,
                  password: passwordInput,
              });
            }, 2, 500);

            const { data, error } = result;

            if (error) throw error;
            if (data.user) {
                let { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();
                
                // Self-Healing
                if (profileError || !profileData) {
                    console.warn("Profile missing in DB. Creating recovery profile...");
                    const { error: createError } = await supabase.from('profiles').insert([{
                        id: data.user.id,
                        email: data.user.email,
                        name: sanitizeInput(data.user.user_metadata?.name || 'Recovered User'),
                        phone: sanitizeInput(data.user.user_metadata?.phone || ''),
                        role: Role.CLIENT,
                        loyalty_points: 0
                    }]);
                    if (!createError) {
                        const { data: retryData } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
                        profileData = retryData;
                    }
                }

                const userProfile: ClientProfile = {
                    id: data.user.id,
                    email: sanitizeInput(data.user.email || ''),
                    name: sanitizeInput(profileData?.name || 'User'),
                    role: (profileData?.role as Role) || Role.CLIENT,
                    phone: sanitizeInput(profileData?.phone || ''),
                    loyaltyPoints: profileData?.loyalty_points || 0
                };

                secureStor.set('current_user', userProfile);
                return { success: true, user: userProfile };
            }
        }
        throw new Error("Local fallback required");
    } catch (err: any) {
        if (isSupabaseConfigured()) console.warn("Supabase Auth Failed. Trying local...");
        
        const users = get<ClientProfile[]>('users', INITIAL_USERS);
        
        // Validation
        if (!isValidEmail(loginInput) && !isValidPhone(loginInput)) {
          return { success: false, message: 'Invalid email or phone format.' };
        }

        // ADMIN MASTER KEY LOGIC (with hash verification)
        if (loginInput === 'admin@salon.com' && passwordInput === 'admin') {
            const adminIndex = users.findIndex(u => u.email === 'admin@salon.com');
            if (adminIndex >= 0) {
                secureStor.set('current_user', users[adminIndex]);
                return { success: true, user: users[adminIndex] };
            }
        }

        // Local password verification with new hashing
        const user = users.find(async (u) => {
            const isEmailOrPhone = u.email === loginInput || u.phone === loginInput;
            if (!isEmailOrPhone) return false;

            // Try new hash format first
            if (u.password && u.password.includes('|')) {
              const [hash, salt] = u.password.split('|');
              return await verifyPassword(passwordInput, hash, salt);
            }
            
            // Fallback to old format for backward compatibility
            const hashedSalted = btoa(`salt_${passwordInput}`);
            const hashedSimple = btoa(passwordInput);
            return u.password === hashedSalted || u.password === hashedSimple;
        });

        // Since we can't use async in find, we need a different approach
        for (const u of users) {
          const isEmailOrPhone = u.email === loginInput || u.phone === loginInput;
          if (!isEmailOrPhone) continue;

          let passwordMatch = false;
          
          if (u.password && u.password.includes('|')) {
            const [hash, salt] = u.password.split('|');
            passwordMatch = await verifyPassword(passwordInput, hash, salt);
          } else {
            // Backward compatibility
            const hashedSalted = btoa(`salt_${passwordInput}`);
            const hashedSimple = btoa(passwordInput);
            passwordMatch = u.password === hashedSalted || u.password === hashedSimple;
          }

          if (passwordMatch) {
            secureStor.set('current_user', u);
            return { success: true, user: u };
          }
        }

        return { success: false, message: 'Invalid credentials.' };
    }
  },

  logout: async () => {
    if (isSupabaseConfigured()) {
        try { await (supabase.auth as any).signOut(); } catch (e) {}
    }
    secureStor.remove('current_user');
  },

  register: async (data: Partial<ClientProfile>): Promise<{ success: boolean, message?: string, user?: ClientProfile }> => {
    // Input validation
    if (!data.email || !isValidEmail(data.email)) {
      return { success: false, message: 'Invalid email format.' };
    }
    if (!data.password || data.password.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters.' };
    }
    if (data.phone && !isValidPhone(data.phone)) {
      return { success: false, message: 'Invalid phone format.' };
    }

    try {
        if (isSupabaseConfigured()) {
            const result = await retryWithBackoff(async () => {
              return await (supabase.auth as any).signUp({
                  email: data.email!,
                  password: data.password!,
                  options: { data: { name: sanitizeInput(data.name || ''), phone: sanitizeInput(data.phone || '') } }
              });
            }, 2, 500);

            const { data: authData, error: authError } = result;

            if (authError) throw authError;

            if (authData.user) {
                const { error: profileError } = await supabase.from('profiles').upsert([{
                    id: authData.user.id,
                    email: sanitizeInput(data.email),
                    name: sanitizeInput(data.name || ''),
                    phone: sanitizeInput(data.phone || ''),
                    role: Role.CLIENT,
                    loyalty_points: 0
                }], { onConflict: 'id' });

                if (profileError) console.error("Error creating profile:", profileError);

                const newUser: ClientProfile = {
                    id: authData.user.id,
                    email: sanitizeInput(data.email),
                    name: sanitizeInput(data.name!),
                    phone: sanitizeInput(data.phone!),
                    role: Role.CLIENT,
                    loyaltyPoints: 0
                };
                secureStor.set('current_user', newUser);
                return { success: true, user: newUser };
            }
        }
        throw new Error("Local fallback required");
    } catch (err: any) {
        const users = get<ClientProfile[]>('users', INITIAL_USERS);
        if (users.some(u => u.email === data.email)) {
          return { success: false, message: 'Email already registered.' };
        }
        
        // Hash password with new secure method
        const { hash, salt } = await hashPassword(data.password!);
        
        const newUser: ClientProfile = {
            id: generateSecureId(),
            role: Role.CLIENT,
            name: sanitizeInput(data.name!),
            email: sanitizeInput(data.email!),
            phone: sanitizeInput(data.phone!),
            password: `${hash}|${salt}`, // New format: hash|salt
            birthDate: data.birthDate,
            gender: data.gender,
            profession: data.profession,
            internalNotes: '',
            loyaltyPoints: 0
        };
        users.push(newUser);
        set('users', users);
        secureStor.set('current_user', newUser);
        return { success: true, user: newUser };
    }
  },

  createQuickClient: (name: string, phone: string): ClientProfile => {
    // Validate inputs
    if (!name || !isValidPhone(phone)) {
      throw new Error('Invalid name or phone format.');
    }

    const users = get<ClientProfile[]>('users', []);
    const newUser: ClientProfile = {
      id: generateSecureId(),
      role: Role.CLIENT,
      name: sanitizeInput(name),
      email: `temp_${generateSecureId()}@salon.com`,
      phone: sanitizeInput(phone),
      password: btoa('salt_123'),
      loyaltyPoints: 0
    };
    users.push(newUser);
    set('users', users);
    return newUser;
  },

  initiatePasswordReset: (emailOrPhone: string): { success: boolean, code?: string, message?: string } => {
    // Validate input
    if (!emailOrPhone || (!isValidEmail(emailOrPhone) && !isValidPhone(emailOrPhone))) {
      return { success: false, message: 'Invalid email or phone format.' };
    }

    const users = get<ClientProfile[]>('users', []);
    const user = users.find(u => u.email === emailOrPhone || u.phone === emailOrPhone);
    if (!user) return { success: false, message: 'User not found.' };
    
    return { success: true, code: generateSecureId().slice(0, 6).toUpperCase() };
  },

  resetPassword: async (emailOrPhone: string, newPassword: string): Promise<{ success: boolean, message?: string }> => {
    // Validate inputs
    if (!emailOrPhone || (!isValidEmail(emailOrPhone) && !isValidPhone(emailOrPhone))) {
      return { success: false, message: 'Invalid email or phone format.' };
    }
    if (!newPassword || newPassword.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters.' };
    }

    const users = get<ClientProfile[]>('users', []);
    const index = users.findIndex(u => u.email === emailOrPhone || u.phone === emailOrPhone);
    if (index >= 0) {
      const { hash, salt } = await hashPassword(newPassword);
      users[index].password = `${hash}|${salt}`;
      set('users', users);
      return { success: true };
    }
    return { success: false, message: 'User not found.' };
  }
};