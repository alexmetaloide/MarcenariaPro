
import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Package,
  LayoutDashboard,
  Wallet,
  FileText,
  Scissors,
  Users,
  Briefcase,
  Truck,
  Loader2
} from 'lucide-react';

import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/views/Dashboard';
import { StockManager } from './components/views/StockManager';
import { FinanceManager } from './components/views/FinanceManager';
import { QuoteBuilder } from './components/views/QuoteBuilder';
import { CutPlanEstimator } from './components/views/CutPlanEstimator';
import { TeamManager } from './components/views/TeamManager';
import { ProjectManager } from './components/views/ProjectManager';
import { SupplierManager } from './components/views/SupplierManager';
import { SettingsManager } from './components/views/SettingsManager';
import { AuthView } from './components/views/AuthView';

import { ViewTab, User, InventoryItem, Transaction, Quote, Employee, Supplier, Salesperson, CompanyProfile, ConnectionStatus } from './types';
import { supabase } from './lib/supabaseClient';
import { INITIAL_COMPANY_PROFILE } from './constants';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [quoteToEditId, setQuoteToEditId] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('loading');

  // Ref to track if data has been loaded initially to avoid echoing back to DB immediately
  const isDataLoaded = useRef(false);

  // Global Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('marcenariapro_theme');
    return savedTheme === 'dark';
  });

  // Data States
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(INITIAL_COMPANY_PROFILE);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('marcenariapro_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('marcenariapro_theme', 'light');
    }
  }, [isDarkMode]);

  // --- Auth & Data Fetching Logic ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoadingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch data when session exists
  useEffect(() => {
    if (session) {
      setConnectionStatus('loading');
      const fetchData = async () => {
        try {
          // Parallel fetching for performance
          const [
            { data: inv },
            { data: trans },
            { data: qts },
            { data: emp },
            { data: sup },
            { data: sp },
            { data: cp }
          ] = await Promise.all([
            supabase.from('inventory').select('*'),
            supabase.from('transactions').select('*'),
            supabase.from('quotes').select('*'),
            supabase.from('employees').select('*'),
            supabase.from('suppliers').select('*'),
            supabase.from('salespeople').select('*'),
            supabase.from('company_profile').select('*').single()
          ]);

          if (inv) setInventory(inv);
          if (trans) setTransactions(trans);
          if (qts) setQuotes(qts);
          if (emp) setEmployees(emp);
          if (sup) setSuppliers(sup);
          if (sp) setSalespeople(sp);
          if (cp) setCompanyProfile(cp);

          setConnectionStatus('connected');
          // Mark data as loaded after a short delay to ensure state updates don't trigger immediate save
          setTimeout(() => { isDataLoaded.current = true; }, 1000);

        } catch (error) {
          console.error("Erro ao carregar dados:", error);
          setConnectionStatus('error');
        }
      };
      fetchData();
    }
  }, [session]);

  // --- Syncing Logic ---
  const handleSaveStatus = (error: any) => {
    if (error) {
      console.error('Erro ao salvar:', JSON.stringify(error, null, 2));
      setConnectionStatus('error');
    } else {
      setConnectionStatus('connected');
    }
  };

  // Debounce helpers
  useEffect(() => {
    if (!session || !isDataLoaded.current || inventory.length === 0) return;
    const timer = setTimeout(() => {
      setConnectionStatus('saving');
      const payload = inventory.map(i => ({ ...i, user_id: session.user.id }));
      supabase.from('inventory').upsert(payload).then(({ error }) => handleSaveStatus(error));
    }, 2000);
    return () => clearTimeout(timer);
  }, [inventory, session]);

  useEffect(() => {
    if (!session || !isDataLoaded.current || transactions.length === 0) return;
    const timer = setTimeout(() => {
      setConnectionStatus('saving');
      const payload = transactions.map(t => ({ ...t, user_id: session.user.id }));
      supabase.from('transactions').upsert(payload).then(({ error }) => handleSaveStatus(error));
    }, 2000);
    return () => clearTimeout(timer);
  }, [transactions, session]);

  useEffect(() => {
    if (!session || !isDataLoaded.current || quotes.length === 0) return;
    const timer = setTimeout(() => {
      setConnectionStatus('saving');
      const payload = quotes.map(q => ({ ...q, user_id: session.user.id }));
      supabase.from('quotes').upsert(payload).then(({ error }) => handleSaveStatus(error));
    }, 2000);
    return () => clearTimeout(timer);
  }, [quotes, session]);

  useEffect(() => {
    if (!session || !isDataLoaded.current || employees.length === 0) return;
    const timer = setTimeout(() => {
      setConnectionStatus('saving');
      const payload = employees.map(e => ({ ...e, user_id: session.user.id }));
      supabase.from('employees').upsert(payload).then(({ error }) => handleSaveStatus(error));
    }, 2000);
    return () => clearTimeout(timer);
  }, [employees, session]);

  useEffect(() => {
    if (!session || !isDataLoaded.current || suppliers.length === 0) return;
    const timer = setTimeout(() => {
      setConnectionStatus('saving');
      const payload = suppliers.map(s => ({ ...s, user_id: session.user.id }));
      supabase.from('suppliers').upsert(payload).then(({ error }) => handleSaveStatus(error));
    }, 2000);
    return () => clearTimeout(timer);
  }, [suppliers, session]);

  useEffect(() => {
    if (!session || !isDataLoaded.current || salespeople.length === 0) return;
    const timer = setTimeout(() => {
      setConnectionStatus('saving');
      const payload = salespeople.map(s => ({ ...s, user_id: session.user.id }));
      supabase.from('salespeople').upsert(payload).then(({ error }) => handleSaveStatus(error));
    }, 2000);
    return () => clearTimeout(timer);
  }, [salespeople, session]);

  useEffect(() => {
    if (!session || !isDataLoaded.current || !companyProfile.name) return;
    const timer = setTimeout(async () => {
      setConnectionStatus('saving');
      const payload = { ...companyProfile, user_id: session.user.id };

      // Manual Upsert Logic to avoid 42P10 error if user_id is not a unique constraint in DB
      let error = null;
      let data = null;

      try {
        if (companyProfile.id) {
          // Update existing by PK
          const res = await supabase.from('company_profile').update(payload).eq('id', companyProfile.id).select().single();
          error = res.error;
          data = res.data;
        } else {
          // Check if exists by user_id
          const { data: existing, error: fetchError } = await supabase
            .from('company_profile')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (fetchError) throw fetchError;

          if (existing) {
            // Exists, update it
            const res = await supabase.from('company_profile').update(payload).eq('id', existing.id).select().single();
            error = res.error;
            data = res.data;
            if (data && !companyProfile.id) setCompanyProfile(prev => ({ ...prev, id: data.id }));
          } else {
            // Does not exist, insert
            const res = await supabase.from('company_profile').insert(payload).select().single();
            error = res.error;
            data = res.data;
            if (data && !companyProfile.id) setCompanyProfile(prev => ({ ...prev, id: data.id }));
          }
        }
      } catch (err: any) {
        error = err;
        console.error("Error saving profile:", err);
      }

      handleSaveStatus(error);
    }, 2000);
    return () => clearTimeout(timer);
  }, [companyProfile, session]);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setInventory([]);
    setTransactions([]);
    setQuotes([]);
    isDataLoaded.current = false;
  };

  const handleEditProject = (quoteId: number) => {
    setQuoteToEditId(quoteId);
    setActiveTab('quotes');
  };

  if (isLoadingAuth) {
    return <div className="h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950"><Loader2 className="animate-spin text-amber-600" size={40} /></div>;
  }

  if (!session) {
    return <AuthView onLogin={() => { }} />;
  }

  const currentUserUser: User = {
    id: session.user.id,
    name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
    email: session.user.email || ''
  };

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

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar Desktop */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        className="hidden md:flex"
        currentUser={currentUserUser}
        onLogout={handleLogout}
        connectionStatus={connectionStatus}
      />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-50 flex items-center justify-between p-4 shadow-lg">
        <h1 className="text-xl font-bold text-amber-500">MarcenariaPro</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900 z-40 pt-20 px-4 space-y-4">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as ViewTab); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-lg transition-all ${activeTab === item.id ? 'bg-amber-600 text-white' : 'text-slate-400 bg-slate-800'
                }`}
            >
              <item.icon size={24} />
              {item.label}
            </button>
          ))}
          <button
            onClick={() => { toggleTheme(); }}
            className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-lg transition-all text-slate-400 bg-slate-800`}
          >
            {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-lg transition-all text-red-400 bg-slate-800`}
          >
            Sair
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 scroll-smooth">
        {activeTab === 'dashboard' && (
          <Dashboard
            inventory={inventory}
            transactions={transactions}
            quotes={quotes}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === 'projects' && (
          <ProjectManager
            quotes={quotes}
            employees={employees}
            onEditProject={handleEditProject}
          />
        )}
        {activeTab === 'stock' && (
          <StockManager
            inventory={inventory}
            setInventory={setInventory}
          />
        )}
        {activeTab === 'finance' && (
          <FinanceManager
            transactions={transactions}
            setTransactions={setTransactions}
          />
        )}
        {activeTab === 'quotes' && (
          <QuoteBuilder
            inventory={inventory}
            quotes={quotes}
            setQuotes={setQuotes}
            onFinish={() => setActiveTab('quotes')}
            initialEditId={quoteToEditId}
            onClearEditId={() => setQuoteToEditId(null)}
            suppliers={suppliers}
            salespeople={salespeople}
            companyProfile={companyProfile}
          />
        )}
        {activeTab === 'cutplan' && (
          <CutPlanEstimator />
        )}
        {activeTab === 'suppliers' && (
          <SupplierManager
            suppliers={suppliers}
            setSuppliers={setSuppliers}
            salespeople={salespeople}
            setSalespeople={setSalespeople}
          />
        )}
        {activeTab === 'team' && (
          <TeamManager
            employees={employees}
            setEmployees={setEmployees}
            quotes={quotes}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsManager
            companyProfile={companyProfile}
            setCompanyProfile={setCompanyProfile}
            onClose={() => setActiveTab('dashboard')}
          />
        )}
      </main>
    </div>
  );
}
