import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';

// Increment this version when you want to show the modal again
const CURRENT_VERSION = '1.2.0'; 

const UPDATES = [
  {
    title: 'Novidades da Atualização',
    features: [
      '🎨 Novo visual minimalista com suporte a Modo Escuro',
      '📄 Documentos Word agora em Times New Roman e texto justificado',
      '🏫 Seleção inteligente de Escola e Colégio',
      '🔢 Numeração Romana (I-XX) para Unidades Temáticas',
      '📝 Melhoria na formatação dos Objetivos no plano de aula'
    ]
  }
];

export default function UpdateModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const lastVersion = localStorage.getItem('pem_app_version');
    
    // Check if version changed or if it's the first visit
    if (lastVersion !== CURRENT_VERSION) {
      // Small delay to show after initial load
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('pem_app_version', CURRENT_VERSION);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 dark:border-slate-800 relative animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={120} />
          </div>
          <div className="relative z-10">
            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-1">O que há de novo?</h2>
            <p className="text-blue-100 text-sm">Confira as últimas melhorias do PEM</p>
          </div>
          
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {UPDATES[0].features.map((feature, idx) => (
            <div 
              key={idx}
              className="flex items-start gap-3 animate-in slide-in-from-left-4 fade-in duration-500"
              style={{ animationDelay: `${idx * 100 + 200}ms`, animationFillMode: 'backwards' }}
            >
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                {feature}
              </span>
            </div>
          ))}

          <button
            onClick={handleClose}
            className="w-full mt-6 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl transform active:scale-[0.98] animate-in fade-in slide-in-from-bottom-2 duration-500 delay-500 fill-mode-backwards"
          >
            Entendi, vamos começar!
          </button>
        </div>
      </div>
    </div>
  );
}
