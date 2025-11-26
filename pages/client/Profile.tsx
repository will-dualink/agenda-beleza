
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { StorageService } from '../../services/storage';
import { ClientProfile, Review, Professional, Service } from '../../types';
import { Save, User, KeyRound, ShieldCheck, Star, MessageCircle } from 'lucide-react';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'DATA' | 'REVIEWS'>('DATA');
  
  const [user, setUser] = useState<ClientProfile | null>(null);
  const [formData, setFormData] = useState<Partial<ClientProfile>>({});
  
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Reviews Data
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pros, setPros] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    setFormData(currentUser);

    // Fetch Reviews Data
    setReviews(StorageService.getClientReviews(currentUser.id));
    setPros(StorageService.getProfessionals());
    setServices(StorageService.getServices());

  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!user || !formData) return;
    setMsg({ type: '', text: '' });

    let updatedUser = { ...user, ...formData, email: user.email }; 

    if (showPasswordChange) {
      if (passwords.current !== user.password) {
        setMsg({ type: 'error', text: 'Senha atual incorreta.' });
        return;
      }
      if (passwords.new.length < 8) {
        setMsg({ type: 'error', text: 'A nova senha deve ter no mínimo 8 caracteres.' });
        return;
      }
      if (passwords.new !== passwords.confirm) {
        setMsg({ type: 'error', text: 'A nova senha e a confirmação não coincidem.' });
        return;
      }
      
      updatedUser.password = passwords.new;
    }

    StorageService.saveUser(updatedUser);
    setUser(updatedUser);
    
    setPasswords({ current: '', new: '', confirm: '' });
    setShowPasswordChange(false);
    
    setMsg({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  const getProInfo = (id: string) => pros.find(p => p.id === id);
  const getServiceName = (id: string) => services.find(s => s.id === id)?.name || 'Serviço';

  if (!user) return null;

  return (
    <Layout title="Meu Perfil" showBack>
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-rose-50 to-white p-8 border-b border-rose-50 flex items-center gap-6">
           <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-rose-500 shadow-sm border border-rose-50">
             <User size={36} strokeWidth={1.5} />
           </div>
           <div>
             <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
             <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider mt-1">
                 <ShieldCheck size={10} /> Cliente VIP
             </span>
           </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-8">
            <button 
                onClick={() => setActiveTab('DATA')}
                className={`py-4 px-2 font-bold text-sm border-b-2 transition ${activeTab === 'DATA' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
                Meus Dados
            </button>
            <button 
                onClick={() => setActiveTab('REVIEWS')}
                className={`py-4 px-2 font-bold text-sm border-b-2 transition ${activeTab === 'REVIEWS' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
                Minhas Avaliações
            </button>
        </div>

        <div className="p-8 space-y-8 min-h-[400px]">
          
          {activeTab === 'DATA' && (
            <div className="animate-fade-in space-y-8">
                {msg.text && (
                    <div className={`p-4 rounded-xl text-sm font-medium border ${msg.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                    {msg.text}
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nome</label>
                    <input name="name" value={formData.name || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none transition" />
                    </div>
                    <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">WhatsApp</label>
                    <input name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none transition" />
                    </div>
                </div>

                <div className="opacity-70">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email (Não editável)</label>
                    <input value={user.email} readOnly className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nascimento</label>
                    <input type="date" name="birthDate" value={formData.birthDate || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none transition text-slate-600" />
                    </div>
                    <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gênero</label>
                    <select name="gender" value={formData.gender || 'Prefiro não informar'} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none transition text-slate-600">
                        <option value="Feminino">Feminino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Outro">Outro</option>
                        <option value="Prefiro não informar">Prefiro não informar</option>
                    </select>
                    </div>
                    <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Profissão</label>
                    <input name="profession" value={formData.profession || ''} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none transition" />
                    </div>
                </div>

                {/* Password Change Section */}
                <div className="pt-6 border-t border-slate-100">
                    <button 
                    type="button"
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    className="flex items-center gap-2 text-sm font-bold text-rose-600 hover:text-rose-700 transition"
                    >
                        <KeyRound size={16} /> {showPasswordChange ? 'Cancelar alteração de senha' : 'Alterar minha senha'}
                    </button>

                    {showPasswordChange && (
                    <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-200 grid gap-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Senha Atual</label>
                            <input type="password" name="current" value={passwords.current} onChange={handlePasswordChange} className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-rose-200 outline-none" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-5">
                            <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Nova Senha</label>
                            <input type="password" name="new" value={passwords.new} onChange={handlePasswordChange} className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-rose-200 outline-none" />
                            </div>
                            <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Confirmar Nova Senha</label>
                            <input type="password" name="confirm" value={passwords.confirm} onChange={handlePasswordChange} className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-rose-200 outline-none" />
                            </div>
                        </div>
                    </div>
                    )}
                </div>

                <div className="pt-2">
                    <button onClick={handleSave} className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-300 font-bold tracking-wide transform hover:-translate-y-0.5 duration-200">
                    <Save size={18} /> Salvar Alterações
                    </button>
                </div>
            </div>
          )}

          {activeTab === 'REVIEWS' && (
              <div className="animate-fade-in space-y-4">
                  {reviews.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <MessageCircle size={32} className="mx-auto mb-3 opacity-20" />
                          <p>Você ainda não avaliou nenhum serviço.</p>
                      </div>
                  ) : (
                      reviews.map(review => {
                          const pro = getProInfo(review.professionalId);
                          return (
                              <div key={review.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition">
                                  <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-center gap-3">
                                          <img src={pro?.avatarUrl} className="w-10 h-10 rounded-full bg-slate-100 object-cover" alt="" />
                                          <div>
                                              <p className="font-bold text-slate-900 text-sm">{pro?.name || 'Profissional'}</p>
                                              <p className="text-xs text-slate-400">{review.date.split('-').reverse().join('/')}</p>
                                          </div>
                                      </div>
                                      <div className="flex gap-0.5 text-amber-400">
                                          {[1,2,3,4,5].map(star => (
                                              <Star key={star} size={14} fill={star <= review.rating ? "currentColor" : "none"} strokeWidth={2} className={star > review.rating ? "text-slate-200" : ""} />
                                          ))}
                                      </div>
                                  </div>
                                  
                                  {review.comment && (
                                      <p className="text-sm text-slate-600 mb-3 bg-slate-50 p-3 rounded-xl italic relative">
                                          <span className="absolute top-0 left-2 -mt-2 text-2xl text-slate-300">"</span>
                                          {review.comment}
                                      </p>
                                  )}

                                  <div className="inline-block px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold uppercase tracking-wider">
                                      {getServiceName(review.serviceId)}
                                  </div>
                              </div>
                          )
                      })
                  )}
              </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default Profile;
