
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO DO SUPABASE ---
// 1. Vá em Project Settings > API no painel do Supabase.
// 2. Copie a "Project URL" e a chave "anon public".
// 3. Cole abaixo entre as aspas.

const SUPABASE_URL = 'https://vvapgvnbwzroiracuilw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YXBndm5id3pyb2lyYWN1aWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NDM5MDAsImV4cCI6MjA4MzMxOTkwMH0.oMjIivbDyux3GJ_QHOoabt06KUxOxqreyT5dLg_euwo';

// Verificação de segurança para não quebrar a app se o process não existir (ambiente navegador puro)
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
  } catch (e) {
    return undefined;
  }
};

const finalUrl = getEnv('SUPABASE_URL') || SUPABASE_URL;
const finalKey = getEnv('SUPABASE_ANON_KEY') || SUPABASE_ANON_KEY;

export const supabase = createClient(finalUrl, finalKey);

export const isSupabaseConfigured = () => {
  return finalUrl !== 'https://sua-url-do-projeto.supabase.co' && 
         finalKey !== 'sua-chave-anonima-aqui';
};
