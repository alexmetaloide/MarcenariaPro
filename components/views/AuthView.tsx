
import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Loader2, AlertTriangle, Box, CheckCircle2, Scissors, Wallet, FileText } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { User as UserType } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

interface AuthViewProps {
  onLogin: (user: UserType) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const isConfigured = isSupabaseConfigured();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured) {
      setError('Configure as chaves do Supabase no arquivo lib/supabaseClient.ts para continuar.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      
    } catch (err: any) {
      console.error(err);
      if (err.message.includes('Invalid login credentials')) {
        setError('Credenciais inválidas. Verifique seu e-mail e senha.');
      } else {
        setError(err.message || 'Ocorreu um erro na autenticação.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: FileText, title: "Orçamentos", desc: "Gere propostas profissionais em segundos." },
    { icon: Scissors, title: "Plano de Corte", desc: "Otimize chapas e reduza desperdícios." },
    { icon: Wallet, title: "Financeiro", desc: "Controle total de fluxo de caixa." },
    { icon: Box, title: "Estoque", desc: "Gestão inteligente de materiais." }
  ];

  const inputClassName = "w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium";

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] flex items-center justify-center p-4 md:p-6 font-sans">
      <div className="w-full max-w-[1200px] bg-white dark:bg-[#0f172a] rounded-[32px] shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[700px] border border-white/20 dark:border-slate-800">
        
        {/* Lado Esquerdo - Apresentação do Sistema */}
        <div className="hidden lg:flex lg:w-7/12 relative flex-col justify-between p-16 text-white overflow-hidden">
          {/* Background Image & Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-110"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=2000&auto=format&fit=crop")' }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-amber-900/90 z-10 backdrop-blur-[1px]"></div>
          
          <div className="relative z-20 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-12">
               <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
                 <Logo size={42} />
               </div>
               <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-white leading-none">
                    Marcenaria<span className="text-amber-400">Pro</span>
                  </h1>
                  <p className="text-xs text-slate-300 font-medium tracking-wide mt-1">SISTEMA INTEGRADO DE GESTÃO</p>
               </div>
            </div>
            
            <div className="mb-12">
              <h2 className="text-5xl font-bold leading-tight mb-6 tracking-tight">
                Transforme sua marcenaria em um <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">negócio de sucesso</span>.
              </h2>
              <p className="text-slate-200 text-lg font-light leading-relaxed max-w-lg">
                Uma plataforma completa projetada especificamente para marceneiros exigentes. Do primeiro contato ao corte final.
              </p>
            </div>

            {/* Grid de Features */}
            <div className="grid grid-cols-2 gap-4 mt-auto">
               {features.map((feature, idx) => (
                 <div key={idx} className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-amber-300 group-hover:text-amber-200 transition-colors">
                          <feature.icon size={20} />
                       </div>
                       <h3 className="font-bold text-white text-sm">{feature.title}</h3>
                    </div>
                    <p className="text-xs text-slate-300 group-hover:text-white transition-colors pl-1">
                      {feature.desc}
                    </p>
                 </div>
               ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center text-xs text-slate-400">
               <p>© {new Date().getFullYear()} MarcenariaPro. Todos os direitos reservados.</p>
               <div className="flex gap-4">
                  <span>v2.5.0</span>
                  <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Online</span>
               </div>
            </div>
          </div>
        </div>

        {/* Lado Direito - Formulário de Login */}
        <div className="w-full lg:w-5/12 p-8 md:p-16 flex flex-col justify-center bg-white dark:bg-[#0f172a] relative">
           
           {/* Mobile Header */}
           <div className="lg:hidden mb-12 text-center flex flex-col items-center">
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-full mb-4">
                <Logo size={48} />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                 Marcenaria<span className="text-amber-600">Pro</span>
              </h1>
              <p className="text-sm text-slate-500 font-medium">Gestão Inteligente</p>
           </div>

           <div className="max-w-md mx-auto w-full animate-fade-in">
              <div className="mb-10">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                    Bem-vindo de volta!
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-base">
                    Digite suas credenciais para acessar o painel.
                  </p>
              </div>

              {!isConfigured ? (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 mb-8 text-amber-900 dark:text-amber-200 text-sm shadow-sm">
                   <h3 className="font-bold flex items-center gap-2 mb-3 text-lg"><AlertTriangle size={20}/> Configuração Necessária</h3>
                   <p className="mb-3 leading-relaxed opacity-90">O sistema precisa ser conectado ao banco de dados.</p>
                   <ol className="list-decimal list-inside space-y-2 ml-1 text-xs font-mono bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
                      <li>Abra <code>lib/supabaseClient.ts</code></li>
                      <li>Insira <strong>Project URL</strong></li>
                      <li>Insira <strong>Anon Public Key</strong></li>
                   </ol>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-5">
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-600 transition-colors duration-200">
                             <Mail size={20} />
                          </div>
                          <input 
                            name="email"
                            type="email"
                            placeholder="exemplo@marcenaria.com"
                            value={formData.email}
                            onChange={handleChange}
                            className={inputClassName}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                           <div className="relative group">
                             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-600 transition-colors duration-200">
                                <Lock size={20} />
                             </div>
                             <input 
                               name="password"
                               type="password"
                               placeholder="Sua senha de acesso"
                               value={formData.password}
                               onChange={handleChange}
                               className={inputClassName}
                               required
                             />
                           </div>
                           <div className="flex justify-end">
                              <button type="button" className="text-xs font-semibold text-slate-500 hover:text-amber-600 transition-colors" onClick={() => alert("Entre em contato com o administrador do sistema.")}>
                                 Esqueceu a senha?
                              </button>
                           </div>
                        </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30 flex items-start gap-3 animate-slide-down">
                        <div className="p-1 bg-red-100 dark:bg-red-800 rounded-full mt-0.5">
                            <AlertTriangle size={14} className="text-red-600 dark:text-red-200" />
                        </div>
                        <p className="text-sm font-medium text-red-600 dark:text-red-300">{error}</p>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-amber-600/20 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
                        <>
                          Entrar no Sistema 
                          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                        </>
                      )}
                    </button>
                </form>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
