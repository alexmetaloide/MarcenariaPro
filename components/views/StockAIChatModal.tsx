
import React, { useState, useRef, useEffect } from 'react';
import {
    X,
    Loader2,
    BrainCircuit,
    Send,
    Sparkles,
    CheckCircle,
    Package,
    MessageSquare,
    FileText,
    Camera,
    Upload,
    RefreshCw,
    Image as ImageIcon,
    AlertCircle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { formatCurrency } from '../../constants';

export interface ExtractedItem {
    name: string;
    category: string;
    quantity: number;
    price: number;
    unit: string;
}

interface StockAIChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (items: ExtractedItem[]) => void;
}

type InputMode = 'chat' | 'pdf' | 'camera';
type Step = 'input' | 'preview';

export const StockAIChatModal: React.FC<StockAIChatModalProps> = ({ isOpen, onClose, onImport }) => {
    const [step, setStep] = useState<Step>('input');
    const [inputMode, setInputMode] = useState<InputMode>('chat');
    const [message, setMessage] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // PDF state
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Camera state
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Cleanup camera on modal close or mode change
    useEffect(() => {
        return () => {
            // Inline cleanup to avoid referencing stopCamera before initialization
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (inputMode !== 'camera') {
            // Inline cleanup
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            setIsCameraActive(false);
        }
    }, [inputMode]);

    if (!isOpen) return null;

    const getApiKey = () => {
        const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
        return envKey || apiKey;
    };

    const getAIPrompt = (content: string) => `
        Você é um assistente de estoque para uma marcenaria.
        Analise o conteúdo abaixo e extraia TODOS os itens de estoque/materiais encontrados.
        
        Retorne APENAS um JSON array válido, sem markdown, sem explicações adicionais.
        Cada item deve ter o seguinte formato:
        {
          "name": "Nome do item (seja específico, inclua dimensões se houver)",
          "category": "Uma destas categorias: Chapas, Ferragens, Insumos, Outros",
          "quantity": numero (quantidade encontrada, default 1),
          "price": numero (preço unitário encontrado, ou 0 se não informado),
          "unit": "un, cm, m, m², L, kg" (tente inferir a unidade, default para 'un')
        }

        Conteúdo para analisar:
        ${content}
    `;

    const getImagePrompt = () => `
        Você é um assistente de estoque para uma marcenaria.
        Analise esta imagem de um documento (pode ser nota fiscal, lista de preços, orçamento, etc).
        Extraia TODOS os itens de estoque/materiais encontrados na imagem.
        
        Retorne APENAS um JSON array válido, sem markdown, sem explicações adicionais.
        Cada item deve ter o seguinte formato:
        {
          "name": "Nome do item (seja específico, inclua dimensões se houver)",
          "category": "Uma destas categorias: Chapas, Ferragens, Insumos, Outros",
          "quantity": numero (quantidade encontrada, default 1),
          "price": numero (preço unitário encontrado, ou 0 se não informado),
          "unit": "un, cm, m, m², L, kg" (tente inferir a unidade, default para 'un')
        }
    `;

    // ==================== PDF Functions ====================

    const extractTextFromPDF = async (file: File): Promise<string> => {
        // Dynamic import to avoid initialization errors
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs';

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n';
        }

        return fullText;
    };

    const handleFileSelect = (file: File) => {
        if (file.type !== 'application/pdf') {
            setError('Por favor, selecione um arquivo PDF.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('O arquivo deve ter no máximo 10MB.');
            return;
        }
        setUploadedFile(file);
        setError(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    // ==================== Camera Functions ====================

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraActive(true);
            setError(null);
        } catch (err) {
            console.error('Camera error:', err);
            setError('Não foi possível acessar a câmera. Verifique as permissões.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0);
            const imageData = canvas.toDataURL('image/jpeg', 0.85);
            setCapturedImage(imageData);
            stopCamera();
        }
    };

    const retakePhoto = () => {
        setCapturedImage(null);
        startCamera();
    };

    // ==================== AI Processing ====================

    const processWithAI = async () => {
        const finalKey = getApiKey();

        if (!finalKey) {
            setError("API Key do Gemini é necessária. Configure no .env ou insira abaixo.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const genAI = new GoogleGenerativeAI(finalKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            let result;

            if (inputMode === 'chat') {
                if (!message.trim()) {
                    setError("Digite uma mensagem para o agente.");
                    setIsLoading(false);
                    return;
                }
                result = await model.generateContent(getAIPrompt(message));

            } else if (inputMode === 'pdf') {
                if (!uploadedFile) {
                    setError("Selecione um arquivo PDF.");
                    setIsLoading(false);
                    return;
                }
                const pdfText = await extractTextFromPDF(uploadedFile);
                if (!pdfText.trim()) {
                    setError("Não foi possível extrair texto do PDF. Verifique se o arquivo contém texto.");
                    setIsLoading(false);
                    return;
                }
                result = await model.generateContent(getAIPrompt(pdfText));

            } else if (inputMode === 'camera') {
                if (!capturedImage) {
                    setError("Tire uma foto primeiro.");
                    setIsLoading(false);
                    return;
                }
                const base64Data = capturedImage.split(',')[1];
                result = await model.generateContent([
                    getImagePrompt(),
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: base64Data
                        }
                    }
                ]);
            }

            if (!result) {
                throw new Error("Erro ao processar com IA.");
            }

            const response = await result.response;
            const textResponse = response.text();

            const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const items = JSON.parse(cleanedText) as ExtractedItem[];
            const validItems = items.filter(i => i.name && typeof i.quantity === 'number');

            if (validItems.length === 0) {
                setError("Não consegui identificar itens. Tente com um conteúdo diferente.");
            } else {
                setExtractedItems(validItems);
                setStep('preview');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Ocorreu um erro ao processar. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveItem = (index: number) => {
        setExtractedItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpdateItem = (index: number, field: keyof ExtractedItem, value: any) => {
        setExtractedItems(prev => prev.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ));
    };

    const handleConfirmImport = () => {
        onImport(extractedItems);
        handleClose();
    };

    const handleClose = () => {
        stopCamera();
        setStep('input');
        setInputMode('chat');
        setMessage('');
        setUploadedFile(null);
        setCapturedImage(null);
        setExtractedItems([]);
        setError(null);
        onClose();
    };

    const handleBackToInput = () => {
        setStep('input');
        setExtractedItems([]);
    };

    const modeConfig = {
        chat: { icon: MessageSquare, label: 'Chat', color: 'purple' },
        pdf: { icon: FileText, label: 'PDF', color: 'blue' },
        camera: { icon: Camera, label: 'Câmera', color: 'green' }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-xl w-full p-6 animate-slide-down border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-center mb-4 shrink-0">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <BrainCircuit size={24} className="text-purple-600" />
                        {step === 'preview' ? 'Revisar Itens' : 'Agente de Estoque'}
                    </h3>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-1">

                    {step === 'input' && (
                        <div className="space-y-4">

                            {/* Mode Selector */}
                            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                {(Object.keys(modeConfig) as InputMode[]).map((mode) => {
                                    const config = modeConfig[mode];
                                    const Icon = config.icon;
                                    const isActive = inputMode === mode;
                                    return (
                                        <button
                                            key={mode}
                                            onClick={() => setInputMode(mode)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-medium transition-all ${isActive
                                                ? `bg-white dark:bg-slate-700 shadow-sm text-${config.color}-600 dark:text-${config.color}-400`
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                                }`}
                                        >
                                            <Icon size={18} />
                                            <span className="hidden sm:inline">{config.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* API Key input if needed */}
                            {!(import.meta as any).env?.VITE_GEMINI_API_KEY && !apiKey && (
                                <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                    <p className="text-xs font-bold text-amber-800 dark:text-amber-500 mb-2">
                                        ⚠️ API Key necessária
                                    </p>
                                    <Input
                                        placeholder="Cole sua Gemini API Key..."
                                        value={apiKey}
                                        onChange={e => setApiKey(e.target.value)}
                                        type="password"
                                    />
                                </div>
                            )}

                            {/* Chat Mode */}
                            {inputMode === 'chat' && (
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-purple-600 rounded-lg text-white shrink-0">
                                                <Sparkles size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-purple-900 dark:text-purple-300 mb-1">Olá! Como posso ajudar?</p>
                                                <p className="text-sm text-purple-700 dark:text-purple-400">
                                                    Descreva os materiais que você quer adicionar ao estoque:
                                                </p>
                                                <ul className="text-sm text-purple-600 dark:text-purple-500 mt-2 space-y-1 list-disc list-inside">
                                                    <li>"5 chapas de MDF branco 15mm a R$180 cada"</li>
                                                    <li>"10 puxadores cromados e 20 dobradiças"</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <textarea
                                            className="w-full p-4 pr-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none h-32 transition-all"
                                            placeholder="Descreva os itens que deseja adicionar..."
                                            value={message}
                                            onChange={e => setMessage(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    processWithAI();
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={processWithAI}
                                            disabled={isLoading || !message.trim()}
                                            className="absolute right-3 bottom-3 p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* PDF Mode */}
                            {inputMode === 'pdf' && (
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-600 rounded-lg text-white shrink-0">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-blue-900 dark:text-blue-300 mb-1">Upload de PDF</p>
                                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                                    Envie listas de preços, notas fiscais ou orçamentos em PDF para extrair os itens automaticamente.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : uploadedFile
                                                ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                                                : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                                            }`}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf"
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileSelect(file);
                                            }}
                                            className="hidden"
                                        />

                                        {uploadedFile ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                                                    <CheckCircle size={32} className="text-green-600" />
                                                </div>
                                                <p className="font-medium text-slate-800 dark:text-slate-200">{uploadedFile.name}</p>
                                                <p className="text-sm text-slate-500">
                                                    {(uploadedFile.size / 1024).toFixed(1)} KB
                                                </p>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setUploadedFile(null);
                                                    }}
                                                    className="text-sm text-red-500 hover:text-red-600 mt-2"
                                                >
                                                    Remover arquivo
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full">
                                                    <Upload size={32} className="text-slate-400" />
                                                </div>
                                                <p className="font-medium text-slate-600 dark:text-slate-300">
                                                    Arraste um PDF aqui ou clique para selecionar
                                                </p>
                                                <p className="text-sm text-slate-400">
                                                    Máximo 10MB
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {uploadedFile && (
                                        <Button
                                            onClick={processWithAI}
                                            disabled={isLoading}
                                            className="w-full"
                                            icon={isLoading ? Loader2 : Sparkles}
                                        >
                                            {isLoading ? 'Processando PDF...' : 'Extrair Itens do PDF'}
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Camera Mode */}
                            {inputMode === 'camera' && (
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-green-600 rounded-lg text-white shrink-0">
                                                <Camera size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-green-900 dark:text-green-300 mb-1">Captura de Foto</p>
                                                <p className="text-sm text-green-700 dark:text-green-400">
                                                    Tire uma foto de notas fiscais, listas de materiais ou documentos para extrair os itens.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video">
                                        {/* Hidden canvas for capture */}
                                        <canvas ref={canvasRef} className="hidden" />

                                        {!isCameraActive && !capturedImage && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                                <div className="p-4 bg-slate-800 rounded-full">
                                                    <Camera size={40} className="text-slate-400" />
                                                </div>
                                                <Button onClick={startCamera} icon={Camera} variant="secondary">
                                                    Iniciar Câmera
                                                </Button>
                                            </div>
                                        )}

                                        {isCameraActive && (
                                            <>
                                                <video
                                                    ref={videoRef}
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    onClick={capturePhoto}
                                                    className="absolute bottom-4 left-1/2 -translate-x-1/2 p-4 bg-white rounded-full shadow-lg hover:scale-105 transition-transform"
                                                >
                                                    <div className="w-12 h-12 rounded-full border-4 border-green-600" />
                                                </button>
                                            </>
                                        )}

                                        {capturedImage && (
                                            <>
                                                <img
                                                    src={capturedImage}
                                                    alt="Captured"
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    onClick={retakePhoto}
                                                    className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white transition-colors"
                                                >
                                                    <RefreshCw size={18} />
                                                    <span className="font-medium">Tirar outra</span>
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {capturedImage && (
                                        <Button
                                            onClick={processWithAI}
                                            disabled={isLoading}
                                            className="w-full"
                                            icon={isLoading ? Loader2 : Sparkles}
                                        >
                                            {isLoading ? 'Analisando imagem...' : 'Extrair Itens da Foto'}
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Error display */}
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="space-y-4">
                            <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                                <p className="text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
                                    <CheckCircle size={16} />
                                    Encontrei <strong>{extractedItems.length}</strong> item(s). Revise antes de adicionar.
                                </p>
                            </div>

                            <div className="space-y-2">
                                {extractedItems.map((item, idx) => (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col gap-2 group">
                                        <div className="flex items-center gap-2">
                                            <Package size={16} className="text-amber-600 shrink-0" />
                                            <Input
                                                value={item.name}
                                                onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                                                className="flex-1 text-sm"
                                                placeholder="Nome"
                                            />
                                            <button
                                                onClick={() => handleRemoveItem(idx)}
                                                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                                title="Remover"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <div className="flex gap-2 pl-6">
                                            <select
                                                value={item.category}
                                                onChange={(e) => handleUpdateItem(idx, 'category', e.target.value)}
                                                className="text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-1"
                                            >
                                                <option value="Chapas">Chapas</option>
                                                <option value="Ferragens">Ferragens</option>
                                                <option value="Insumos">Insumos</option>
                                                <option value="Outros">Outros</option>
                                            </select>
                                            <Input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                                                className="w-16 text-xs"
                                                placeholder="Qtd"
                                            />
                                            <Input
                                                type="number"
                                                value={item.price}
                                                onChange={(e) => handleUpdateItem(idx, 'price', Number(e.target.value))}
                                                className="w-24 text-xs"
                                                placeholder="R$"
                                            />
                                        </div>
                                    </div>
                                ))}
                                {extractedItems.length === 0 && (
                                    <p className="text-center text-slate-500 py-8">Nenhum item para adicionar.</p>
                                )}
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 shrink-0">
                    {step === 'preview' && (
                        <>
                            <Button variant="secondary" onClick={handleBackToInput}>Voltar</Button>
                            <Button onClick={handleConfirmImport} disabled={extractedItems.length === 0} icon={CheckCircle} variant="success">
                                Adicionar ao Estoque
                            </Button>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};
