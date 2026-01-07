
import React from 'react';
import { 
  Wallet, 
  FileText, 
  AlertTriangle, 
  Package,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import { Card } from '../ui/Card';
import { InventoryItem, Transaction, Quote, ViewTab } from '../../types';
import { formatCurrency } from '../../constants';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface DashboardProps {
  inventory: InventoryItem[];
  transactions: Transaction[];
  quotes: Quote[];
  onNavigate?: (tab: ViewTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ inventory, transactions, quotes, onNavigate }) => {
  // --- Cálculos Gerais ---
  const totalRevenue = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
  
  const balance = totalRevenue - totalExpenses;
  const lowStock = inventory.filter(i => i.quantity < (i.minStock || 5)).length;
  const pendingQuotes = quotes.filter(q => q.status === 'pending').length;

  // --- Cálculos de Período (Dia e Semana) ---
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() - todayStart.getDay());

  let dayIncome = 0;
  let dayExpense = 0;
  let weekIncome = 0;
  let weekExpense = 0;

  transactions.forEach(t => {
    const [y, m, d] = t.date.split('-').map(Number);
    const tDate = new Date(y, m - 1, d);

    if (tDate.getTime() === todayStart.getTime()) {
      if (t.type === 'income') dayIncome += t.amount;
      else dayExpense += Math.abs(t.amount);
    }

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    
    if (tDate >= weekStart && tDate < weekEnd) {
      if (t.type === 'income') weekIncome += t.amount;
      else weekExpense += Math.abs(t.amount);
    }
  });

  // Prepare chart data
  const chartData = [
    { name: 'Receita', value: totalRevenue, color: '#16a34a' },
    { name: 'Despesas', value: totalExpenses, color: '#dc2626' },
    { name: 'Saldo', value: balance, color: balance >= 0 ? '#ca8a04' : '#991b1b' }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Visão Geral</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Bem-vindo ao seu painel de controle.</p>
        </div>
        <div className="text-sm text-slate-500 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
           {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      
      {/* Cartões Principais - Estilo Moderno com Gradiente */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Saldo */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wallet size={80} />
           </div>
           <div className="relative z-10">
              <p className="text-emerald-100 font-medium mb-1 flex items-center gap-2">Saldo Atual</p>
              <p className="text-3xl font-bold tracking-tight">{formatCurrency(balance)}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium bg-emerald-800/30 px-2 py-1 rounded-lg">
                <TrendingUp size={14} /> Caixa Disponível
              </div>
           </div>
        </div>

        {/* Card Faturamento */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Package size={80} />
           </div>
           <div className="relative z-10">
              <p className="text-blue-100 font-medium mb-1">Faturamento Total</p>
              <p className="text-3xl font-bold tracking-tight">{formatCurrency(totalRevenue)}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium bg-blue-800/30 px-2 py-1 rounded-lg">
                <ArrowRight size={14} /> Ver Relatórios
              </div>
           </div>
        </div>

        {/* Card Orçamentos */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/20 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileText size={80} />
           </div>
           <div className="relative z-10">
              <p className="text-amber-100 font-medium mb-1">Orçamentos Pendentes</p>
              <p className="text-3xl font-bold tracking-tight">{pendingQuotes}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium bg-amber-800/30 px-2 py-1 rounded-lg">
                Aguardando Aprovação
              </div>
           </div>
        </div>

        {/* Card Alerta Estoque */}
        <div className={`rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 ${lowStock > 0 ? 'bg-gradient-to-br from-rose-500 to-red-700 shadow-rose-500/20' : 'bg-gradient-to-br from-slate-500 to-slate-700'}`}>
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <AlertTriangle size={80} />
           </div>
           <div className="relative z-10">
              <p className="text-rose-100 font-medium mb-1">Alerta de Estoque</p>
              <p className="text-3xl font-bold tracking-tight">{lowStock}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-1 rounded-lg">
                {lowStock > 0 ? 'Itens precisam de reposição' : 'Estoque Saudável'}
              </div>
           </div>
        </div>
      </div>

      {/* Resumo Rápido (Dia / Semana) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hoje */}
        <Card className="border-none shadow-md">
          <div className="flex items-center gap-2 mb-6">
             <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Clock size={20} />
             </div>
             <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Resumo de Hoje</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div> Entradas
                </p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(dayIncome)}</p>
             </div>
             <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div> Saídas
                </p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(dayExpense)}</p>
             </div>
          </div>
        </Card>

        {/* Esta Semana */}
        <Card className="border-none shadow-md">
          <div className="flex items-center gap-2 mb-6">
             <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg text-violet-600 dark:text-violet-400">
                <Calendar size={20} />
             </div>
             <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Esta Semana</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div> Entradas
                </p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(weekIncome)}</p>
             </div>
             <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div> Saídas
                </p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(weekExpense)}</p>
             </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col border-none shadow-md">
           <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-6">Fluxo Financeiro</h3>
           <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: '#1e293b',
                    color: '#f8fafc',
                    padding: '12px'
                  }}
                  itemStyle={{ color: '#f8fafc' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
           </div>
        </Card>

        <Card className="border-none shadow-md">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-6">Itens com Baixo Estoque</h3>
          <div className="space-y-3">
            {inventory.filter(i => i.quantity < (i.minStock || 5)).map(item => (
              <div key={item.id} className="flex justify-between items-center p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/30 transition-all hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 dark:bg-rose-800/30 rounded-lg text-rose-600 dark:text-rose-400">
                     <AlertTriangle size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-rose-600 dark:text-rose-400 text-lg">{item.quantity} {item.unit}</span>
                  <p className="text-[10px] text-rose-400 dark:text-rose-300 uppercase font-bold tracking-wide">Repor urgente</p>
                </div>
              </div>
            ))}
            {inventory.filter(i => i.quantity < (i.minStock || 5)).length === 0 && (
              <div className="flex flex-col items-center justify-center h-56 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full mb-3 text-green-600 dark:text-green-400">
                   <Package size={32} />
                </div>
                <p className="font-medium">Estoque saudável!</p>
                <p className="text-sm opacity-70">Nenhum item em nível crítico.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-6">Movimentações Recentes</h3>
        <div className="space-y-3">
          {transactions.slice(0, 5).map(t => (
            <div key={t.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
              <div className="flex items-center gap-4">
                 <div className={`p-3 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {t.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                 </div>
                 <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{t.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">{t.category}</span>
                      <span className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                 </div>
              </div>
              <span className={`font-bold text-lg ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-slate-800 dark:text-slate-300'}`}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(t.amount))}
              </span>
            </div>
          ))}
          {transactions.length === 0 && <p className="text-slate-500 dark:text-slate-400 text-center py-8">Nenhuma movimentação registrada.</p>}
        </div>
      </Card>
    </div>
  );
};
