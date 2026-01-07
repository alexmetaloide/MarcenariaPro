
export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  unit: string;
  minStock?: number;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

export interface QuoteMaterial {
  id: number;
  name: string;
  price: number;
  qty: number;
}

export interface QuoteDetails {
  materials: QuoteMaterial[];
  laborHours: number;
  laborRate: number;
  // Novos campos para diárias
  joinerDays?: number;
  joinerDailyRate?: number;
  helperDays?: number;
  helperDailyRate?: number;
  
  profitMargin: number;
  architectPercentage?: number;
  otherCosts: number;
  phone?: string;
  address?: string; // Campo de endereço adicionado
  description?: string;
  deadline?: string;
}

export interface Quote {
  id: number;
  client: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  total: number;
  date?: string;
  items?: { name: string; cost: number }[];
  details?: QuoteDetails;
}

export interface CutPiece {
  id: number;
  height: number;
  width: number;
  qty: number;
  name?: string;
  thickness?: string; // Novo campo para espessura/acabamento
}

export interface Employee {
  id: number;
  name: string;
  role: 'Marceneiro' | 'Ajudante' | 'Outro';
  phone: string;
  payRate: number; // Valor do pagamento
  payPeriod: 'Dia' | 'Semana' | 'Quinzena' | 'Mês';
  activeProjectIds: number[]; // IDs dos Orçamentos/Projetos ativos
  status: 'Ativo' | 'Inativo';
}

export interface Supplier {
  id: number;
  name: string;
  address?: string;
}

export interface Salesperson {
  id: number;
  supplierId: number;
  name: string;
  phone: string; // WhatsApp
}

export interface CompanyProfile {
  id?: number;
  name: string;
  cnpj: string;
  phone: string;
  address: string;
  email?: string;
  slogan?: string;
  logoUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Opcional apenas na interface de sessão, obrigatório no armazenamento
}

export type ViewTab = 'dashboard' | 'stock' | 'finance' | 'quotes' | 'cutplan' | 'team' | 'projects' | 'suppliers' | 'settings';

export type ConnectionStatus = 'loading' | 'connected' | 'error' | 'saving';
