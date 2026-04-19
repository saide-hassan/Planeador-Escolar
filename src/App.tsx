/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import GeneratorTabs from './components/GeneratorTabs';
import WelcomeScreen from './components/WelcomeScreen';
import HistoryScreen from './components/HistoryScreen';
import ProfileModal from './components/ProfileModal';
import AuthModal from './components/AuthModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HistoryItem } from './types';
import { LogOut } from 'lucide-react';
import { auth } from './lib/firebase';

declare global {
  interface Window {
    applyTheme: (mode: 'light' | 'dark', isManual?: boolean) => void;
  }
}

export default function App() {
  const [view, setView] = useState<'welcome' | 'form' | 'history'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'form' || hash === 'history') return hash;
    }
    return 'welcome';
  });
  const [editingItem, setEditingItem] = useState<HistoryItem | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Check local storage or system preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'form') {
        setView('form');
      } else if (hash === 'history') {
        setView('history');
      } else {
        setView('welcome');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleBack = () => {
    if (view === 'form') {
      if (editingItem) {
        navigateTo('history', true);
      } else {
        navigateTo('welcome', true);
      }
    } else if (view === 'history') {
      navigateTo('welcome', true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') {
        const target = e.target as HTMLElement;
        const isInput = 
          target.tagName === 'INPUT' || 
          target.tagName === 'TEXTAREA' || 
          target.tagName === 'SELECT' ||
          target.isContentEditable;
          
        if (!isInput) {
          e.preventDefault();
          handleBack();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, editingItem]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.applyTheme) {
      // Check se é manual via estado local que foi alterado
      const isManual = localStorage.getItem('theme-manual') === 'true';
      window.applyTheme(darkMode ? 'dark' : 'light', isManual);
    }
  }, [darkMode]);

  useEffect(() => {
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const isManual = localStorage.getItem('theme-manual') === 'true';
      if (!isManual) {
        setDarkMode(e.matches);
      }
    };
    
    // Para atualizar o react state a partir de eventos, ex: entre janelas ou da media query
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  const navigateTo = (newView: 'welcome' | 'form' | 'history', replace = false) => {
    const newHash = newView === 'welcome' ? '' : newView;
    if (replace) {
      window.location.replace(`#${newHash}`);
    } else {
      window.location.hash = newHash;
    }
  };

  const handleEdit = (item: HistoryItem) => {
    setEditingItem(item);
    navigateTo('form');
  };

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (typeof window !== 'undefined' && window.applyTheme) {
      window.applyTheme(newDarkMode ? 'dark' : 'light', true);
    }
  };

  const executeLogout = async () => {
    await auth.signOut();
    setIsLogoutConfirmOpen(false);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 dark:bg-black py-8 transition-colors duration-500">
        {view === 'welcome' && (
          <WelcomeScreen 
            onStart={() => {
              setEditingItem(null);
              navigateTo('form');
            }} 
            onHistory={() => navigateTo('history')}
            onProfile={() => setIsProfileOpen(true)}
            onLogin={() => setIsAuthOpen(true)}
            onLogout={() => setIsLogoutConfirmOpen(true)}
            darkMode={darkMode}
            toggleTheme={toggleTheme}
          />
        )}
        {view === 'form' && (
          <div key="main-content">
            <GeneratorTabs 
              onBack={handleBack} 
              onProfile={() => setIsProfileOpen(true)}
              onLogin={() => setIsAuthOpen(true)}
              onLogout={() => setIsLogoutConfirmOpen(true)}
              initialData={editingItem}
              darkMode={darkMode}
              toggleTheme={toggleTheme}
            />
          </div>
        )}
        {view === 'history' && (
          <HistoryScreen 
            onBack={handleBack} 
            onEdit={handleEdit}
            onProfile={() => setIsProfileOpen(true)}
            onLogin={() => setIsAuthOpen(true)}
            onLogout={() => setIsLogoutConfirmOpen(true)}
            darkMode={darkMode}
            toggleTheme={toggleTheme}
          />
        )}
      </div>
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={() => setIsAuthOpen(false)} />

      {/* Global Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-50 dark:border-red-800/50">
              <LogOut className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Terminar Sessão</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
              Tem a certeza de que deseja sair? Terá de iniciar sessão novamente para sincronizar os seus dados.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 px-4 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-sm"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={executeLogout}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors shadow-sm text-sm"
              >
                Sim, Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}
