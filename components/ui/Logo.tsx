
import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 40, className = "", showText = false }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Círculo Esquerdo (Azul Escuro) */}
        <path 
          d="M50 5 A 45 45 0 0 0 50 95" 
          stroke="currentColor" 
          strokeWidth="6" 
          strokeLinecap="butt" 
          className="text-[#1e4e79] dark:text-blue-400"
          fill="none"
          strokeDasharray="130" // Cria a quebra no topo e embaixo
          strokeDashoffset="0"
          transform="rotate(15 50 50)" // Ajuste para alinhar as aberturas
        />
        
        {/* Círculo Direito (Cinza Escuro) */}
        <path 
          d="M50 95 A 45 45 0 0 0 50 5" 
          stroke="currentColor" 
          strokeWidth="6" 
          strokeLinecap="butt" 
          className="text-[#374151] dark:text-slate-400"
          fill="none"
          strokeDasharray="130"
          strokeDashoffset="0"
          transform="rotate(15 50 50)"
        />

        {/* Letra M */}
        <g transform="translate(28, 28) scale(0.44)">
             {/* Perna Esquerda (Azul) */}
             <path d="M10 0 V 100" stroke="#1e4e79" strokeWidth="18" className="stroke-[#1e4e79] dark:stroke-blue-400" />
             
             {/* Meio (Cinza Escuro) */}
             <path d="M10 0 L 50 60 L 90 0" fill="none" stroke="#374151" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" className="stroke-[#374151] dark:stroke-slate-400" />
             
             {/* Perna Direita (Laranja) */}
             <path d="M90 35 V 100" stroke="#ea580c" strokeWidth="18" className="stroke-amber-600" />
        </g>
      </svg>
      
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Marcenaria<span className="text-amber-600">Pro</span>
          </span>
        </div>
      )}
    </div>
  );
};
