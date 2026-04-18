import React, { useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { Loader2, X, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro ao iniciar sessão com o Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200/50 dark:border-slate-800/50">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-600/20 dark:to-indigo-600/20 pointer-events-none"></div>

        <div className="relative pt-12 pb-8 px-8 flex flex-col items-center text-center">
          
          <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-700">
            <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>

          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Bem-vindo de Volta
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 leading-relaxed px-4">
            Aceda ao seu histórico e sincronize os seus planos de aula e avaliações em qualquer dispositivo.
          </p>

          {error && (
            <div className="w-full p-4 mb-6 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl text-left border border-red-100 dark:border-red-800/50">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none group"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            ) : (
              <>
                <div className="bg-white p-1 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                </div>
                Entrar com o Google
              </>
            )}
          </button>
          
          <p className="mt-8 text-xs text-slate-400 dark:text-slate-500">
            Ao iniciar sessão, aceita guardar os seus dados de forma segura.
          </p>
        </div>
      </div>
    </div>
  );
}
