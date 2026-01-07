
import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Phone,
  Briefcase,
  DollarSign,
  Edit,
  Trash2,
  X,
  HardHat,
  User,
  BadgeCheck,
  CalendarClock
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Employee, Quote } from '../../types';
import { formatCurrency } from '../../constants';

interface TeamManagerProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  quotes: Quote[];
  onDelete: (id: number) => void;
}

export const TeamManager: React.FC<TeamManagerProps> = ({ employees, setEmployees, quotes, onDelete }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Estado inicial tipado corretamente
  const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
    name: '',
    role: 'Marceneiro',
    phone: '',
    payRate: 0,
    payPeriod: 'Quinzena',
    activeProjectIds: [],
    status: 'Ativo'
  });

  // Filtra projetos válidos para alocação
  const activeQuotes = useMemo(() =>
    quotes.filter(q => q.status === 'approved' || q.status === 'pending'),
    [quotes]);

  const resetForm = () => {
    setFormData({
      name: '',
      role: 'Marceneiro',
      phone: '',
      payRate: 0,
      payPeriod: 'Quinzena',
      activeProjectIds: [],
      status: 'Ativo'
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (employee: Employee) => {
    setFormData({
      name: employee.name,
      role: employee.role,
      phone: employee.phone,
      payRate: employee.payRate,
      payPeriod: employee.payPeriod,
      activeProjectIds: employee.activeProjectIds || [], // Garante array
      status: employee.status
    });
    setEditingId(employee.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja remover este funcionário?')) {
      onDelete(id);
    }
  };

  const handleSave = () => {
    if (!formData.name) {
      alert("Por favor, informe o nome do funcionário.");
      return;
    }

    if (editingId) {
      setEmployees(prev => prev.map(e => e.id === editingId ? { ...formData, id: editingId } : e));
    } else {
      setEmployees(prev => [...prev, { ...formData, id: Date.now() }]);
    }
    resetForm();
  };

  const toggleProject = (quoteId: number) => {
    const current = formData.activeProjectIds || [];
    if (current.includes(quoteId)) {
      setFormData({ ...formData, activeProjectIds: current.filter(id => id !== quoteId) });
    } else {
      setFormData({ ...formData, activeProjectIds: [...current, quoteId] });
    }
  };

  // Cálculo de estimativa mensal
  const totalPayroll = useMemo(() => {
    return employees.reduce((acc, curr) => {
      if (curr.status === 'Inativo') return acc;
      let monthly = Number(curr.payRate);
      if (curr.payPeriod === 'Quinzena') monthly = curr.payRate * 2;
      if (curr.payPeriod === 'Semana') monthly = curr.payRate * 4;
      if (curr.payPeriod === 'Dia') monthly = curr.payRate * 20; // Estimativa de 20 dias úteis
      return acc + monthly;
    }, 0);
  }, [employees]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header e Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users className="text-amber-600" /> Gestão de Equipe
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie marceneiros, ajudantes e alocações.</p>
        </div>
        <div className="flex flex-col md:flex-row items-end md:items-center gap-4 w-full md:w-auto">
          <div className="text-right px-4 py-1 border-r border-slate-200 dark:border-slate-700 hidden md:block">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Funcionários Ativos</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{employees.filter(e => e.status === 'Ativo').length}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Folha Mensal (Est.)</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(totalPayroll)}</p>
          </div>
          <Button onClick={() => { resetForm(); setIsFormOpen(true); }} icon={UserPlus}>
            Novo
          </Button>
        </div>
      </div>

      {/* Grid de Funcionários */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {employees.map(employee => (
          <Card key={employee.id} className="relative overflow-hidden group hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: employee.role === 'Marceneiro' ? '#d97706' : '#64748b' }}>

            {/* Header do Card */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-md ${employee.role === 'Marceneiro' ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-slate-500 to-slate-600'}`}>
                  {employee.role === 'Marceneiro' ? <HardHat size={24} /> : <User size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{employee.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{employee.role}</span>
                    {employee.status === 'Inativo' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold border border-red-200">INATIVO</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(employee)}
                  className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(employee.id); }}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Informações de Contato e Pagamento */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><Phone size={14} /> Contato</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{employee.phone || "-"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><DollarSign size={14} /> Pagamento</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {formatCurrency(employee.payRate)} <span className="text-xs text-slate-400">/ {employee.payPeriod}</span>
                </span>
              </div>
            </div>

            {/* Projetos Ativos */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Briefcase size={12} /> Alocado em
              </p>
              <div className="flex flex-wrap gap-2">
                {employee.activeProjectIds && employee.activeProjectIds.length > 0 ? (
                  employee.activeProjectIds.map(pid => {
                    const quote = quotes.find(q => q.id === pid);
                    if (!quote) return null;
                    return (
                      <span key={pid} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        {quote.title}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-xs text-slate-400 italic">Disponível (Sem projetos)</span>
                )}
              </div>
            </div>
          </Card>
        ))}

        {/* Empty State */}
        {employees.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <Users size={48} className="mb-4 opacity-20" />
            <p>Nenhum funcionário cadastrado.</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsFormOpen(true)}>Cadastrar Equipe</Button>
          </div>
        )}
      </div>

      {/* Modal de Cadastro/Edição */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-slide-down max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {editingId ? 'Editar Colaborador' : 'Novo Colaborador'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Preencha os dados contratuais e pessoais.</p>
              </div>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-5">

              {/* Seção Pessoal */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-amber-600 uppercase tracking-wide border-b border-amber-100 dark:border-amber-900/30 pb-1 mb-2">Dados Pessoais</h4>
                <Input
                  label="Nome Completo"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Função / Cargo"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                  >
                    <option value="Marceneiro">Marceneiro</option>
                    <option value="Ajudante">Ajudante</option>
                    <option value="Outro">Outro</option>
                  </Select>
                  <Input
                    label="Telefone / WhatsApp"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Seção Financeira */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-amber-600 uppercase tracking-wide border-b border-amber-100 dark:border-amber-900/30 pb-1 mb-2">Financeiro</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Valor (R$)"
                    type="number"
                    placeholder="0,00"
                    value={formData.payRate || ''}
                    onChange={e => setFormData({ ...formData, payRate: Number(e.target.value) })}
                  />
                  <Select
                    label="Frequência de Pagamento"
                    value={formData.payPeriod}
                    onChange={e => setFormData({ ...formData, payPeriod: e.target.value as any })}
                  >
                    <option value="Dia">Diária (Por Dia)</option>
                    <option value="Semana">Semanal</option>
                    <option value="Quinzena">Quinzenal</option>
                    <option value="Mês">Mensal</option>
                  </Select>
                </div>
              </div>

              {/* Seção Alocação e Status */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-amber-600 uppercase tracking-wide border-b border-amber-100 dark:border-amber-900/30 pb-1 mb-2">Alocação</h4>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block">Status do Colaborador</label>
                  <Select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="Ativo">Ativo (Disponível)</option>
                    <option value="Inativo">Inativo (Indisponível)</option>
                  </Select>
                </div>

                <div className="mt-2">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block flex items-center gap-1">
                    <CalendarClock size={14} /> Vincular a Projetos Ativos
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-1 bg-slate-50 dark:bg-slate-900 custom-scrollbar">
                    {activeQuotes.length > 0 ? activeQuotes.map(quote => (
                      <div
                        key={quote.id}
                        onClick={() => toggleProject(quote.id)}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors border mb-1 last:mb-0 ${formData.activeProjectIds?.includes(quote.id)
                            ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                            : 'bg-white dark:bg-slate-800 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.activeProjectIds?.includes(quote.id)
                            ? 'bg-amber-600 border-amber-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                          }`}>
                          {formData.activeProjectIds?.includes(quote.id) && <BadgeCheck size={12} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{quote.title}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{quote.client}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-4 text-xs text-slate-400">Nenhum projeto pendente ou aprovado disponível.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-100 dark:border-slate-800 mt-4">
                <Button variant="secondary" onClick={resetForm} className="flex-1">Cancelar</Button>
                <Button onClick={handleSave} className="flex-1">{editingId ? 'Salvar Alterações' : 'Cadastrar Colaborador'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
