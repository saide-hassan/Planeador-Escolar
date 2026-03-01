import React from 'react';
import { ArrowRight, Linkedin } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-300">
      <div
        className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        <div className="flex justify-center mb-8">
           <div className="relative">
             <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full scale-150"></div>
             <img 
               src="/logo.svg" 
               alt="Logo" 
               className="h-40 w-auto relative z-10 drop-shadow-2xl animate-in zoom-in-50 duration-700 delay-150" 
             />
           </div>
        </div>

        <div className="space-y-4">
          <h1 
            className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300 fill-mode-backwards"
          >
            Planificador Escolar
          </h1>
          <p 
            className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700 delay-500 fill-mode-backwards"
          >
            A ferramenta inteligente para professores. Crie planos de aula completos, apontamentos e exercícios em segundos.
          </p>
        </div>

        <div 
          className="pt-6 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-700 fill-mode-backwards"
        >
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-white transition-all duration-200 bg-blue-600 rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            Começar Agora
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div 
          className="pt-16 flex flex-col items-center gap-3 animate-in fade-in duration-1000 delay-1000 fill-mode-backwards"
        >
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Autoria</p>
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 px-5 py-2.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-800">
            <span className="font-semibold">Saide Assane</span>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-700"></div>
            <a
              href="https://www.linkedin.com/in/saidehassan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Linkedin className="w-4 h-4" />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
