
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { StorageService } from '../../services/storage';
import { Masks } from '../../utils/masks';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    gender: 'Prefiro não informar' as any,
    profession: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let val = e.target.value;
    if (e.target.name === 'phone') {
        val = Masks.phone(val);
    }
    setFormData({ ...formData, [e.target.name]: val });
  };

  const validatePassword = (pwd: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!validatePassword(formData.password)) {
      setError('A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula e número.');
      return;
    }
    if (formData.name.length < 3) {
      setError('O nome deve ter pelo menos 3 caracteres.');
      return;
    }

    const result = StorageService.register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      birthDate: formData.birthDate,
      gender: formData.gender,
      profession: formData.profession
    });

    if (result.success) {
      navigate('/client/book');
    } else {
      setError(result.message || 'Erro ao cadastrar.');
    }
  };

  return (
    <Layout title="Criar Conta" showBack>
      <div className="max-w-lg mx-auto bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Seus Dados</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-medium">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nome Completo</label>
            <input 
              name="name" 
              required 
              minLength={3} 
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
              <input 
                name="email" 
                type="email" 
                required 
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">WhatsApp</label>
              <input 
                name="phone" 
                type="tel" 
                required 
                placeholder="(11) 99999-9999" 
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Senha</label>
              <input 
                name="password" 
                type="password" 
                required 
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition" 
              />
              <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">
                Mín. 8 chars, maiúscula, minúscula, número.
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirmar Senha</label>
              <input 
                name="confirmPassword" 
                type="password" 
                required 
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Data de Nascimento</label>
              <input 
                name="birthDate" 
                type="date" 
                required 
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition text-slate-600" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gênero</label>
              <select 
                name="gender" 
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition text-slate-600"
              >
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
                <option value="Outro">Outro</option>
                <option value="Prefiro não informar">Prefiro não informar</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Profissão (Opcional)</label>
            <input 
              name="profession" 
              value={formData.profession}
              onChange={handleChange}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition" 
            />
          </div>

          <button type="submit" className="w-full py-4 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition mt-6 shadow-lg shadow-rose-500/20 transform hover:-translate-y-0.5 duration-200">
            Finalizar Cadastro
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Register;
