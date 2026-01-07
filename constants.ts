
import { InventoryItem, Transaction, Quote, Employee, Supplier, Salesperson, CompanyProfile } from './types';

export const INITIAL_INVENTORY: InventoryItem[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 1, description: 'Pagamento Energia', amount: -450.00, type: 'expense', category: 'Utilidades', date: '2023-10-01' },
  { id: 2, description: 'Sinal Cozinha Sra. Ana', amount: 4500.00, type: 'income', category: 'Vendas', date: '2023-10-05' },
  { id: 3, description: 'Salário Marceneiro João', amount: -2500.00, type: 'expense', category: 'Salários', date: '2023-10-05' },
];

export const INITIAL_QUOTES: Quote[] = [
  { 
    id: 1, 
    client: 'Ana Souza', 
    title: 'Cozinha Planejada', 
    status: 'pending', 
    total: 9000.00, 
    items: [
      { name: 'MDF Branco', cost: 1200 },
      { name: 'Ferragens', cost: 800 }
    ]
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 1,
    name: 'João Silva',
    role: 'Marceneiro',
    phone: '(11) 99999-9999',
    payRate: 2500,
    payPeriod: 'Quinzena',
    activeProjectIds: [1],
    status: 'Ativo'
  },
  {
    id: 2,
    name: 'Pedro Santos',
    role: 'Ajudante',
    phone: '(11) 98888-8888',
    payRate: 1500,
    payPeriod: 'Quinzena',
    activeProjectIds: [],
    status: 'Ativo'
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 1, name: 'Madeireira Itaipu', address: 'Rua Germano Franck, 935' },
  { id: 2, name: 'Leo Madeiras', address: 'Av. Principal, 500' }
];

export const INITIAL_SALESPEOPLE: Salesperson[] = [
  { id: 1, supplierId: 1, name: 'Natalia Louzada', phone: '5585985556822' }, // Exemplo formatado
  { id: 2, supplierId: 2, name: 'Carlos Vendedor', phone: '5511999999999' }
];

export const INITIAL_COMPANY_PROFILE: CompanyProfile = {
  name: 'MarcenariaPro',
  slogan: 'Soluções em Móveis Planejados',
  cnpj: '00.000.000/0001-00',
  phone: '(85) 99999-9999',
  address: 'Rua da Marcenaria, 123 - Centro',
  email: 'contato@marcenaria.com'
};

export const CATEGORIES = [
  { id: 'Chapas', color: 'text-amber-600', bg: 'bg-amber-100' },
  { id: 'Ferragens', color: 'text-slate-600', bg: 'bg-slate-100' },
  { id: 'Insumos', color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 'Madeira', color: 'text-emerald-600', bg: 'bg-emerald-100' }
];

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// --- Catálogo de Preços Sugeridos (Atualizado Jan/2026 - Leo Madeiras) ---
export const SUGGESTED_MATERIALS = [
  {
    category: "1️⃣ CHAPAS - MDF BRANCO (6mm)",
    items: [
      { name: "MDF Branco Puro Texturizado 2 Faces Leo (Berneck) - 6mm", price: 191.90 },
      { name: "MDF Branco Pintado 1 Face Eucatex - 6mm", price: 191.90 },
      { name: "MDF Branco Ártico Trama 2 Faces Duratex - 6mm", price: 193.90 },
      { name: "MDF Branco Texturizado RUC (Resistente Umidade) Guararapes - 6mm", price: 246.90 },
      { name: "MDF Branco Ártico Texturizado Ultra Premium Duratex - 6mm", price: 246.90 }
    ]
  },
  {
    category: "2️⃣ CHAPAS - MDF BRANCO (9mm)",
    items: [
      { name: "MDF Branco Texturizado 2 Faces Guararapes - 9mm", price: 225.90 },
      { name: "MDF Branco Texturizado RUC (Resistente Umidade) Guararapes - 9mm", price: 302.90 },
      { name: "MDF Branco Ártico Texturizado Fire (Ignífugo) Duratex - 9mm", price: 462.90 },
      { name: "MDF Branco Liso 1 Face (Fundo) Berneck - 9mm", price: 0, unavailable: true },
      { name: "MDF Branco Texturizado 1 Face Guararapes - 9mm", price: 0, unavailable: true }
    ]
  },
  {
    category: "3️⃣ CHAPAS - MDF BRANCO (15mm)",
    items: [
      { name: "MDF Branco Puro Texturizado 2 Faces Leo (Berneck) - 15mm", price: 225.90 },
      { name: "MDF Branco Texturizado 2 Faces Fibraplac - 15mm", price: 225.90 },
      { name: "MDF Branco Texturizado 2 Faces Guararapes - 15mm", price: 232.90 },
      { name: "MDF Branco Ártico Trama 2 Faces Duratex - 15mm", price: 238.90 },
      { name: "MDF Branco Texturizado RUC (Resistente Umidade) Guararapes - 15mm", price: 360.90 },
      { name: "MDF Branco Texturizado Resistente à Umidade Arauco - 15mm", price: 360.90 },
      { name: "MDF Branco Ártico Texturizado Fire (Ignífugo) Duratex - 15mm", price: 769.90 }
    ]
  },
  {
    category: "4️⃣ CHAPAS - MDF BRANCO (18mm)",
    items: [
      { name: "MDF Branco Puro Texturizado 2 Faces Leo (Berneck) - 18mm", price: 288.90 },
      { name: "MDF Branco Texturizado 2 Faces Placas do Brasil - 18mm", price: 288.90 },
      { name: "MDF Branco Texturizado FSC 2 Faces Duratex - 18mm", price: 288.90 },
      { name: "MDF Branco Ártico Trama 2 Faces Duratex - 18mm", price: 306.90 },
      { name: "MDF Branco Texturizado Resistente à Umidade Arauco - 18mm", price: 433.90 },
      { name: "MDF Branco Ártico Texturizado Fire (Ignífugo) Duratex - 18mm", price: 811.90 }
    ]
  },
  {
    category: "5️⃣ CHAPAS - MDF AMADEIRADO (6mm)",
    items: [
      { name: "MDF Freijó Ripado ou Elmo Ávila (1 Face Branco) - 6mm", price: 283.90 },
      { name: "MDF Nogal Sevilha Poro 2 Faces (Berneck) - 6mm", price: 286.90 },
      { name: "MDF Nogueira Artezzano Grann 2 Faces (Berneck) - 6mm", price: 300.90 },
      { name: "MDF Pau Ferro Natural (1 Face Branco) - 6mm", price: 328.90 },
      { name: "MDF Nogal Terracota Nature (1 Face Branco) - 6mm", price: 139.90 }
    ]
  },
  {
    category: "6️⃣ CHAPAS - MDF AMADEIRADO (15mm)",
    items: [
      { name: "MDF Grão Leo 111 (Evidências) - 15mm", price: 346.90 },
      { name: "MDF Nogueira Modena Leo 207 (Evidências) - 15mm", price: 416.90 },
      { name: "MDF Louro Freijó Grann (Berneck) - 15mm", price: 430.90 },
      { name: "MDF Louro Freijó Poro (Arauco) - 15mm", price: 434.90 },
      { name: "MDF Louro Freijó Trend (Arauco) - 15mm", price: 453.90 },
      { name: "MDF Louro Freijó Supermatt (Eucatex) - 15mm", price: 485.90 },
      { name: "MDF Baru Micro (Substituto Carvalho) (Berneck) - 15mm", price: 411.90 }
    ]
  },
  {
    category: "7️⃣ COMPENSADOS E FLEXÍVEIS",
    items: [
      { name: "Compensado Flexível Sumaúma (Longitudinal) 3mm x 2,50 x 1,22m", price: 189.90 },
      { name: "Compensado Flexível Sumaúma (Transversal) 3mm x 1,22 x 2,50m", price: 189.90 },
      { name: "Compensado Naval Paricá/Virola Capa C/C (4mm) 2,20x1,60m", price: 98.90 },
      { name: "Compensado Naval Paricá/Virola Capa C/C (10mm) 2,20x1,60m", price: 165.90 },
      { name: "Compensado Naval Paricá/Virola Capa C/C (15mm) 2,20x1,60m", price: 235.90 },
      { name: "Compensado Naval Paricá/Virola Capa C/C (18mm) 2,20x1,60m", price: 298.90 }
    ]
  },
  {
    category: "8️⃣ FITAS DE BORDA PVC (BRANCO)",
    items: [
      { name: "Fita de Borda Branco Texturizado (Leo) 22mm x 20m", price: 13.26 },
      { name: "Fita de Borda Branco Texturizado (Rehau) 22mm x 50m", price: 32.90 },
      { name: "Fita de Borda Branco Texturizado (Rehau) 22mm x 300m (Caixa)", price: 155.00 },
      { name: "Fita de Borda Branco Texturizado (Leo) 35mm x 20m", price: 19.81 },
      { name: "Fita de Borda Branco Texturizado (Rehau) 35mm x 50m", price: 49.90 },
      { name: "Fita de Borda Branco Texturizado (Leo) 64mm x 20m", price: 36.85 },
      { name: "Fita de Borda Branco Ártico Trama (Tegus) 22mm x 20m", price: 23.90 }
    ]
  },
  {
    category: "9️⃣ FITAS DE BORDA PVC (AMADEIRADOS)",
    items: [
      { name: "Fita de Borda Louro Freijó 22mm x 20m", price: 26.90 },
      { name: "Fita de Borda Louro Freijó 35mm x 20m", price: 42.90 },
      { name: "Fita de Borda Louro Freijó 64mm x 20m", price: 78.90 },
      { name: "Fita de Borda Freijó / Elmo 22mm x 20m", price: 26.90 },
      { name: "Fita de Borda Nogal / Nogueira 22mm x 20m", price: 28.90 },
      { name: "Fita de Borda Nogal / Nogueira 64mm x 20m", price: 82.90 },
      { name: "Fita de Borda Carvalho 22mm x 20m", price: 29.90 },
      { name: "Fita de Borda Carvalho 64mm x 20m", price: 85.90 },
      { name: "Fita de Borda Pau Ferro 22mm x 20m", price: 28.90 }
    ]
  },
  {
    category: "🔟 FITAS DE BORDA PVC (PRETO)",
    items: [
      { name: "Fita de Borda Preto Design/Texturizado (Proadec) 22mm x 20m", price: 18.90 },
      { name: "Fita de Borda Preto Trama (Rehau) 35mm x 20m", price: 64.90 },
      { name: "Fita de Borda Preto Texturizado (Proadec) 65mm x 20m", price: 92.42 },
      { name: "Fita de Borda Preto Texturizado (Proadec) 22mm x 50m", price: 45.90 }
    ]
  },
  {
    category: "1️⃣1️⃣ DOBRADIÇAS 35mm (CANECO)",
    items: [
      { name: "Dobradiça Reta 110º com Amortecedor Calço Fixo Leo (10 un)", price: 41.90 },
      { name: "Dobradiça Reta 110º com Amortecedor Clip Blum (2 un)", price: 32.90 },
      { name: "Dobradiça Reta 110º Easy Deslizante FGVTN (10 un)", price: 32.90 },
      { name: "Dobradiça Curva 110º com Amortecedor Curva Clip Leo (10 un)", price: 49.90 },
      { name: "Dobradiça Curva 110º Deslizante FGV (10 un)", price: 49.90 },
      { name: "Dobradiça Super Curva 110º com Amortecedor Clip Leo (10 un)", price: 50.90 },
      { name: "Dobradiça Super Curva 110º com Amortecedor Clip TN (10 un)", price: 60.90 },
      { name: "Dobradiça Super Curva 110º com Amortecedor Calço Fixo Renna (10 un)", price: 35.90 }
    ]
  },
  {
    category: "1️⃣2️⃣ DOBRADIÇAS ESPECIAIS E PIVÔS",
    items: [
      { name: "Kit Pivô para Porta Pivotante Inox (Escovado) Até 150kg", price: 69.90 },
      { name: "Kit Pivô para Porta Pivotante Inox (Polido) Até 80kg", price: 45.90 },
      { name: "Dobradiça Pivotante para Móveis (Cromada) - Par", price: 12.90 },
      { name: "Dobradiça Invisível para Portas (Embutir) 40kg a 60kg", price: 129.90 }
    ]
  },
  {
    category: "1️⃣3️⃣ AMORTECEDORES E PISTÕES A GÁS",
    items: [
      { name: "Pistão a Gás Força Normal TN/Renna (60N, 80N, 100N)", price: 8.49 },
      { name: "Pistão a Gás Força Normal TN/Renna (120N, 140N)", price: 9.48 },
      { name: "Pistão a Gás Inverso (Abertura para baixo) 80N", price: 14.90 },
      { name: "Pistão a Gás para Cama Baú MG7 (100kg/1000N)", price: 39.73 },
      { name: "Amortecedor Soft Closing Universal FGV (Porta de Correr)", price: 45.90 },
      { name: "Amortecedor Folga Zero Joelini (Porta de Correr)", price: 73.90 }
    ]
  },
  {
    category: "1️⃣4️⃣ CORREDIÇAS TELESCÓPICAS (PAR)",
    items: [
      { name: "Telescópica Standard Zincada Leo 250mm", price: 18.90 },
      { name: "Telescópica Standard Zincada Leo 300mm", price: 19.90 },
      { name: "Telescópica Standard Zincada Leo 350mm", price: 21.90 },
      { name: "Telescópica Standard (Estreita) Leo 400mm", price: 24.90 },
      { name: "Telescópica Larga 35kg Renna 400mm", price: 18.90 },
      { name: "Telescópica Larga 35kg FGV 400mm", price: 27.90 },
      { name: "Telescópica Larga Abertura Total FGV 450mm", price: 27.90 },
      { name: "Telescópica com Amortecedor Leo 450mm", price: 54.90 },
      { name: "Telescópica Standard Zincada Leo 500mm", price: 31.90 },
      { name: "Telescópica Reforçada (50kg) Hafele 500mm", price: 49.90 },
      { name: "Telescópica Standard Zincada Leo 550mm", price: 35.90 }
    ]
  },
  {
    category: "1️⃣5️⃣ CORREDIÇAS INVISÍVEIS/OCULTAS (PAR)",
    items: [
      { name: "Oculta Soft Closing FGVTN 300mm", price: 64.90 },
      { name: "Oculta Soft Closing Hafele 350mm", price: 74.90 },
      { name: "Oculta Soft Closing Leo 400mm", price: 65.90 },
      { name: "Oculta Soft Closing FGVTN 450mm", price: 72.90 },
      { name: "Oculta Push to Open FGVTN 450mm", price: 72.92 },
      { name: "Oculta Soft Closing Hafele 500mm", price: 93.90 },
      { name: "Oculta Soft Closing Leo 550mm", price: 94.90 },
      { name: "Oculta Push to Open FGVTN 550mm", price: 102.91 }
    ]
  },
  {
    category: "1️⃣6️⃣ FECHADURAS PARA MÓVEIS",
    items: [
      { name: "Fechadura Gaveta Cilindro 22mm Cromada (Papaiz)", price: 14.90 },
      { name: "Fechadura Gaveta Cilindro 31mm Cromada (Papaiz)", price: 17.90 },
      { name: "Fechadura Lingueta Lateral (Arquivos)", price: 19.90 },
      { name: "Fechadura Bico de Papagaio (Portas Correr)", price: 21.90 }
    ]
  },
  {
    category: "1️⃣7️⃣ PUXADORES (PERFIS E ALÇAS)",
    items: [
      { name: "Puxador Facetado RM-048 (Alumínio Fosco) 3m", price: 98.90 },
      { name: "Puxador Facetado RM-048 (Preto/Inox) 3m", price: 129.90 },
      { name: "Puxador Gola / Cava (Alumínio Fosco) 3m", price: 119.90 },
      { name: "Puxador Concha de Sobrepor (Perfil) 3m", price: 89.90 },
      { name: "Puxador Tubo 12mm (Inox Escovado) 96mm", price: 12.90 },
      { name: "Puxador Tubo 12mm (Inox Escovado) 128mm", price: 15.90 },
      { name: "Puxador Tubo 12mm (Inox Escovado) 192mm", price: 22.90 },
      { name: "Puxador Tubo 12mm (Inox Escovado) 256mm", price: 28.90 },
      { name: "Puxador Ponto (Botão) Alumínio/Inox", price: 8.90 }
    ]
  },
  {
    category: "1️⃣8️⃣ VARÕES E ACESSÓRIOS",
    items: [
      { name: "Tubo Cabideiro Oval Reto Cromado (Standard) 3m", price: 19.90 },
      { name: "Tubo Cabideiro Oval Reto Anodizado (Fosco) 3m", price: 31.90 },
      { name: "Tubo Cabideiro Oval Canelado Anodizado (Reforçado) 3m", price: 50.90 },
      { name: "Suporte Lateral para Tubo Oval (Zamac)", price: 1.50 },
      { name: "Suporte Aéreo/Teto para Tubo Oval (Zamac)", price: 6.90 }
    ]
  },
  {
    category: "1️⃣9️⃣ PORTAS E BATENTES",
    items: [
      { name: "Porta Lisa Curupixá (Para Verniz) 60/70/80 x 210", price: 199.90 },
      { name: "Porta Lisa Curupixá (Para Verniz) 90 x 210", price: 229.90 },
      { name: "Porta Lisa Branca (Acabamento UV) 60/70/80 x 210", price: 289.90 },
      { name: "Porta Frisada Branca (Modelo Roma/Milão) 60/70/80 x 210", price: 349.90 },
      { name: "Batente (Caixilho) Tauari Misto 14cm", price: 149.90 },
      { name: "Jogo de Vistas (Alisares) Tauari 5cm ou 7cm", price: 65.90 }
    ]
  },
  {
    category: "2️⃣0️⃣ FERRAGENS DE UNIÃO",
    items: [
      { name: "Cantoneira Cadeirinha 2 Furos (Zincada) 100un", price: 14.90 },
      { name: "Cantoneira Cadeirinha 2 Furos (Branca) 100un", price: 18.90 },
      { name: "Capa Plástica para Cantoneira (Branca/Marfim) 100un", price: 8.90 },
      { name: "Suporte Angular (Zamac) 2 Furos 10un", price: 12.90 }
    ]
  },
  {
    category: "2️⃣1️⃣ PARAFUSOS E FIXADORES",
    items: [
      { name: "Parafuso 3,5 x 14 mm (1.000 un)", price: 39.90 },
      { name: "Parafuso 4,0 x 14 mm (1.000 un)", price: 42.90 },
      { name: "Parafuso 4,0 x 25 mm (1.000 un)", price: 49.94 },
      { name: "Parafuso 4,0 x 40 mm (500 un)", price: 38.00 },
      { name: "Parafuso 4,0 x 50 mm (500 un)", price: 52.90 },
      { name: "Parafuso 4,5 x 60 mm (200 un)", price: 22.90 },
      { name: "Parafuso 3,0 x 12 mm (1.000 un)", price: 31.90 }
    ]
  },
  {
    category: "2️⃣2️⃣ BUCHAS E FIXAÇÃO",
    items: [
      { name: "Bucha 6mm S/Simples Nylon (Leo) 200un", price: 27.90 },
      { name: "Bucha 8mm S/Simples Nylon (Leo) 100un", price: 24.90 },
      { name: "Bucha 10mm S/Simples Nylon (Leo) 50un", price: 18.90 },
      { name: "Bucha 6mm MU Universal 200un", price: 27.90 },
      { name: "Bucha 8mm MU Universal 100un", price: 24.90 },
      { name: "Bucha Fly/Borboleta (Gesso) 100un", price: 49.99 },
      { name: "Bucha 10mm Kwik Tog/Fly (Gesso) 150un", price: 159.90 },
      { name: "Bucha Togglerbolt (Cargas Pesadas) 2un", price: 15.90 }
    ]
  },
  {
    category: "2️⃣3️⃣ COLAS E ADESIVOS",
    items: [
      { name: "Cola de Contato (Amarela) Extra Leo (Galão 2,8kg)", price: 96.90 },
      { name: "Cola de Contato (Amarela) Extra Leo (Lata 750g)", price: 30.90 },
      { name: "Cola de Contato (Amarela) Cascola (Bisnaga 195g)", price: 19.90 },
      { name: "Cola de Contato (Amarela) Spray Extra Kisafix 340g", price: 43.90 },
      { name: "Cola Branca PVA Extra Leo 500g", price: 16.90 },
      { name: "Cola Branca PVA Extra Leo 1kg", price: 25.90 },
      { name: "Cola Branca PVA Extra Leo 5kg", price: 98.90 },
      { name: "Cola Madeira (Amarela) Almaflex 500g", price: 22.90 },
      { name: "Cola Instantânea (Média Visc.) Leo 100g", price: 29.90 },
      { name: "Cola Instantânea 793 Tekbond 20g", price: 12.90 },
      { name: "Cola Instantânea 793 Tekbond 100g", price: 39.90 },
      { name: "Kit MDF (Adesivo + Acelerador) Tekbond", price: 49.90 }
    ]
  },
  {
    category: "2️⃣4️⃣ SELANTES E ESPUMAS",
    items: [
      { name: "Cola PU 40 (Branco/Cinza/Preto) 400g", price: 29.90 },
      { name: "Espuma Expansiva PU Multiuso 500ml", price: 29.90 },
      { name: "Espuma Expansiva PU Multiuso 750ml", price: 42.90 }
    ]
  },
  {
    category: "2️⃣5️⃣ TAPA FUROS E ACABAMENTOS",
    items: [
      { name: "Tapa Furo Adesivo 12mm Branco (Cartela ~50un)", price: 4.50 },
      { name: "Tapa Furo Adesivo 12mm Madeirados (Cartela ~50un)", price: 5.90 },
      { name: "Tapa Furo Plástico (Pacote 100un)", price: 8.90 },
      { name: "Massa Tapa Furos Bisnaga 90g", price: 18.90 }
    ]
  },
  {
    category: "2️⃣6️⃣ MANTAS E PROTEÇÃO",
    items: [
      { name: "Manta Polietileno Expandido 2mm (Rolo 25m)", price: 39.90 },
      { name: "Manta Polietileno Expandido 5mm (Rolo 10m)", price: 45.90 },
      { name: "Manta de Feltro Adesivo (Placa 24x45cm)", price: 19.90 },
      { name: "Feltro Adesivo Redondo/Quadrado (Cartela)", price: 9.90 }
    ]
  },
  {
    category: "2️⃣7️⃣ CANTONEIRAS E PERFIS DE ACABAMENTO",
    items: [
      { name: "Cantoneira L Alumínio 1/2\" (12,7mm) Fosco 3m", price: 22.90 },
      { name: "Cantoneira L Alumínio 3/4\" (19mm) Fosco 3m", price: 34.90 },
      { name: "Cantoneira L Alumínio 1\" (25,4mm) Fosco 3m", price: 46.90 },
      { name: "Cantoneira L Alumínio 19mm Branco 3m", price: 39.90 },
      { name: "Cantoneira L Alumínio 19mm Preto 3m", price: 39.90 },
      { name: "Perfil U Acabamento 15mm (Topo) Anodizado 3m", price: 29.90 },
      { name: "Perfil U Acabamento 18mm (Topo) Anodizado 3m", price: 32.90 }
    ]
  },
  {
    category: "2️⃣8️⃣ LAMINADOS DECORATIVOS (FÓRMICA/PET)",
    items: [
      { name: "Laminado Pet Branco Texturizado Ibrap 2,80x1,25m", price: 68.90 },
      { name: "Fórmica Branco Texturizada Leo 3,05x1,22m", price: 139.90 },
      { name: "Fórmica Branco Texturizada PP60 Pertech 3,08x1,25m", price: 150.90 },
      { name: "Fórmica Branco Texturizada L120 Formiline 3,08x1,25m", price: 169.90 },
      { name: "Laminado Pet Preto Texturizado Ibrap 2,80x1,25m", price: 68.90 },
      { name: "Fórmica Preto Texturizada Leo 3,05x1,22m", price: 209.90 },
      { name: "Fórmica Preto Texturizada PP15 Pertech 3,08x1,25m", price: 249.90 },
      { name: "Fórmica Real Color Preto L121 3,08x1,25m", price: 529.90 }
    ]
  },
  {
    category: "2️⃣9️⃣ LIMPEZA E SOLVENTES",
    items: [
      { name: "Estopa Extra Branco Leo 500g", price: 14.90 },
      { name: "Algodão Penteado Branco Leo 500g", price: 15.90 },
      { name: "Thinner para Limpeza Leo 900ml", price: 18.90 },
      { name: "Thinner para Limpeza Leo 5 Litros", price: 94.90 },
      { name: "Thinner para Limpeza Leo 18 Litros", price: 329.90 },
      { name: "Thinner Profissional DN4288 Sayerlack 900ml", price: 27.90 },
      { name: "Thinner Profissional DN4288 Sayerlack 5 Litros", price: 129.90 },
      { name: "Aguarrás Sayerraz DS451 Sayerlack 900ml", price: 26.90 },
      { name: "Aguarrás Sayerraz DS451 Sayerlack 5 Litros", price: 139.90 },
      { name: "Limpador de Colas e Adesivos Leo 900ml", price: 43.90 }
    ]
  },
  {
    category: "3️⃣0️⃣ TRILHOS E PERFIS DE ALUMÍNIO",
    items: [
      { name: "Trilho Superior Duplo (Capa/Base) Reforçado 3m", price: 108.90 },
      { name: "Trilho Superior Simples (U) RM-013 3m", price: 72.90 },
      { name: "Trilho Inferior Simples de Embutir RM-023 3m", price: 42.90 },
      { name: "Trilho Inferior Simples de Sobrepor RM-022 3m", price: 54.90 },
      { name: "Trilho Inferior Duplo de Sobrepor Reforçado 3m", price: 98.50 },
      { name: "Perfil Puxador Gola / Cava (Alumínio Fosco) 3m", price: 119.90 },
      { name: "Kit Sistema de Correr RO-65 (1 Porta)", price: 59.90 }
    ]
  }
];
