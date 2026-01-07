
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white dark:bg-slate-800 rounded-2xl shadow-md shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 p-6 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-slate-200' : ''} ${className}`}
  >
    {children}
  </div>
);
