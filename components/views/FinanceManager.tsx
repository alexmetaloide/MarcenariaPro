import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Transaction } from '../../types';
import { formatCurrency } from '../../constants';

interface FinanceManagerProps {
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  onDelete: (id: number) => void;
}

export const FinanceManager: React.FC<FinanceManagerProps> = ({ transactions, setTransactions, onDelete }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: 'Utilidades',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount) return;
    const amountVal = Math.abs(Number(newTransaction.amount));
    if (isNaN(amountVal)) return;

    const amount = newTransaction.type === 'expense' ? -amountVal : amountVal;

    if (editingId) {
      setTransactions(transactions.map(t => t.id === editingId ? { ...newTransaction, id: editingId, amount } : t));
      setEditingId(null);
    } else {
      setTransactions([{
        ...newTransaction,
        id: Date.now(),
        amount
      }, ...transactions]);
    }

    setNewTransaction({
      description: '',
      amount: '',
      type: 'expense',
      category: 'Utilidades',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleEdit = (t: Transaction) => {
    setEditingId(t.id);
    setNewTransaction({
      description: t.description,
      amount: Math.abs(t.amount).toString(),
      type: t.type,
      category: t.category,
      date: t.date
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta movimentação?')) {
      onDelete(id);
      if (editingId === id) {
        setEditingId(null);
        setNewTransaction({
          description: '',
          amount: '',
          type: 'expense',
          category: 'Utilidades',
          date: new Date().toISOString().split('T')[0]
        });
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800">Financeiro</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <h3 className="font-bold mb-4 text-slate-700">{editingId ? 'Editar Movimentação' : 'Nova Movimentação'}</h3>
          <div className="space-y-4">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
              <button
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${newTransaction.type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500'}`}
                onClick={() => setNewTransaction({ ...newTransaction, type: 'income', category: 'Vendas' })}
              >
                Entrada
              </button>
              <button
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${newTransaction.type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}
                onClick={() => setNewTransaction({ ...newTransaction, type: 'expense', category: 'Utilidades' })}
              >
                Saída
              </button>
            </div>

            <Input
              label="Descrição"
              placeholder="Ex: Conta de Luz, Cliente X..."
              value={newTransaction.description}
              onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Valor (R$)"
                type="number"
                value={newTransaction.amount}
                onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              />
              <Input
                label="Data"
                type="date"
                value={newTransaction.date}
                onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
              />
            </div>

            <Select
              label="Categoria"
              value={newTransaction.category}
              onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}
            >
              {newTransaction.type === 'expense' ? (
                <>
                  <option value="Utilidades">Água/Luz/Internet</option>
                  <option value="Salários">Pagamento Funcionários</option>
                  <option value="Salário Marceneiro">Salário Marceneiro</option>
                  <option value="Salário Ajudante">Salário Ajudante</option>
                  <option value="Materiais">Compra de Material</option>
                  <option value="Manutenção">Manutenção de Máquinas</option>
                  <option value="Frete">Frete / Entregas</option>
                  <option value="Combustível">Combustível</option>
                </>
              ) : (
                <>
                  <option value="Vendas">Venda de Móveis</option>
                  <option value="Serviços">Serviços de Instalação</option>
                </>
              )}
            </Select>

            <div className="flex gap-2">
              <Button onClick={handleAddTransaction} className="flex-1 justify-center">
                {editingId ? 'Salvar' : 'Registrar'}
              </Button>
              {editingId && (
                <Button variant="ghost" onClick={() => {
                  setEditingId(null);
                  setNewTransaction({
                    description: '',
                    amount: '',
                    type: 'expense',
                    category: 'Utilidades',
                    date: new Date().toISOString().split('T')[0]
                  });
                }}>
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-bold mb-4 text-slate-700">Histórico de Lançamentos</h3>
          <div className="overflow-auto max-h-[500px]">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white border-b border-slate-200">
                <tr>
                  <th className="pb-3 pl-2">Data</th>
                  <th className="pb-3">Descrição</th>
                  <th className="pb-3">Categoria</th>
                  <th className="pb-3 text-right">Valor</th>
                  <th className="pb-3 text-right pr-2">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-3 pl-2 text-slate-500">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 font-medium text-slate-800">{t.description}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {t.category}
                      </span>
                    </td>
                    <td className={`py-3 text-right font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-1 text-slate-400 hover:text-amber-600 transition-colors"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};