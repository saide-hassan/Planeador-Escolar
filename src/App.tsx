/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import LessonForm from './components/LessonForm';
import WelcomeScreen from './components/WelcomeScreen';
import HistoryScreen from './components/HistoryScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LessonPlan } from './types';

export default function App() {
  const [view, setView] = useState<'welcome' | 'form' | 'history'>('welcome');
  const [editingPlan, setEditingPlan] = useState<LessonPlan | null>(null);
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

  const handleEdit = (plan: LessonPlan) => {
    setEditingPlan(plan);
    setView('form');
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 py-8 transition-colors duration-500">
        {view === 'welcome' && (
          <WelcomeScreen 
            onStart={() => {
              setEditingPlan(null);
              setView('form');
            }} 
            onHistory={() => setView('history')}
            darkMode={darkMode}
            toggleTheme={toggleTheme}
          />
        )}
        {view === 'form' && (
          <div key="main-content">
            <LessonForm 
              onBack={() => setView('welcome')} 
              initialData={editingPlan}
              darkMode={darkMode}
              toggleTheme={toggleTheme}
            />
          </div>
        )}
        {view === 'history' && (
          <HistoryScreen 
            onBack={() => setView('welcome')} 
            onEdit={handleEdit}
            darkMode={darkMode}
            toggleTheme={toggleTheme}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
