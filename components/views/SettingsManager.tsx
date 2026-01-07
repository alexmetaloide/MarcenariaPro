
import React, { useState, useEffect } from 'react';
import { Save, Building2, MapPin, Phone, Mail, FileText, Type, ArrowLeft } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CompanyProfile } from '../../types';

interface SettingsManagerProps {
  companyProfile: CompanyProfile;
  setCompanyProfile: (profile: CompanyProfile) => void;
  onClose: () => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({ companyProfile, setCompanyProfile, onClose }) => {
  const [formData, setFormData] = useState<CompanyProfile>(companyProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormData(companyProfile);
  }, [companyProfile]);

  const handleSave = () => {
    setCompanyProfile(formData);
    setSaved(true);
    
    // Mostra a mensagem de salvo e fecha após 800ms
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Building2 className="text-amber-600" /> Configurações da Empresa
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Estes dados aparecerão no cabeçalho das suas propostas comerciais.</p>
        </div>
        <Button variant="secondary" onClick={onClose} icon={ArrowLeft}>Voltar</Button>
      </div>

      <Card className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold border-b dark:border-slate-700 pb-2 mb-4">
               <Type size={18} /> Identificação
             </div>
             
             <Input 
               label="Nome Fantasia da Marcenaria" 
               value={formData.name} 
               onChange={e => setFormData({...formData, name: e.target.value})}
               placeholder="Ex: Marcenaria Silva"
             />
             
             <Input 
               label="Slogan / Subtítulo" 
               value={formData.slogan || ''} 
               onChange={e => setFormData({...formData, slogan: e.target.value})}
               placeholder="Ex: Móveis Planejados & Interiores"
             />
             
             <Input 
               label="CNPJ" 
               value={formData.cnpj} 
               onChange={e => setFormData({...formData, cnpj: e.target.value})}
               placeholder="00.000.000/0000-00"
             />
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold border-b dark:border-slate-700 pb-2 mb-4">
               <MapPin size={18} /> Contato e Localização
             </div>
             
             <Input 
               label="Endereço Completo" 
               value={formData.address} 
               onChange={e => setFormData({...formData, address: e.target.value})}
               placeholder="Rua Exemplo, 123 - Bairro - Cidade/UF"
             />
             
             <Input 
               label="Telefone / WhatsApp Comercial" 
               value={formData.phone} 
               onChange={e => setFormData({...formData, phone: e.target.value})}
               placeholder="(00) 00000-0000"
             />
             
             <Input 
               label="E-mail" 
               value={formData.email || ''} 
               onChange={e => setFormData({...formData, email: e.target.value})}
               placeholder="contato@marcenaria.com"
             />
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700 gap-2">
           <Button variant="secondary" onClick={onClose}>Cancelar</Button>
           <Button onClick={handleSave} icon={Save} className="min-w-[150px]">
             {saved ? 'Salvo!' : 'Salvar e Fechar'}
           </Button>
        </div>
      </Card>
      
      {/* Visualização (Preview) do Cabeçalho */}
      <div className="mt-8 opacity-75">
         <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Pré-visualização do Cabeçalho na Proposta</h3>
         <div className="bg-white p-8 border-b-4 border-amber-600 shadow-sm rounded-t-lg">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-amber-600 leading-none">{formData.name || 'Nome da Marcenaria'}</h1>
                    <p className="text-slate-500 mt-1">{formData.slogan || 'Seu slogan aqui'}</p>
                    <p className="text-xs text-slate-400 mt-2">
                       {formData.cnpj ? `CNPJ: ${formData.cnpj}` : 'CNPJ: 00.000.000/0000-00'} • {formData.phone || '(00) 0000-0000'}
                    </p>
                </div>
                <div className="text-right text-xs text-slate-400 max-w-[200px]">
                   {formData.address || 'Endereço da empresa'}
                   {formData.email && <br/>}
                   {formData.email}
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};
