import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Linkedin } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-md w-full text-center space-y-8"
      >
        <div className="flex justify-center mb-8">
           <div className="relative">
             <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full scale-150"></div>
             <motion.img 
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ delay: 0.2, duration: 0.5 }}
               src="/logo.svg" 
               alt="Logo" 
               className="h-40 w-auto relative z-10 drop-shadow-2xl" 
             />
           </div>
        </div>

        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            Planificador Escolar
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto"
          >
            A ferramenta inteligente para professores. Crie planos de aula completos, apontamentos e exercícios em segundos.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="pt-6"
        >
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-white transition-all duration-200 bg-blue-600 rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            Começar Agora
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="pt-16 flex flex-col items-center gap-3"
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
        </motion.div>
      </motion.div>
    </div>
  );
}
