
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { StorageService } from '../../services/storage';
import { ClientProfile } from '../../types';
import { Search, Plus, User, Phone, ChevronRight } from 'lucide-react';
import { Masks } from '../../utils/masks';

const ClientsManager: React.FC = () => {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [search, setSearch] = useState('');
  const [isQuickAddOpen, setQuickAddOpen] = useState(false);
  
  // Quick Add State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    // Filter only clients, not admins
    const allUsers = StorageService.getUsers();
    setClients(allUsers.filter(u => u.role !== 'ADMIN'));
  }, []);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = StorageService.createQuickClient(newName, newPhone);
    setClients([...clients, newUser]);
    setQuickAddOpen(false);
    setNewName(''); setNewPhone('');
  };

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search) || 
    c.email.includes(search)
  );

  return (
    <Layout title="Gestão de Clientes" isAdmin showBack>
      <div className="flex justify-between items-center mb-6">
         <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome, telefone..." 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
         </div>
         <button 
           onClick={() => setQuickAddOpen(true)}
           className="ml-4 flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition text-sm font-medium whitespace-nowrap"
         >
           <Plus size={16} /> Cadastro Rápido
         </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Nenhum cliente encontrado.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(client => (
              <Link 
                key={client.id} 
                to={`/admin/clients/${client.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
              >
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                       <User size={20} />
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-900">{client.name}</h3>
                       <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1"><Phone size={12}/> {client.phone}</span>
                          <span className="bg-slate-100 px-1.5 rounded">{client.email}</span>
                       </div>
                    </div>
                 </div>
                 <ChevronRight className="text-slate-400" size={18} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {isQuickAddOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <form onSubmit={handleQuickAdd} className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl">
              <h3 className="font-bold text-lg mb-4">Cadastro Rápido</h3>
              <p className="text-xs text-slate-500 mb-4">Cadastre apenas o essencial para agendar agora. Você pode editar o resto depois.</p>
              
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium mb-1">Nome Completo</label>
                    <input required value={newName} onChange={e => setNewName(e.target.value)} className="w-full p-2 border rounded-lg" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Telefone</label>
                    <input 
                      required 
                      value={newPhone} 
                      onChange={e => setNewPhone(Masks.phone(e.target.value))} 
                      className="w-full p-2 border rounded-lg" 
                      placeholder="(11) 99999-9999"
                    />
                 </div>
              </div>

              <div className="mt-6 flex gap-3">
                 <button type="button" onClick={() => setQuickAddOpen(false)} className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancelar</button>
                 <button type="submit" className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-medium">Salvar</button>
              </div>
           </form>
        </div>
      )}
    </Layout>
  );
};

export default ClientsManager;
