import React from 'react';
import { ArrowRight, Linkedin, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100 dark:from-slate-950 dark:to-blue-950 p-4 transition-colors duration-500 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50 animate-pulse duration-[4000ms]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-50 animate-pulse duration-[5000ms]"></div>
      </div>

      <div className="relative z-10 max-w-3xl w-full text-center flex flex-col items-center justify-center h-full max-h-[900px] gap-6 md:gap-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
        
        {/* Logo Section */}
        <div className="flex justify-center">
           <div className="relative group">
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-indigo-400 blur-2xl opacity-20 rounded-full scale-110 group-hover:scale-125 transition-transform duration-700"></div>
             <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl shadow-xl border border-white/50 dark:border-slate-700 ring-1 ring-slate-900/5 dark:ring-white/10">
               <img 
                 src="/logo.svg" 
                 alt="Logo" 
                 className="h-16 w-16 md:h-24 md:w-24 drop-shadow-sm animate-in zoom-in-90 duration-700 delay-150" 
               />
             </div>
           </div>
        </div>

        {/* Text Content */}
        <div className="space-y-5 md:space-y-8 px-4">
          <h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-backwards"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-blue-800 to-slate-800 dark:from-blue-100 dark:via-white dark:to-blue-100">
              Planificador Escolar
            </span>
          </h1>
          <p 
            className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-light animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-backwards"
          >
            A ferramenta inteligente para professores modernos. Crie planos de aula, apontamentos e exercícios com o poder da IA.
          </p>
        </div>

        {/* CTA Button */}
        <div 
          className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 fill-mode-backwards"
        >
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 md:px-10 md:py-5 text-lg md:text-xl font-medium text-white transition-all duration-300 bg-blue-700 dark:bg-blue-600 rounded-full hover:bg-blue-800 dark:hover:bg-blue-500 hover:shadow-2xl hover:shadow-blue-900/20 dark:hover:shadow-blue-900/40 hover:-translate-y-1 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
          >
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-blue-200 dark:text-blue-100 group-hover:text-yellow-300 transition-colors" />
            <span>Começar Agora</span>
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:translate-x-1 opacity-70 group-hover:opacity-100" />
          </button>
        </div>

        {/* Footer / Author */}
        <div 
          className="mt-auto md:mt-12 flex flex-col items-center gap-4 animate-in fade-in duration-1000 delay-1000 fill-mode-backwards opacity-60 hover:opacity-100 transition-opacity"
        >
          <div className="flex items-center gap-3 text-sm md:text-base text-slate-500 dark:text-slate-400 px-5 py-2.5 rounded-full border border-transparent hover:border-blue-200 dark:hover:border-slate-700 hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-all">
            <span className="font-medium">Desenvolvido por Saide Assane</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <a
              href="https://www.linkedin.com/in/saidehassan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              <Linkedin className="w-4 h-4 md:w-5 md:h-5" />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
