
import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { StorageService } from '../../services/storage';
import { Product } from '../../types';
import { Package, Plus, AlertTriangle, RefreshCcw, Search, Save, Minus } from 'lucide-react';

const InventoryManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // New Product Form
  const [newProd, setNewProd] = useState<Partial<Product>>({ 
    name: '', type: 'CONSUMABLE', costPrice: 0, salePrice: 0, currentStock: 0, minStock: 5, unit: 'un' 
  });

  useEffect(() => {
    setProducts(StorageService.getProducts());
  }, []);

  const handleSaveProduct = () => {
    if (!newProd.name || !newProd.costPrice) return;
    const product: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProd.name,
      type: newProd.type as any,
      costPrice: Number(newProd.costPrice),
      salePrice: Number(newProd.salePrice),
      currentStock: Number(newProd.currentStock),
      minStock: Number(newProd.minStock),
      unit: newProd.unit || 'un'
    };
    const updated = [...products, product];
    setProducts(updated);
    StorageService.saveProducts(updated);
    setIsModalOpen(false);
    setNewProd({ name: '', type: 'CONSUMABLE', costPrice: 0, salePrice: 0, currentStock: 0, minStock: 5, unit: 'un' });
  };

  const handleStockAdjust = (id: string, amount: number) => {
    StorageService.adjustStock(id, amount, amount > 0 ? 'ADJUSTMENT' : 'USAGE', 'Ajuste Manual Rápido');
    setProducts(StorageService.getProducts());
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout title="Gestão de Estoque" isAdmin showBack>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
           <h4 className="text-sm font-medium text-slate-500 mb-1">Total de Itens</h4>
           <p className="text-2xl font-bold text-slate-900">{products.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
           <h4 className="text-sm font-medium text-slate-500 mb-1">Alerta de Estoque Baixo</h4>
           <p className="text-2xl font-bold text-orange-600">
              {products.filter(p => p.currentStock <= p.minStock).length}
           </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
         <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
               value={search}
               onChange={e => setSearch(e.target.value)}
               placeholder="Buscar produto..."
               className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-slate-500"
            />
         </div>
         <button 
           onClick={() => setIsModalOpen(true)}
           className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium text-sm"
         >
           <Plus size={16} /> Novo Produto
         </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
         <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-xs">
               <tr>
                  <th className="p-4">Produto</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Estoque</th>
                  <th className="p-4">Custo</th>
                  <th className="p-4 text-right">Ações Rápidas</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {filtered.map(p => {
                 const isLow = p.currentStock <= p.minStock;
                 return (
                   <tr key={p.id} className="hover:bg-slate-50 transition group">
                      <td className="p-4">
                         <div className="font-bold text-slate-900">{p.name}</div>
                         <div className="text-xs text-slate-400">Min: {p.minStock} {p.unit}</div>
                      </td>
                      <td className="p-4">
                         <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${p.type === 'RETAIL' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                           {p.type === 'RETAIL' ? 'Venda' : 'Consumo'}
                         </span>
                      </td>
                      <td className="p-4">
                         <div className={`flex items-center gap-2 font-bold ${isLow ? 'text-red-600' : 'text-slate-700'}`}>
                            {isLow && <AlertTriangle size={14} />}
                            {p.currentStock} {p.unit}
                         </div>
                      </td>
                      <td className="p-4 text-slate-500">R$ {p.costPrice.toFixed(2)}</td>
                      <td className="p-4 text-right">
                         <div className="flex items-center justify-end gap-2">
                            <button 
                                onClick={() => handleStockAdjust(p.id, -1)} 
                                className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition bg-white"
                                title="Diminuir (-1)"
                            >
                                <Minus size={14} />
                            </button>
                            <button 
                                onClick={() => handleStockAdjust(p.id, 1)} 
                                className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition bg-white"
                                title="Aumentar (+1)"
                            >
                                <Plus size={14} />
                            </button>
                         </div>
                      </td>
                   </tr>
                 )
               })}
            </tbody>
         </table>
      </div>

      {isModalOpen && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in-up">
               <h3 className="font-bold text-lg mb-4 text-slate-900">Cadastrar Produto</h3>
               <div className="space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome</label>
                     <input className="w-full p-2 border rounded-lg" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
                        <select className="w-full p-2 border rounded-lg" value={newProd.type} onChange={e => setNewProd({...newProd, type: e.target.value as any})}>
                           <option value="CONSUMABLE">Consumo Interno</option>
                           <option value="RETAIL">Venda (Varejo)</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unidade</label>
                        <input className="w-full p-2 border rounded-lg" placeholder="ex: ml, un" value={newProd.unit} onChange={e => setNewProd({...newProd, unit: e.target.value})} />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preço Custo</label>
                        <input type="number" className="w-full p-2 border rounded-lg" value={newProd.costPrice} onChange={e => setNewProd({...newProd, costPrice: Number(e.target.value)})} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estoque Inicial</label>
                        <input type="number" className="w-full p-2 border rounded-lg" value={newProd.currentStock} onChange={e => setNewProd({...newProd, currentStock: Number(e.target.value)})} />
                     </div>
                  </div>
               </div>
               <div className="mt-6 flex gap-3">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancelar</button>
                  <button onClick={handleSaveProduct} className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-bold">Salvar</button>
               </div>
            </div>
         </div>
      )}
    </Layout>
  );
};

export default InventoryManager;
