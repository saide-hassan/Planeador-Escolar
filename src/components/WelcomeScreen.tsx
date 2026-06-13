import React from 'react';
import { ArrowRight, Sparkles, Clock } from 'lucide-react';
import SettingsMenu from './SettingsMenu';

interface WelcomeScreenProps {
  onStart: () => void;
  onHistory: () => void;
  onProfile: () => void;
  onLogin: () => void;
  onLogout?: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

export default function WelcomeScreen({ onStart, onHistory, onProfile, onLogin, onLogout, darkMode, toggleTheme }: WelcomeScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F6FAFD] dark:bg-[#0d1b2a] text-slate-800 dark:text-white p-0 transition-colors duration-500 overflow-y-auto no-scrollbar">
      {/* Header (height: 56px, padding lateral: 20px) */}
      <header className="h-[56px] px-[20px] shrink-0 w-full flex justify-between items-center z-50 animate-in fade-in slide-in-from-top-4 duration-700">
        {/* Logo Left - apenas o ícone, tamanho 28px */}
        <div className="flex items-center">
          <img src="/logo.svg" alt="Logo" className="w-[28px] h-[28px]" />
        </div>

        {/* Right Actions - ícone de settings limpo outline */}
        <SettingsMenu 
          onProfile={onProfile} 
          onLogin={onLogin}
          onLogout={onLogout}
          darkMode={darkMode} 
          toggleTheme={toggleTheme} 
          minimal={true}
        />
      </header>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl opacity-30 animate-pulse duration-[4000ms]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl opacity-30 animate-pulse duration-[5000ms]"></div>
      </div>

      {/* Main Content Area - Centralizado verticalmente com min-height de calc(100vh - 56px) */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh_-_56px)] p-4 relative z-10 max-w-3xl mx-auto w-full text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out select-none">
        
        {/* Text and Separator Block */}
        <div className="flex flex-col items-center px-4">
          <h1 
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-slate-900 dark:text-white tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-backwards"
            style={{ letterSpacing: '-0.03em' }}
          >
            Planificador Escolar
          </h1>

          {/* 5. Linha horizontal decorativa fina (1px, cor #1e3a5f, largura 48px) centrada */}
          <div className="h-px bg-slate-300 dark:bg-[#1e3a5f] w-[48px] my-[24px] animate-in fade-in duration-700 delay-400" />

          {/* Subtítulo: sans-serif leve, cor adaptada, tamanho ligeiramente maior, centralizado, no máximo 2 linhas */}
          <p 
            className="font-sans font-light text-[15px] md:text-[16px] text-slate-600 dark:text-[#8aa4c8] leading-relaxed max-w-[440px] mx-auto text-center line-clamp-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-backwards"
          >
            A ferramenta inteligente para professores modernos.
          </p>
        </div>

        {/* Espaço de ~40px entre o subtítulo e os botões */}
        <div className="h-[40px] shrink-0" />

        {/* CTA Buttons - border-radius: 8px, largura máx: 280px */}
        <div 
          className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 fill-mode-backwards"
        >
          {/* Botão primário "Começar Agora": fundo sólido em azul, mesmo do "Gerar Plano", com ícone sparkle à esquerda e seta → à direita */}
          <button
            onClick={onStart}
            className="group relative flex items-center justify-between gap-3 px-6 py-4 text-base font-semibold text-white transition-all duration-300 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-[8px] active:scale-95 focus:outline-none w-full max-w-[280px] shadow-lg shadow-blue-900/10 dark:shadow-blue-900/20"
          >
            <Sparkles className="w-5 h-5 text-blue-200 group-hover:text-yellow-300 transition-colors shrink-0" />
            <span className="flex-1 text-center">Começar Agora</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 shrink-0" />
          </button>

          {/* Botão "Histórico": outlined com bordas refinadas e adaptadas para modo claro e escuro */}
          <button
            onClick={onHistory}
            className="group relative flex items-center justify-center gap-2.5 px-6 py-4 text-base font-semibold text-slate-700 dark:text-slate-200 transition-all duration-300 bg-white/50 dark:bg-transparent border border-slate-200 dark:border-[#2a3f5f] rounded-[8px] hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95 focus:outline-none w-full max-w-[280px]"
          >
            <Clock className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0" />
            <span>Histórico</span>
          </button>
        </div>
      </div>

      {/* Footer / Author (copyright numa única linha, fonte 11px, cor adaptada, centralizado) */}
      <footer 
        className="absolute bottom-[20px] left-0 w-full flex justify-center z-50 px-4 animate-in fade-in duration-1000 delay-1000"
      >
        <p className="text-[11px] text-slate-500 dark:text-[#3a5275] text-center font-medium">
          © <a href="https://saidehassan0506.web.app/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Saide Hassan</a> - Todos os direitos reservados - {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
