import React, { createContext, useContext, useState } from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';

interface DownloadContextType {
  startDownload: (downloadFn: () => void) => void;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export function DownloadProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const startDownload = (downloadFn: () => void) => {
    setIsOpen(true);
    setProgress(0);
    setIsSuccess(false);
    
    // Animate progress smoothly
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15 + 10;
      if (currentProgress >= 99) {
        currentProgress = 99;
      }
      setProgress(currentProgress);
    }, 200);
    
    // Finish after ~1.5s
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setIsSuccess(true);
      
      try {
        downloadFn();
      } catch (e) {
        console.error("Error downloading", e);
      }
      
      // Close automatically
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
      
    }, 1500);
  };
  
  return (
    <DownloadContext.Provider value={{ startDownload }}>
      {children}
      
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 flex flex-col items-center animate-in zoom-in-95 duration-200">
             <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 relative border border-blue-100 dark:border-slate-700">
               {isSuccess ? (
                 <CheckCircle2 className="w-8 h-8 text-green-500 animate-in zoom-in" />
               ) : (
                 <FileText className="w-8 h-8 text-blue-500 animate-pulse" />
               )}
             </div>
             
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">
               {isSuccess ? 'Sucesso!' : 'A Baixar Documento...'}
             </h3>
             
             <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
               {isSuccess ? 'O seu download foi concluído com sucesso.' : 'Aguarde um momento enquanto preparamos o seu ficheiro.'}
             </p>
             
             <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mb-2 overflow-hidden border border-slate-200 dark:border-slate-700">
               <div 
                 className={`h-full rounded-full transition-all duration-300 ease-out ${isSuccess ? 'bg-green-500' : 'bg-blue-500'}`}
                 style={{ width: `${progress}%` }}
               />
             </div>
             
             <div className="w-full flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
               <span>Downloading...</span>
               <span>{Math.round(progress)}%</span>
             </div>
          </div>
        </div>
      )}
    </DownloadContext.Provider>
  );
}

export const useDownload = () => {
  const context = useContext(DownloadContext);
  if (!context) throw new Error('useDownload must be used within DownloadProvider');
  return context;
};
