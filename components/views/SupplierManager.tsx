
import React, { useState } from 'react';
import { Truck, Plus, Trash2, Phone, MapPin, User, Edit, Save, X, Building2, MessageCircle, UserPlus, Search } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Supplier, Salesperson } from '../../types';

interface SupplierManagerProps {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  salespeople: Salesperson[];
  setSalespeople: React.Dispatch<React.SetStateAction<Salesperson[]>>;
}

export const SupplierManager: React.FC<SupplierManagerProps> = ({ 
  suppliers, 
  setSuppliers, 
  salespeople, 
  setSalespeople 
}) => {
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierFormData, setSupplierFormData] = useState<Omit<Supplier, 'id'>>({ name: '', address: '' });
  
  const [newSalesperson, setNewSalesperson] = useState({ name: '', phone: '' });
  const [addingToSupplierId, setAddingToSupplierId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSaveSupplier = () => {
    if (!supplierFormData.name) return;
    setSuppliers(prev => [...prev, { ...supplierFormData, id: Date.now() }]);
    setSupplierFormData({ name: '', address: '' });
    setIsSupplierModalOpen(false);
  };

  const handleDeleteSupplier = (id: number) => {
    if(window.confirm('ATENÇÃO: Isso excluirá esta madeireira e todos os seus vendedores vinculados. Deseja continuar?')) {
      setSuppliers(prev => prev.filter(s => String(s.id) !== String(id)));
      setSalespeople(prev => prev.filter(sp => String(sp.supplierId) !== String(id)));
    }
  };

  const handleSaveSalesperson = (supplierId: number) => {
    if (!newSalesperson.name || !newSalesperson.phone) return;
    
    setSalespeople(prev => [...prev, { 
      id: Date.now(), 
      supplierId, 
      name: newSalesperson.name, 
      phone: newSalesperson.phone // Mantemos a formatação visual se o usuário digitar
    }]);
    
    setNewSalesperson({ name: '', phone: '' });
    setAddingToSupplierId(null);
  };

  const handleDeleteSalesperson = (id: number) => {
    if(window.confirm('Remover este vendedor?')) {
        setSalespeople(prev => prev.filter(sp => String(sp.id) !== String(id)));
    }
  };

  const openWhatsApp = (phone: string) => {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone) {
          window.open(`https://wa.me/55${cleanPhone}`, '_blank');
      }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.address && s.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
             <Truck className="text-amber-600" /> Rede de Fornecedores
           </h2>
           <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie madeireiras parceiras e contatos comerciais.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  className="pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none text-sm w-full"
                  placeholder="Buscar fornecedor..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <Button onClick={() => setIsSupplierModalOpen(true)} icon={Plus}>Nova Madeireira</Button>
        </div>
      </div>

      {/* Grid de Fornecedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSuppliers.map(supplier => {
          const supplierSalespeople = salespeople.filter(sp => String(sp.supplierId) === String(supplier.id));

          return (
            <Card key={supplier.id} className="flex flex-col h-full border-t-4 border-t-amber-500 hover:shadow-lg transition-all duration-200">
               {/* Cabeçalho do Card */}
               <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                     <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <Building2 size={20} />
                     </div>
                     <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight">{supplier.name}</h3>
                        {supplier.address ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1 mt-1">
                            <MapPin size={12} className="mt-0.5 shrink-0" /> {supplier.address}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 italic mt-1">Endereço não informado</p>
                        )}
                     </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteSupplier(supplier.id); }}
                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                    title="Excluir Fornecedor"
                  >
                    <Trash2 size={16} />
                  </button>
               </div>

               {/* Seção de Vendedores */}
               <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                     <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
                       <User size={12} /> Contatos ({supplierSalespeople.length})
                     </p>
                     {addingToSupplierId !== supplier.id && (
                       <button 
                         onClick={() => setAddingToSupplierId(supplier.id)} 
                         className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 hover:bg-amber-50 dark:hover:bg-amber-900/20 px-2 py-1 rounded transition-colors"
                       >
                         <UserPlus size={14} /> Adicionar
                       </button>
                     )}
                  </div>

                  {/* Formulário Inline de Vendedor */}
                  {addingToSupplierId === supplier.id && (
                     <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 mb-3 animate-slide-down shadow-lg relative z-10">
                        <p className="text-xs font-bold text-amber-600 mb-2">Novo Vendedor</p>
                        <div className="space-y-2 mb-3">
                           <input 
                             placeholder="Nome do Vendedor" 
                             className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                             value={newSalesperson.name}
                             onChange={e => setNewSalesperson({...newSalesperson, name: e.target.value})}
                             autoFocus
                           />
                           <input 
                             placeholder="WhatsApp (DDD + Número)" 
                             className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                             value={newSalesperson.phone}
                             onChange={e => setNewSalesperson({...newSalesperson, phone: e.target.value})}
                           />
                        </div>
                        <div className="flex gap-2 justify-end">
                           <Button variant="secondary" onClick={() => setAddingToSupplierId(null)} className="py-1 px-3 text-xs h-8">Cancelar</Button>
                           <Button onClick={() => handleSaveSalesperson(supplier.id)} className="py-1 px-3 text-xs h-8">Salvar</Button>
                        </div>
                     </div>
                  )}

                  {/* Lista de Vendedores */}
                  <div className="space-y-2 flex-1 overflow-y-auto max-h-[200px] custom-scrollbar pr-1">
                     {supplierSalespeople.length > 0 ? supplierSalespeople.map(sp => (
                       <div key={sp.id} className="group flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-900/50 transition-colors">
                          <div className="min-w-0">
                             <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{sp.name}</p>
                             <div className="flex items-center gap-1 mt-0.5">
                                <Phone size={10} className="text-slate-400" />
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{sp.phone}</p>
                             </div>
                          </div>
                          <div className="flex gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={() => openWhatsApp(sp.phone)}
                                className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 rounded transition-colors"
                                title="Abrir WhatsApp"
                             >
                                <MessageCircle size={14} />
                             </button>
                             <button 
                                onClick={() => handleDeleteSalesperson(sp.id)} 
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Remover"
                             >
                                <X size={14} />
                             </button>
                          </div>
                       </div>
                     )) : (
                       <div className="h-full flex flex-col items-center justify-center text-slate-400 py-4">
                          <User size={24} className="mb-2 opacity-20" />
                          <p className="text-xs italic">Nenhum vendedor cadastrado.</p>
                       </div>
                     )}
                  </div>
               </div>
            </Card>
          );
        })}

        {/* Empty State */}
        {filteredSuppliers.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Truck size={48} className="mb-4 opacity-20" />
                <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">Nenhum fornecedor encontrado</h3>
                <p className="text-sm text-slate-500 dark:text-slate-500 mb-6 max-w-sm text-center">Cadastre suas madeireiras parceiras para agilizar os pedidos de orçamento.</p>
                <Button onClick={() => setIsSupplierModalOpen(true)} icon={Plus}>Cadastrar Primeiro Fornecedor</Button>
            </div>
        )}
      </div>

      {/* Modal Nova Madeireira */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-down border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Nova Madeireira</h3>
                <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X size={24} />
                </button>
            </div>
            
            <div className="space-y-4">
              <Input 
                label="Nome da Empresa" 
                placeholder="Ex: Madeireira Central"
                value={supplierFormData.name} 
                onChange={e => setSupplierFormData({...supplierFormData, name: e.target.value})}
                autoFocus
              />
              <Input 
                label="Endereço (Opcional)" 
                placeholder="Rua, Número, Bairro..."
                value={supplierFormData.address} 
                onChange={e => setSupplierFormData({...supplierFormData, address: e.target.value})}
              />
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                 Dica: Após criar a madeireira, você poderá adicionar os contatos dos vendedores dentro do card.
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setIsSupplierModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveSupplier} icon={Save}>Salvar Fornecedor</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
