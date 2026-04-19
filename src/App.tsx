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
            darkMode={darkMode}
            toggleTheme={toggleTheme}
          />
        )}
      </div>
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={() => setIsAuthOpen(false)} />
    </ErrorBoundary>
  );
}
