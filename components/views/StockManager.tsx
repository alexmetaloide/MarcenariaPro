
import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Search,
  Layers,
  Hammer,
  Droplet,
  Box,
  X,
  TrendingUp,
  AlertCircle,
  Package,
  Pencil,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { InventoryItem } from '../../types';
import { formatCurrency, CATEGORIES } from '../../constants';
import { StockAIChatModal, ExtractedItem } from './StockAIChatModal';

interface StockManagerProps {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  onDelete: (id: number) => void;
}

export const StockManager: React.FC<StockManagerProps> = ({ inventory, setInventory, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // AI Modal State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id'>>({
    name: '',
    category: 'Chapas',
    quantity: 0,
    price: 0,
    unit: 'un',
    minStock: 5
  });

  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'Chapas': return <Layers size={18} className="text-amber-600 dark:text-amber-400" />;
      case 'Ferragens': return <Hammer size={18} className="text-slate-600 dark:text-slate-300" />;
      case 'Insumos': return <Droplet size={18} className="text-blue-600 dark:text-blue-400" />;
      default: return <Box size={18} className="text-emerald-600 dark:text-emerald-400" />;
    }
  };

  const resetForm = () => {
    setNewItem({ name: '', category: 'Chapas', quantity: 0, price: 0, unit: 'un', minStock: 5 });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setNewItem({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      price: item.price,
      unit: item.unit,
      minStock: item.minStock || 5
    });
    setIsFormOpen(true);
  };

  const handleSaveItem = () => {
    if (!newItem.name) return;

    if (editingId) {
      setInventory(prev => prev.map(item =>
        item.id === editingId
          ? { ...newItem, id: editingId }
          : item
      ));
    } else {
      setInventory(prev => [...prev, { ...newItem, id: Date.now() }]);
    }

    resetForm();
  };

  const handleAIImport = (items: ExtractedItem[]) => {
    // Convert extracted items to inventory items and add them
    const newItems: InventoryItem[] = items.map((item, index) => ({
      id: Date.now() + index,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      price: item.price,
      unit: item.unit,
      minStock: 5 // Default min stock
    }));

    setInventory(prev => [...prev, ...newItems]);
    setIsAIModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      onDelete(id);
      if (editingId === id) resetForm();
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm('ATENÇÃO: Isso excluirá TODOS os itens do seu estoque permanentemente. Deseja continuar?')) {
      setInventory([]);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "Todos" || item.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const totalItems = inventory.length;
  const stockValue = inventory.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const lowStockCount = inventory.filter(i => i.quantity <= (i.minStock || 5)).length;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* AI Chat Modal */}
      <StockAIChatModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onImport={handleAIImport}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 py-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400"><Package size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total de Itens</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{totalItems}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 py-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400"><TrendingUp size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Valor em Estoque</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(stockValue)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 py-4">
          <div className={`p-3 rounded-full ${lowStockCount > 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-300'}`}>
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Itens em Alerta</p>
            <p className={`text-xl font-bold ${lowStockCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-100'}`}>
              {lowStockCount} <span className="text-xs font-normal text-slate-400">precisam reposição</span>
            </p>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Gerenciar Estoque</h2>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setIsAIModalOpen(true)}
            icon={Sparkles}
            className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:border-purple-900/30 dark:hover:bg-purple-900/20"
          >
            Importar com IA
          </Button>
          {inventory.length > 0 && (
            <Button variant="danger" onClick={handleDeleteAll} icon={Trash2}>
              Limpar Tudo
            </Button>
          )}
          <Button onClick={() => { resetForm(); setIsFormOpen(!isFormOpen); }} icon={Plus}>Novo Item</Button>
        </div>
      </div>

      {isFormOpen && (
        <Card className="bg-slate-50 dark:bg-slate-900 border-amber-200 dark:border-amber-900 animate-slide-down">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-amber-800 dark:text-amber-500 flex items-center gap-2">
              {editingId ? <Pencil size={18} /> : <Plus size={18} />}
              {editingId ? 'Editar Material' : 'Cadastrar Novo Material'}
            </h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <Input label="Nome do Material" placeholder="Ex: MDF Branco 1.5cm..." value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Select label="Categoria" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Input label="Qtd. Atual" type="number" value={newItem.quantity || ''} onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })} />
            </div>
            <div className="md:col-span-2">
              <Select label="Unidade" value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })}>
                <option value="un">Unidade (un)</option>
                <option value="cm">Centímetro (cm)</option>
                <option value="cm²">Centímetro Quad. (cm²)</option>
                <option value="m">Metro Linear (m)</option>
                <option value="m²">Metro Quad. (m²)</option>
                <option value="par">Par</option>
                <option value="L">Litro (L)</option>
                <option value="kg">Quilo (kg)</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Input label="Custo Unit. (R$)" type="number" value={newItem.price || ''} onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })} />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-700 pt-4">
            <Button variant="secondary" onClick={resetForm}>Cancelar</Button>
            <Button onClick={handleSaveItem}>
              {editingId ? 'Atualizar Item' : 'Salvar no Estoque'}
            </Button>
          </div>
        </Card>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-slate-900">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            <button
              onClick={() => setActiveFilter("Todos")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === 'Todos' ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              Todos
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${activeFilter === cat.id ? 'bg-amber-600 text-white shadow-sm' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                {getCategoryIcon(cat.id)}
                {cat.id}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all w-full text-sm bg-white text-slate-900 placeholder-slate-500"
              placeholder="Buscar material..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-medium border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4 w-12"></th>
                <th className="p-4">Item</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Quantidade</th>
                <th className="p-4 text-right">Valor Unit.</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredInventory.map(item => {
                const isLowStock = item.quantity <= (item.minStock || 5);
                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="p-4 text-center">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        {getCategoryIcon(item.category)}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.category}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1 ${isLowStock ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${isLowStock ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        {isLowStock ? 'Crítico' : 'OK'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{item.quantity}</span>
                      <span className="text-slate-400 ml-1 text-xs">{item.unit}</span>
                    </td>
                    <td className="p-4 text-right text-slate-600 dark:text-slate-400">{formatCurrency(item.price)}</td>
                    <td className="p-4 text-right font-medium text-slate-800 dark:text-slate-200">{formatCurrency(item.price * item.quantity)}</td>
                    <td className="p-4 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 p-2 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors" title="Editar Item">
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Excluir Item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Package size={48} className="text-slate-200 dark:text-slate-700 mb-4" />
                      <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300 mb-2">Comece adicionando materiais</h3>
                      <p className="max-w-md text-center text-sm mb-6">
                        Cadastre MDF, fitas de borda, ferragens e insumos. Isso permitirá calcular orçamentos precisos e gerar planos de corte automáticos.
                      </p>
                      <Button onClick={() => { resetForm(); setIsFormOpen(true); }} icon={Plus}>Cadastrar Primeiro Material</Button>
                      <Button variant="outline" className="mt-2 text-purple-600 border-purple-200" onClick={() => setIsAIModalOpen(true)} icon={Sparkles}>Importar Lista via PDF</Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
