
import React, { useState, useEffect } from 'react';
import { Plus, Save, Printer, Eye, ArrowLeft, CheckCircle, XCircle, Clock, Pencil, Trash2, Sparkles, BrainCircuit, X, Loader2, UserCheck, ShoppingBag, Copy, MessageSquare, FileText, FileCheck, Send, HardHat, User, Info, AlertCircle, BookOpen, Search, ExternalLink, MapPin } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { InventoryItem, Quote, QuoteMaterial, Supplier, Salesperson, CompanyProfile } from '../../types';
import { formatCurrency, SUGGESTED_MATERIALS } from '../../constants';
import { GoogleGenAI, Type } from "@google/genai";

interface QuoteBuilderProps {
  inventory: InventoryItem[];
  quotes: Quote[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  onFinish: () => void;
  initialEditId?: number | null;
  onClearEditId?: () => void;
  suppliers?: Supplier[];
  salespeople?: Salesperson[];
  companyProfile?: CompanyProfile;
  onDelete: (id: number) => void;
}

export const QuoteBuilder: React.FC<QuoteBuilderProps> = ({
  inventory,
  quotes,
  setQuotes,
  onFinish,
  initialEditId,
  onClearEditId,
  suppliers = [],
  salespeople = [],
  companyProfile,
  onDelete
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'details'>('list');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  // --- Create/Edit Mode States ---
  const [step, setStep] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [materialTab, setMaterialTab] = useState<'stock' | 'catalog'>('stock');
  const [catalogSearch, setCatalogSearch] = useState('');

  const [quoteData, setQuoteData] = useState<{
    client: string;
    phone: string;
    address: string;
    description: string;
    materials: QuoteMaterial[];
    laborHours: number;
    laborRate: number;
    // Novos campos de diária
    joinerDays: number;
    joinerDailyRate: number;
    helperDays: number;
    helperDailyRate: number;

    profitMargin: number;
    architectPercentage: number;
    otherCosts: number;
    deadline: string;
  }>({
    client: '',
    phone: '',
    address: '',
    description: '',
    materials: [],
    laborHours: 0,
    laborRate: 0,
    joinerDays: 0,
    joinerDailyRate: 0,
    helperDays: 0,
    helperDailyRate: 0,
    profitMargin: 30,
    architectPercentage: 0,
    otherCosts: 0,
    deadline: '45 dias úteis'
  });

  // --- Manual Item State (Step 2) ---
  const [manualItem, setManualItem] = useState({ name: '', price: 0, qty: 1 });

  // --- AI States ---
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // --- Supplier Modal State ---
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [selectedSalespersonId, setSelectedSalespersonId] = useState<string>('');

  // Efeito para carregar edição externa
  useEffect(() => {
    if (initialEditId) {
      const quoteToEdit = quotes.find(q => q.id === initialEditId);
      if (quoteToEdit) {
        handleEdit(quoteToEdit);
        if (onClearEditId) onClearEditId();
      }
    }
  }, [initialEditId, quotes]);

  const addToQuote = (item: { id?: number, name: string, price: number }) => {
    const id = item.id || Date.now() + Math.random();
    // Verifica se já existe pelo nome para o catálogo sugerido, ou ID para estoque
    const existing = quoteData.materials.find(m => (item.id && m.id === item.id) || (m.name === item.name && m.price === item.price));

    if (existing) {
      setQuoteData(prev => ({
        ...prev,
        materials: prev.materials.map(m => (m === existing) ? { ...m, qty: m.qty + 1 } : m)
      }));
    } else {
      setQuoteData(prev => ({
        ...prev,
        materials: [...prev.materials, { id: id, name: item.name, price: item.price, qty: 1 }]
      }));
    }
  };

  const addManualItem = () => {
    if (!manualItem.name) return;
    setQuoteData(prev => ({
      ...prev,
      materials: [...prev.materials, {
        id: Date.now(),
        name: manualItem.name,
        price: manualItem.price,
        qty: manualItem.qty
      }]
    }));
    setManualItem({ name: '', price: 0, qty: 1 });
  };

  const removeFromQuote = (idx: number) => {
    setQuoteData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== idx)
    }));
  };

  const calculateTotal = () => {
    const materialCost = quoteData.materials.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);

    // Cálculo Mão de Obra (Horas + Diárias)
    const hourlyLabor = quoteData.laborHours * quoteData.laborRate;
    const joinerLabor = quoteData.joinerDays * quoteData.joinerDailyRate;
    const helperLabor = quoteData.helperDays * quoteData.helperDailyRate;
    const laborCost = hourlyLabor + joinerLabor + helperLabor;

    const otherCosts = Number(quoteData.otherCosts);
    const subtotal = materialCost + laborCost + otherCosts;

    const profitValue = subtotal * (quoteData.profitMargin / 100);
    const priceWithProfit = subtotal + profitValue;

    const architectFee = priceWithProfit * (quoteData.architectPercentage / 100);

    const total = priceWithProfit + architectFee;

    return { materialCost, laborCost, otherCosts, subtotal, profitValue, priceWithProfit, architectFee, total };
  };

  const { materialCost, laborCost, profitValue, architectFee, total } = calculateTotal();

  const handleEdit = (quote: Quote) => {
    const details = quote.details || {
      materials: [],
      laborHours: 0,
      laborRate: 0,
      joinerDays: 0,
      joinerDailyRate: 0,
      helperDays: 0,
      helperDailyRate: 0,
      profitMargin: 30,
      architectPercentage: 0,
      otherCosts: 0,
      phone: '',
      address: '',
      description: quote.title,
      deadline: '45 dias úteis'
    };

    setQuoteData({
      client: quote.client,
      phone: details.phone || '',
      address: details.address || '',
      description: quote.title,
      materials: details.materials || [],
      laborHours: details.laborHours,
      laborRate: details.laborRate,
      joinerDays: details.joinerDays || 0,
      joinerDailyRate: details.joinerDailyRate || 0,
      helperDays: details.helperDays || 0,
      helperDailyRate: details.helperDailyRate || 0,
      profitMargin: details.profitMargin,
      architectPercentage: details.architectPercentage || 0,
      otherCosts: details.otherCosts,
      deadline: details.deadline || '45 dias úteis'
    });

    setEditingId(quote.id);
    setStep(1);
    setViewMode('create');
  };

  const deleteQuote = (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este orçamento?")) {
      onDelete(id);
      if (selectedQuote && String(selectedQuote.id) === String(id)) {
        setViewMode('list');
        setSelectedQuote(null);
      }
    }
  };

  const saveQuote = () => {
    if (!quoteData.client) {
      alert("Preencha o nome do cliente.");
      return;
    }

    const quoteDetails = {
      materials: quoteData.materials,
      laborHours: quoteData.laborHours,
      laborRate: quoteData.laborRate,
      joinerDays: quoteData.joinerDays,
      joinerDailyRate: quoteData.joinerDailyRate,
      helperDays: quoteData.helperDays,
      helperDailyRate: quoteData.helperDailyRate,
      profitMargin: quoteData.profitMargin,
      architectPercentage: quoteData.architectPercentage,
      otherCosts: quoteData.otherCosts,
      phone: quoteData.phone,
      address: quoteData.address,
      description: quoteData.description,
      deadline: quoteData.deadline
    };

    if (editingId) {
      setQuotes(prevQuotes => prevQuotes.map(q => q.id === editingId ? {
        ...q,
        client: quoteData.client,
        title: quoteData.description || 'Orçamento Editado',
        total: total,
        items: quoteData.materials.map(m => ({ name: m.name, cost: m.price * m.qty })),
        details: quoteDetails
      } : q));
    } else {
      const newQuote: Quote = {
        id: Date.now(),
        client: quoteData.client,
        title: quoteData.description || 'Novo Orçamento',
        status: 'pending',
        total: total,
        date: new Date().toLocaleDateString('pt-BR'),
        items: quoteData.materials.map(m => ({ name: m.name, cost: m.price * m.qty })),
        details: quoteDetails
      };
      setQuotes(prevQuotes => [newQuote, ...prevQuotes]);
    }

    resetForm();
    setViewMode('list');
    onFinish();
  };

  const resetForm = () => {
    setStep(1);
    setEditingId(null);
    setQuoteData({
      client: '',
      phone: '',
      address: '',
      description: '',
      materials: [],
      laborHours: 0,
      laborRate: 0,
      joinerDays: 0,
      joinerDailyRate: 0,
      helperDays: 0,
      helperDailyRate: 0,
      profitMargin: 30,
      architectPercentage: 0,
      otherCosts: 0,
      deadline: '45 dias úteis'
    });
    setManualItem({ name: '', price: 0, qty: 1 });
  };

  const updateStatus = (id: number, status: 'pending' | 'approved' | 'rejected') => {
    setQuotes(prevQuotes => prevQuotes.map(q => q.id === id ? { ...q, status } : q));
    if (selectedQuote && selectedQuote.id === id) {
      setSelectedQuote({ ...selectedQuote, status });
    }
  };

  const handlePrintProposal = () => {
    if (!selectedQuote) return;

    const company = companyProfile || {
      name: 'MarcenariaPro',
      slogan: 'Móveis Planejados & Interiores',
      cnpj: '00.000.000/0001-00',
      phone: '(85) 99999-9999',
      address: 'Endereço da Empresa',
      email: 'contato@marcenaria.com'
    };

    const logoSvg = `
      <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 5 A 45 45 0 0 0 50 95" stroke="#1e4e79" stroke-width="6" fill="none" stroke-dasharray="130" stroke-dashoffset="0" transform="rotate(15 50 50)" />
        <path d="M50 95 A 45 45 0 0 0 50 5" stroke="#374151" stroke-width="6" fill="none" stroke-dasharray="130" stroke-dashoffset="0" transform="rotate(15 50 50)" />
        <g transform="translate(28, 28) scale(0.44)">
             <path d="M10 0 V 100" stroke="#1e4e79" stroke-width="18" />
             <path d="M10 0 L 50 60 L 90 0" fill="none" stroke="#374151" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" />
             <path d="M90 35 V 100" stroke="#ea580c" stroke-width="18" />
        </g>
      </svg>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const details = selectedQuote.details;
      const materials = details?.materials || selectedQuote.items?.map(i => ({ name: i.name, qty: 1 })) || [];
      const deadline = details?.deadline || '45 dias úteis';

      const htmlContent = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Proposta Comercial - ${selectedQuote.client}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; line-height: 1.5; padding: 0; margin: 0; background: #fff; }
                    .page-container { max-width: 850px; margin: 0 auto; background: white; min-height: 29.7cm; padding: 40px 50px; position: relative; box-sizing: border-box; }
                    .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #d97706; padding-bottom: 20px; margin-bottom: 40px; }
                    .logo-wrapper { display: flex; align-items: center; gap: 15px; margin-bottom: 10px; }
                    .logo-area h1 { font-size: 32px; font-weight: 800; color: #d97706; margin: 0; letter-spacing: -1px; text-transform: uppercase; }
                    .logo-area p { font-size: 14px; color: #6b7280; margin: 5px 0 0 0; font-weight: 500; }
                    .company-info { font-size: 11px; color: #9ca3af; margin-top: 5px; }
                    .proposal-meta { text-align: right; }
                    .proposal-number { font-size: 14px; font-weight: bold; color: #9ca3af; text-transform: uppercase; }
                    .proposal-id { font-size: 24px; font-weight: bold; color: #111827; margin: 5px 0; }
                    .intro-text { font-size: 15px; margin-bottom: 30px; text-align: justify; }
                    .section-box { margin-bottom: 35px; }
                    .section-header { font-size: 16px; font-weight: 700; color: #111827; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
                    .section-header:before { content: ''; display: block; width: 6px; height: 6px; background: #d97706; border-radius: 50%; }
                    .client-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #f3f4f6; }
                    .field-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #9ca3af; margin-bottom: 4px; }
                    .field-value { font-size: 15px; font-weight: 500; color: #1f2937; }
                    .project-description { background: #fffbeb; padding: 20px; border-left: 4px solid #f59e0b; border-radius: 4px; font-size: 15px; white-space: pre-wrap; }
                    table.materials-table { width: 100%; border-collapse: collapse; font-size: 14px; }
                    table.materials-table th { text-align: left; background: #f3f4f6; padding: 10px; color: #4b5563; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #e5e7eb; }
                    table.materials-table td { padding: 12px 10px; border-bottom: 1px solid #f3f4f6; color: #374151; }
                    table.materials-table tr:last-child td { border-bottom: none; }
                    .clauses-list { list-style: none; padding: 0; margin: 0; }
                    .clauses-list li { margin-bottom: 8px; font-size: 13px; color: #4b5563; padding-left: 20px; position: relative; }
                    .clauses-list li:before { content: '•'; color: #d97706; position: absolute; left: 0; font-weight: bold; }
                    .price-box { margin-top: 30px; text-align: right; background: #111827; color: white; padding: 20px 30px; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
                    .price-label { font-size: 14px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px; }
                    .price-value { font-size: 36px; font-weight: 800; margin: 5px 0; }
                    .price-obs { font-size: 12px; opacity: 0.6; margin-top: 5px; }
                    .footer { margin-top: 60px; border-top: 1px solid #e5e7eb; padding-top: 30px; display: flex; justify-content: space-between; }
                    .sign-field { width: 45%; }
                    .sign-line { border-bottom: 1px solid #9ca3af; height: 40px; margin-bottom: 10px; }
                    .sign-label { text-align: center; font-size: 13px; color: #4b5563; font-weight: 500; }
                    @media print { body { background: white; } .page-container { padding: 0; margin: 0; box-shadow: none; max-width: 100%; } .price-box { background: #f3f4f6 !important; color: #000 !important; border: 2px solid #000; } }
                </style>
            </head>
            <body>
                <div class="page-container">
                    <div class="header">
                        <div class="logo-area">
                            <div class="logo-wrapper">
                                ${logoSvg}
                                <div><h1>${company.name}</h1><p>${company.slogan || ''}</p></div>
                            </div>
                            <div class="company-info">CNPJ: ${company.cnpj} • ${company.phone}<br/>${company.address}</div>
                        </div>
                        <div class="proposal-meta">
                            <div class="proposal-number">Proposta Comercial</div>
                            <div class="proposal-id">#${selectedQuote.id}</div>
                            <div style="font-size: 13px; color: #6b7280;">Emissão: ${new Date().toLocaleDateString('pt-BR')}</div>
                            <div style="font-size: 13px; color: #d97706; font-weight: bold;">Validade: 15 dias</div>
                        </div>
                    </div>
                    <div class="intro-text">
                        <p>Prezado(a) <strong>${selectedQuote.client}</strong>,</p>
                        <p>Agradecemos a oportunidade de apresentar nossa proposta. Abaixo detalhamos as especificações técnicas e condições comerciais.</p>
                    </div>
                    <div class="section-box">
                        <div class="section-header">1. Dados do Projeto</div>
                        <div class="client-grid">
                            <div><div class="field-label">Cliente</div><div class="field-value">${selectedQuote.client}</div></div>
                            <div><div class="field-label">Contato</div><div class="field-value">${details?.phone || 'Não informado'}</div></div>
                            <div style="grid-column: span 2;"><div class="field-label">Endereço</div><div class="field-value">${details?.address || 'Não informado'}</div></div>
                            <div style="grid-column: span 2;"><div class="field-label">Título do Projeto</div><div class="field-value">${selectedQuote.title}</div></div>
                        </div>
                    </div>
                    <div class="section-box">
                        <div class="section-header">2. Descrição & Escopo</div>
                        <div class="project-description">${details?.description || selectedQuote.title}</div>
                    </div>
                    <div class="section-box">
                        <div class="section-header">3. Materiais</div>
                        <table class="materials-table">
                            <thead><tr><th width="10%">Qtd</th><th>Descrição</th></tr></thead>
                            <tbody>${materials.map(m => `<tr><td style="font-weight: bold; text-align: center">${m.qty}</td><td>${m.name}</td></tr>`).join('')}</tbody>
                        </table>
                    </div>
                    <div class="section-box" style="page-break-inside: avoid;">
                        <div class="section-header">4. Condições Gerais</div>
                        <ul class="clauses-list">
                            <li><strong>Incluso:</strong> Mão de obra, materiais, transporte e instalação.</li>
                            <li><strong>Não Incluso:</strong> Alvenaria, elétrica, hidráulica, pintura, pedras e vidros (salvo combinado).</li>
                            <li><strong>Prazo:</strong> ${deadline} após contrato.</li>
                            <li><strong>Garantia:</strong> 5 anos contra defeitos de fabricação.</li>
                        </ul>
                    </div>
                    <div class="section-box" style="page-break-inside: avoid;">
                        <div class="price-box">
                            <div class="price-label">Valor Total</div>
                            <div class="price-value">${formatCurrency(selectedQuote.total)}</div>
                            <div class="price-obs">Condições a combinar.</div>
                        </div>
                    </div>
                    <div class="footer" style="page-break-inside: avoid;">
                        <div class="sign-field"><div class="sign-line"></div><div class="sign-label"><strong>${company.name}</strong><br>CONTRATADA</div></div>
                        <div class="sign-field"><div class="sign-line"></div><div class="sign-label"><strong>${selectedQuote.client}</strong><br>CONTRATANTE</div></div>
                    </div>
                </div>
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  const handleSendProposalWhatsApp = () => {
    if (!selectedQuote) return;
    const details = selectedQuote.details;
    const deadline = details?.deadline || '45 dias úteis';
    const phoneNumber = details?.phone?.replace(/\D/g, '') || '';
    const companyName = companyProfile?.name || 'MarcenariaPro';

    const message = `*PROPOSTA - ${companyName.toUpperCase()}*\n\nOlá *${selectedQuote.client}*, segue o resumo para *${selectedQuote.title}*:\n\n📝 *Desc:* ${details?.description || selectedQuote.title}\n💰 *Valor:* ${formatCurrency(selectedQuote.total)}\n⏳ *Prazo:* ${deadline}\n✅ *Garantia:* 5 Anos\n\nVamos agendar?\nAtt, ${companyName}`;

    const url = phoneNumber
      ? `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const getSupplierMessage = () => {
    if (!selectedQuote) return '';

    // Dados para mensagem
    const items = selectedQuote.items || [];
    const materials = selectedQuote.details?.materials || items.map(i => ({ name: i.name, qty: 1 }));
    const companyName = companyProfile?.name || 'MarcenariaPro';
    const cnpj = companyProfile?.cnpj || '';
    const address = companyProfile?.address || '';

    let message = `📋 *PEDIDO DE ORÇAMENTO*\n`;
    message += `🏢 *${companyName.toUpperCase()}*\n`;
    if (cnpj) message += `🆔 CNPJ: ${cnpj}\n`;

    // Destinatário
    if (selectedSupplierId) {
      const sup = suppliers.find(s => s.id === Number(selectedSupplierId));
      if (sup) message += `📍 Para: *${sup.name}*\n`;
    }
    if (selectedSalespersonId) {
      const sp = salespeople.find(s => s.id === Number(selectedSalespersonId));
      if (sp) message += `👤 A/C: *${sp.name}*\n`;
    }

    message += `\n🔨 *Ref. Projeto:* ${selectedQuote.title}\n`;
    message += `──────────────────\n`;
    message += `*LISTA DE MATERIAIS:*\n\n`;

    materials.forEach(mat => {
      message += `🔹 *${mat.qty}x* ${mat.name}\n`;
    });

    message += `──────────────────\n`;
    if (address) message += `🚛 *Entrega para:* ${address}\n`;

    message += `\n❓ *Favor informar:*\n`;
    message += `- Disponibilidade dos itens\n`;
    message += `- Previsão de entrega\n`;
    message += `- Condições de pagamento\n\n`;
    message += `Aguardo retorno. Obrigado!`;

    return message;
  };

  const handleSendWhatsApp = () => {
    const message = getSupplierMessage();
    let phoneNumber = '';
    if (selectedSalespersonId) {
      const sp = salespeople.find(s => s.id === Number(selectedSalespersonId));
      if (sp && sp.phone) phoneNumber = sp.phone;
    }
    const url = phoneNumber ? `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(getSupplierMessage());
    alert('Copiado!');
  };

  const handlePrintSupplierList = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && selectedQuote) {
      const materials = selectedQuote.details?.materials || [];
      const companyName = companyProfile?.name || 'MarcenariaPro';

      const htmlContent = `<html><head><title>Lista Materiais</title><style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:10px;text-align:left}th{background:#f5f5f5}</style></head><body><h1>Cotação de Materiais</h1><h2>Ref: ${selectedQuote.title}</h2><p><strong>De:</strong> ${companyName}</p><table><thead><tr><th style="width:80px">Qtd</th><th>Material</th></tr></thead><tbody>${materials.map(m => `<tr><td style="font-weight:bold;text-align:center">${m.qty}</td><td>${m.name}</td></tr>`).join('')}</tbody></table><script>window.onload=function(){window.print()}</script></body></html>`;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  const filteredSalespeople = selectedSupplierId
    ? salespeople.filter(sp => sp.supplierId === Number(selectedSupplierId))
    : [];

  // --- VIEWS ---

  if (viewMode === 'list') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Orçamentos</h2>
          <Button onClick={() => { resetForm(); setViewMode('create'); }} icon={Plus}>Novo Orçamento</Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3 text-slate-600 dark:text-slate-300">Cliente</th>
                  <th className="p-3 text-slate-600 dark:text-slate-300">Projeto</th>
                  <th className="p-3 text-slate-600 dark:text-slate-300">Data</th>
                  <th className="p-3 text-slate-600 dark:text-slate-300">Valor</th>
                  <th className="p-3 text-slate-600 dark:text-slate-300">Status</th>
                  <th className="p-3 text-center text-slate-600 dark:text-slate-300">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {quotes.map(quote => (
                  <tr key={quote.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-bold text-slate-700 dark:text-slate-200">{quote.client}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{quote.title}</td>
                    <td className="p-3 text-slate-500 dark:text-slate-500">{quote.date}</td>
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-300">{formatCurrency(quote.total)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1 
                        ${quote.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          quote.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        {quote.status === 'approved' ? 'Aprovado' : quote.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="p-3 flex justify-center gap-2">
                      <Button variant="outline" className="p-1 px-2 h-8" title="Editar" onClick={() => handleEdit(quote)}><Pencil size={14} /></Button>
                      <Button variant="secondary" className="p-1 px-2 h-8" title="Ver Detalhes" onClick={() => { setSelectedQuote(quote); setViewMode('details'); }}><Eye size={14} /></Button>
                      <Button
                        variant="danger"
                        className="p-1 px-2 h-8 bg-white dark:bg-transparent"
                        title="Excluir"
                        onClick={(e) => {
                          e.stopPropagation(); // Garante que o clique não propague
                          deleteQuote(quote.id);
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
                {quotes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <FileText size={48} className="text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="font-medium text-lg text-slate-600 dark:text-slate-300">Nenhum orçamento criado ainda.</p>
                        <Button onClick={() => { resetForm(); setViewMode('create'); }} icon={Plus}>Criar Meu Primeiro Orçamento</Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // ... (ViewDetails remains similar but compacted for this block) ...
  if (viewMode === 'details' && selectedQuote) {
    const details = selectedQuote.details;
    const archFee = details?.architectPercentage ? selectedQuote.total - (selectedQuote.total / (1 + details.architectPercentage / 100)) : 0;
    const materialsList = details?.materials || [];

    return (
      <div className="space-y-6 animate-fade-in relative">
        {isSupplierModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-lg w-full p-6 animate-slide-down border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <ShoppingBag size={20} className="text-amber-600" /> Cotação para Madeireira
                </h3>
                <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Madeireira</label>
                  <select className="w-full text-sm border border-slate-300 rounded p-2 bg-white text-slate-900" value={selectedSupplierId} onChange={(e) => { setSelectedSupplierId(e.target.value); setSelectedSalespersonId(''); }}>
                    <option value="">Selecione...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Vendedor</label>
                  <select className="w-full text-sm border border-slate-300 rounded p-2 bg-white text-slate-900" value={selectedSalespersonId} onChange={(e) => setSelectedSalespersonId(e.target.value)} disabled={!selectedSupplierId}>
                    <option value="">Selecione...</option>
                    {filteredSalespeople.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 mb-6 max-h-[50vh] overflow-y-auto">
                <ul className="space-y-2 text-sm">{materialsList.map((m, idx) => (<li key={idx} className="flex gap-3"><span className="font-bold text-slate-900 dark:text-slate-100 min-w-[30px]">{m.qty}x</span><span className="text-slate-700 dark:text-slate-300">{m.name}</span></li>))}</ul>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="success" onClick={handleSendWhatsApp} icon={MessageSquare} className="w-full justify-center">{selectedSalespersonId ? `Enviar para Vendedor` : 'Enviar WhatsApp'}</Button>
                <Button variant="secondary" onClick={handleCopyText} icon={Copy} className="w-full justify-center">Copiar Texto</Button>
                <Button variant="outline" onClick={handlePrintSupplierList} icon={Printer} className="w-full justify-center md:col-span-2">Imprimir Lista</Button>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center print:hidden flex-wrap gap-2">
          <Button variant="secondary" icon={ArrowLeft} onClick={() => setViewMode('list')}>Voltar</Button>
          <div className="flex flex-wrap gap-2 justify-end">
            <div className="flex gap-2 bg-blue-50 dark:bg-blue-900/20 p-1 rounded-lg border border-blue-100 dark:border-blue-900/30">
              <Button onClick={handlePrintProposal} className="bg-blue-600 text-white hover:bg-blue-700"><FileCheck size={18} className="mr-2" /> Proposta</Button>
              <Button variant="outline" className="border-blue-200 text-blue-700" onClick={handleSendProposalWhatsApp}><Send size={18} /></Button>
            </div>
            <Button onClick={() => setIsSupplierModalOpen(true)} className="bg-slate-800 text-white hover:bg-slate-700"><ShoppingBag size={18} className="mr-2" /> Material</Button>
            <Button variant="outline" icon={Pencil} onClick={() => handleEdit(selectedQuote)}>Editar</Button>
            {selectedQuote.status === 'pending' && (<><Button variant="danger" onClick={() => updateStatus(selectedQuote.id, 'rejected')}>Rejeitar</Button><Button variant="success" onClick={() => updateStatus(selectedQuote.id, 'approved')}>Aprovar</Button></>)}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 print:shadow-none print:border-none">
          <div className="flex justify-between items-start mb-8 border-b border-slate-100 dark:border-slate-700 pb-6">
            <div><h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">Orçamento</h1><p className="text-slate-500 dark:text-slate-400">#{selectedQuote.id}</p></div>
            <div className="text-right"><h2 className="text-xl font-bold text-amber-600">{companyProfile?.name || 'MarcenariaPro'}</h2><p className="text-sm text-slate-500 dark:text-slate-400">{new Date().toLocaleDateString('pt-BR')}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Cliente</h3>
              <p className="text-lg font-medium text-slate-800 dark:text-slate-100">{selectedQuote.client}</p>
              {selectedQuote.details?.address && <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><MapPin size={12} /> {selectedQuote.details.address}</p>}
              <p className="text-slate-600 dark:text-slate-300 mt-2">Projeto: {selectedQuote.title}</p>
            </div>
            <div className="text-right"><h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Status</h3><span className="font-bold">{selectedQuote.status.toUpperCase()}</span></div>
          </div>
          <div className="mb-8"><h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Itens</h3><table className="w-full text-left text-sm"><thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700"><tr><th className="p-3 text-slate-600 dark:text-slate-300">Descrição</th><th className="p-3 text-right text-slate-600 dark:text-slate-300">Custo Estimado</th></tr></thead><tbody>{selectedQuote.items?.map((item, idx) => (<tr key={idx} className="border-b border-slate-50 dark:border-slate-700/50"><td className="p-3 text-slate-700 dark:text-slate-300">{item.name}</td><td className="p-3 text-right text-slate-600 dark:text-slate-400">{formatCurrency(item.cost)}</td></tr>))}</tbody></table></div>
          <div className="flex justify-end"><div className="w-1/2 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg"><div className="flex justify-between items-center mb-2"><span className="text-slate-600 dark:text-slate-400">Total</span><span className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(selectedQuote.total)}</span></div></div></div>
        </div>
      </div>
    );
  }

  // --- CREATE VIEW (Step 1, 2, 3) ---
  if (viewMode === 'create') {
    if (step === 1) return (
      <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="secondary" onClick={() => { resetForm(); setViewMode('list'); }}>Cancelar</Button>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {editingId ? 'Editar Orçamento' : 'Novo Orçamento'} - Dados do Cliente
          </h2>
        </div>
        <Card className="space-y-4">
          <Input label="Nome do Cliente" value={quoteData.client} onChange={e => setQuoteData({ ...quoteData, client: e.target.value })} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Telefone / Contato" value={quoteData.phone} onChange={e => setQuoteData({ ...quoteData, phone: e.target.value })} />
            <Input label="Endereço" value={quoteData.address} onChange={e => setQuoteData({ ...quoteData, address: e.target.value })} placeholder="Rua, Número, Bairro, Cidade..." />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Descrição do Projeto</label>
            <textarea
              className="px-3 py-2.5 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none h-24 bg-white text-slate-900 placeholder-slate-500 transition-all"
              placeholder="Ex: Armário de Cozinha em L com MDF Branco..."
              value={quoteData.description}
              onChange={e => setQuoteData({ ...quoteData, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStep(2)}>Próximo: Materiais</Button>
          </div>
        </Card>
      </div>
    );

    if (step === 2) return (
      <div className="max-w-4xl mx-auto animate-fade-in space-y-6 relative">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Seleção de Materiais</h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">Custo Parcial</p>
              <p className="text-xl font-bold text-amber-600">{formatCurrency(materialCost)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="h-[600px] overflow-hidden flex flex-col p-0">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold mb-2 text-slate-700 dark:text-slate-200">Adicionar Materiais</h3>

              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 mb-3">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1"><Info size={12} /> Item Manual / Extra</p>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Nome do Item"
                    value={manualItem.name}
                    onChange={e => setManualItem({ ...manualItem, name: e.target.value })}
                    className="flex-[2]"
                  />
                  <Input
                    type="number"
                    placeholder="R$"
                    value={manualItem.price || ''}
                    onChange={e => setManualItem({ ...manualItem, price: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Qtd"
                    value={manualItem.qty}
                    onChange={e => setManualItem({ ...manualItem, qty: Number(e.target.value) })}
                    className="w-16"
                  />
                </div>
                <Button onClick={addManualItem} variant="secondary" className="w-full py-1 h-8 text-xs">
                  <Plus size={14} className="mr-1" /> Adicionar Manualmente
                </Button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setMaterialTab('stock')}
                  className={`flex-1 py-2 text-sm font-bold transition-colors border-b-2 ${materialTab === 'stock' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                >
                  Meu Estoque
                </button>
                <button
                  onClick={() => setMaterialTab('catalog')}
                  className={`flex-1 py-2 text-sm font-bold transition-colors border-b-2 flex items-center justify-center gap-2 ${materialTab === 'catalog' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                >
                  <BookOpen size={14} /> Tabela Referência
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-white dark:bg-slate-950">
              {materialTab === 'stock' ? (
                <div className="p-2 space-y-2">
                  {inventory.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-2 border border-slate-100 dark:border-slate-800 rounded hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer group transition-colors" onClick={() => addToQuote(item)}>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.name}</p>
                        <div className="flex justify-between items-center pr-2 mt-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {formatCurrency(item.price)}
                          </p>
                          <p className="text-xs text-slate-400">
                            Disp: {item.quantity} {item.unit}
                          </p>
                        </div>
                      </div>
                      <Plus size={16} className="text-amber-600 opacity-50 group-hover:opacity-100" />
                    </div>
                  ))}
                  {inventory.length === 0 && (
                    <div className="text-center p-8 text-slate-400 text-xs">
                      <AlertCircle size={24} className="mx-auto mb-1 opacity-50" />
                      <p>Seu estoque está vazio.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="bg-amber-50 dark:bg-amber-900/10 p-2 text-center text-xs text-amber-800 dark:text-amber-400 border-b border-amber-100 dark:border-amber-900/20 flex items-center justify-center gap-1">
                    <ExternalLink size={10} /> Fonte dos dados: Pesquisa realizada no site <strong>leomadeiras.com.br</strong> e marketplaces parceiros em Jan/2026.
                  </div>
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-950 z-10">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-900 outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="Buscar no catálogo..."
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="p-2 space-y-4">
                    {SUGGESTED_MATERIALS.map((cat, idx) => {
                      const filteredItems = cat.items.filter(i => i.name.toLowerCase().includes(catalogSearch.toLowerCase()));
                      if (filteredItems.length === 0) return null;

                      return (
                        <div key={idx} className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
                          <div className="bg-slate-50 dark:bg-slate-900 p-2 font-bold text-xs text-slate-600 dark:text-slate-300 uppercase tracking-wide border-b border-slate-100 dark:border-slate-800">
                            {cat.category}
                          </div>
                          <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredItems.map((item, itemIdx) => {
                              // @ts-ignore
                              const isUnavailable = item.unavailable === true;
                              return (
                                <div
                                  key={itemIdx}
                                  onClick={() => !isUnavailable && addToQuote(item)}
                                  className={`flex justify-between items-center p-2 hover:bg-amber-50 dark:hover:bg-amber-900/10 cursor-pointer transition-colors ${isUnavailable ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900' : ''}`}
                                >
                                  <div className="flex-1 pr-2">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{item.name}</p>
                                  </div>
                                  <div className="text-right whitespace-nowrap">
                                    {isUnavailable ? (
                                      <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">EM FALTA</span>
                                    ) : (
                                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{formatCurrency(item.price)}</span>
                                    )}
                                  </div>
                                  {!isUnavailable && <Plus size={14} className="text-amber-600 ml-2" />}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    {SUGGESTED_MATERIALS.every(cat => cat.items.filter(i => i.name.toLowerCase().includes(catalogSearch.toLowerCase())).length === 0) && (
                      <p className="text-center text-xs text-slate-400 p-4">Nenhum item encontrado.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="h-[600px] overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-900 border-amber-200 dark:border-amber-900/30 p-4">
            <h3 className="font-bold mb-2 text-slate-700 dark:text-slate-200">Itens no Orçamento</h3>
            <div className="flex-1 overflow-auto space-y-2 pr-1 custom-scrollbar">
              {quoteData.materials.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-white dark:bg-slate-800 rounded shadow-sm">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.qty}x {formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(item.price * item.qty)}</div>
                    <button onClick={() => removeFromQuote(idx)} className="text-red-400 hover:text-red-600 dark:hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {quoteData.materials.length === 0 && <p className="text-slate-400 text-sm text-center mt-10">Nenhum material adicionado.</p>}
            </div>
          </Card>
        </div>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => setStep(1)}>Voltar</Button>
          <Button onClick={() => setStep(3)}>Próximo: Mão de Obra</Button>
        </div>
      </div>
    );

    if (step === 3) return (
      <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Finalização e Lucro</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-bold mb-4 text-slate-700 dark:text-slate-200">Custos Operacionais</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 bg-blue-50 dark:bg-blue-900/20 p-2 rounded flex gap-2">
              <Info size={14} className="shrink-0 mt-0.5 text-blue-500" />
              Defina o custo da mão de obra.
            </p>
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase flex items-center gap-1"><Clock size={12} /> Por Hora (Opcional)</p>
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Horas Trabalhadas" type="number" value={quoteData.laborHours || ''} onChange={e => setQuoteData({ ...quoteData, laborHours: Number(e.target.value) })} />
                  <Input label="Valor/Hora (R$)" type="number" value={quoteData.laborRate || ''} onChange={e => setQuoteData({ ...quoteData, laborRate: Number(e.target.value) })} />
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-500 mb-2 uppercase flex items-center gap-1"><HardHat size={12} /> Diária Marceneiro (Opcional)</p>
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Qtd. Dias" type="number" value={quoteData.joinerDays || ''} onChange={e => setQuoteData({ ...quoteData, joinerDays: Number(e.target.value) })} />
                  <Input label="Valor Diária (R$)" type="number" value={quoteData.joinerDailyRate || ''} onChange={e => setQuoteData({ ...quoteData, joinerDailyRate: Number(e.target.value) })} />
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase flex items-center gap-1"><User size={12} /> Diária Ajudante (Opcional)</p>
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Qtd. Dias" type="number" value={quoteData.helperDays || ''} onChange={e => setQuoteData({ ...quoteData, helperDays: Number(e.target.value) })} />
                  <Input label="Valor Diária (R$)" type="number" value={quoteData.helperDailyRate || ''} onChange={e => setQuoteData({ ...quoteData, helperDailyRate: Number(e.target.value) })} />
                </div>
              </div>

              <Input label="Outros Custos (Frete, etc)" type="number" value={quoteData.otherCosts || ''} onChange={e => setQuoteData({ ...quoteData, otherCosts: Number(e.target.value) })} />
            </div>
          </Card>

          <Card>
            <h3 className="font-bold mb-4 text-slate-700 dark:text-slate-200">Margem e Comissões</h3>
            <div className="space-y-6">
              <Input
                label="Prazo de Entrega"
                placeholder="Ex: 45 dias úteis"
                value={quoteData.deadline}
                onChange={e => setQuoteData({ ...quoteData, deadline: e.target.value })}
              />

              <div className="space-y-2">
                <div className="flex justify-between items-center gap-4">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    Margem de Lucro (%)
                    <span title="Lucro líquido sobre o custo total (Materiais + Mão de Obra)" className="cursor-help text-slate-400"><Info size={14} /></span>
                  </label>
                  <div className="w-24">
                    <Input type="number" min="0" max="1000" value={quoteData.profitMargin || ''} onChange={e => setQuoteData({ ...quoteData, profitMargin: Number(e.target.value) })} className="py-1 h-8 text-right bg-white text-slate-900 border-slate-300" />
                  </div>
                </div>
                <input type="range" min="0" max="1000" className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-600" value={quoteData.profitMargin} onChange={e => setQuoteData({ ...quoteData, profitMargin: Number(e.target.value) })} />
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center gap-4">
                  <label className="text-sm font-medium text-purple-700 dark:text-purple-400 flex items-center gap-2">
                    <UserCheck size={16} /> Comissão Arquiteto (%)
                  </label>
                  <div className="w-24">
                    <Input type="number" min="0" max="100" value={quoteData.architectPercentage || ''} onChange={e => setQuoteData({ ...quoteData, architectPercentage: Number(e.target.value) })} className="py-1 h-8 text-right bg-white text-slate-900 border-purple-200" />
                  </div>
                </div>
                <input type="range" min="0" max="100" className="w-full h-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg appearance-none cursor-pointer accent-purple-600" value={quoteData.architectPercentage} onChange={e => setQuoteData({ ...quoteData, architectPercentage: Number(e.target.value) })} />
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-100 dark:border-amber-900/30 mt-4 text-slate-800 dark:text-slate-200">
                <div className="flex justify-between text-sm mb-1">
                  <span>Custo Material:</span>
                  <span>{formatCurrency(materialCost)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Mão de Obra (Total):</span>
                  <span>{formatCurrency(laborCost)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Outros Custos:</span>
                  <span>{formatCurrency(quoteData.otherCosts)}</span>
                </div>

                <div className="flex justify-between text-sm mb-1 font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-1 rounded -mx-1 my-1">
                  <span>Lucro Real ({quoteData.profitMargin}%):</span>
                  <span>{formatCurrency(profitValue)}</span>
                </div>

                {architectFee > 0 && (
                  <div className="flex justify-between text-sm mb-1 text-purple-700 dark:text-purple-400 font-medium border-t border-amber-200 dark:border-amber-900/30 pt-1">
                    <span>Comissão Arquiteto:</span>
                    <span>{formatCurrency(architectFee)}</span>
                  </div>
                )}
                <div className="border-t border-amber-200 dark:border-amber-900/30 my-2 pt-2 flex justify-between font-bold text-lg text-amber-900 dark:text-amber-500">
                  <span>Preço Final:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => setStep(2)}>Voltar</Button>
          <Button icon={Save} onClick={saveQuote}>
            {editingId ? 'Salvar Alterações' : 'Salvar Orçamento'}
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
