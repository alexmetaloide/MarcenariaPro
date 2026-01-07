
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Wallet, 
  FileText, 
  Scissors,
  Users,
  Briefcase,
  Truck,
  Settings,
  Sun,
  Moon,
  LogOut,
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { ViewTab, User, ConnectionStatus } from '../types';
import { Logo } from './ui/Logo';

interface SidebarProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  className?: string;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
  currentUser?: User | null;
  onLogout?: () => void;
  connectionStatus?: ConnectionStatus;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  className = "", 
  isDarkMode, 
  toggleTheme,
  currentUser,
  onLogout,
  connectionStatus = 'connected'
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'projects', label: 'Projetos', icon: Briefcase },
    { id: 'quotes', label: 'Orçamentos', icon: FileText },
    { id: 'stock', label: 'Estoque', icon: Package },
    { id: 'cutplan', label: 'Plano de Corte', icon: Scissors },
    { id: 'suppliers', label: 'Fornecedores', icon: Truck },
    { id: 'finance', label: 'Financeiro', icon: Wallet },
    { id: 'team', label: 'Equipe', icon: Users },
  ];

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'loading': return <RefreshCw size={14} className="animate-spin text-amber-500" />;
      case 'saving': return <RefreshCw size={14} className="animate-spin text-blue-400" />;
      case 'error': return <CloudOff size={14} className="text-red-500" />;
      case 'connected': return <CheckCircle2 size={14} className="text-green-500" />;
      default: return <Cloud size={14} className="text-slate-500" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'loading': return 'Carregando...';
      case 'saving': return 'Salvando...';
      case 'error': return 'Erro de Conexão';
      case 'connected': return 'Online / Salvo';
      default: return 'Offline';
    }
  };

  return (
    <aside className={`flex flex-col w-64 bg-[#0f172a] text-slate-300 border-r border-slate-800 ${className}`}>
      <div className="p-6 pb-2">
        <div className="flex items-center gap-2 mb-1">
           <Logo size={32} />
           <h1 className="text-2xl font-extrabold text-white tracking-tight">
             Marcenaria<span className="text-amber-500">Pro</span>
           </h1>
        </div>
        <p className="text-xs text-slate-500 mt-2 font-medium ml-1">Sistema de Gestão Integrado</p>
      </div>

      <div className="px-4 py-2">
        <div className="h-px bg-slate-800 w-full"></div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as ViewTab)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
              activeTab === item.id 
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-900/20 translate-x-1' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-amber-500 transition-colors'} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto space-y-2">
        <div className="h-px bg-slate-800 w-full mb-4"></div>
        
        {/* Status Connection Indicator */}
        <div className="px-4 py-2 mb-2 flex items-center justify-between text-xs bg-slate-900/50 rounded-lg border border-slate-800/50">
           <span className="text-slate-500">Banco de Dados</span>
           <div className="flex items-center gap-2" title={getStatusText()}>
              <span className={`text-[10px] ${connectionStatus === 'error' ? 'text-red-400' : 'text-slate-400'}`}>
                {getStatusText()}
              </span>
              {getStatusIcon()}
           </div>
        </div>

        <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
        >
          <Settings size={18} />
          Configurações
        </button>

        {toggleTheme && (
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-slate-400 hover:bg-slate-800/50 hover:text-white"
          >
            {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
          </button>
        )}

        <div className="mt-4 bg-slate-800/50 rounded-xl p-3 flex items-center justify-between border border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-inner">
              {currentUser?.name?.charAt(0) || 'M'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{currentUser?.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Logado</p>
            </div>
          </div>
          
          {onLogout && (
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Sair do Sistema"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
