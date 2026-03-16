/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import GeneratorTabs from './components/GeneratorTabs';
import WelcomeScreen from './components/WelcomeScreen';
import HistoryScreen from './components/HistoryScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HistoryItem } from './types';

export default function App() {
  const [view, setView] = useState<'welcome' | 'form' | 'history'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'form' || hash === 'history') return hash;
    }
    return 'welcome';
  });
  const [editingItem, setEditingItem] = useState<HistoryItem | null>(null);
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
          if (window.history.length > 1) {
            window.history.back();
          } else {
            navigateTo('welcome');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    const updateThemeColor = () => {
      const isDark = document.documentElement.classList.contains('dark');
      const themeColor = isDark ? '#020617' : '#f8fafc';
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
    };

    updateThemeColor();
  }, [darkMode]);

  const navigateTo = (newView: 'welcome' | 'form' | 'history') => {
    window.location.hash = newView === 'welcome' ? '' : newView;
  };

  const handleEdit = (item: HistoryItem) => {
    setEditingItem(item);
    navigateTo('form');
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 py-8 transition-colors duration-500">
        {view === 'welcome' && (
          <WelcomeScreen 
            onStart={() => {
              setEditingItem(null);
              navigateTo('form');
            }} 
            onHistory={() => navigateTo('history')}
            darkMode={darkMode}
            toggleTheme={toggleTheme}
          />
        )}
        {view === 'form' && (
          <div key="main-content">
            <GeneratorTabs 
              onBack={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  navigateTo('welcome');
                }
              }} 
              initialData={editingItem}
              darkMode={darkMode}
              toggleTheme={toggleTheme}
            />
          </div>
        )}
        {view === 'history' && (
          <HistoryScreen 
            onBack={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                navigateTo('welcome');
              }
            }} 
            onEdit={handleEdit}
            darkMode={darkMode}
            toggleTheme={toggleTheme}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
