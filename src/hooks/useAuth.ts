/**
 * useAuth Hook
 * Provides authentication state management
 */

import { useState, useEffect } from 'react';
import { ClientProfile } from '../types';
import { AuthService } from '../services/auth';

export const useAuth = () => {
  const [user, setUser] = useState<ClientProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const login = (user: ClientProfile) => {
    setUser(user);
    setIsLoggedIn(true);
    // Opcionalmente salvar no localStorage
    AuthService.setCurrentUser(user);
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    AuthService.clearCurrentUser();
  };

  return {
    user,
    isLoggedIn,
    loading,
    login,
    logout,
  };
};
