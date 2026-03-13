import React, { useState, useEffect } from 'react';
import LessonForm from './LessonForm';
import EvaluationForm from './EvaluationForm';
import { HistoryItem, LessonPlan, Evaluation } from '../types';
import { BookOpen, FileCheck, ChevronDown, Sun, Moon } from 'lucide-react';

interface GeneratorTabsProps {
  onBack: () => void;
  initialData?: HistoryItem | null;
  darkMode?: boolean;
  toggleTheme?: () => void;
}

export default function GeneratorTabs({ onBack, initialData, darkMode, toggleTheme }: GeneratorTabsProps) {
  const [activeTab, setActiveTab] = useState<'lesson' | 'evaluation'>('lesson');

  useEffect(() => {
    if (initialData) {
      if (initialData.type === 'evaluation') {
        setActiveTab('evaluation');
      } else {
        setActiveTab('lesson');
      }
    }
  }, [initialData]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300">
        
        {/* Header */}
        <div className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 p-6 md:p-8 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Voltar"
              >
                <ChevronDown className="w-5 h-5 rotate-90 text-slate-500" />
              </button>
              <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-xl">
                <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
              </div>
            </div>
            
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-slate-700"
                aria-label="Alternar tema"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}
          </div>

          <div className="flex justify-center">
            <div className="bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 inline-flex">
              <button
                onClick={() => setActiveTab('lesson')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'lesson'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                Gerar Plano
              </button>
              <button
                onClick={() => setActiveTab('evaluation')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'evaluation'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <FileCheck className="w-5 h-5" />
                Gerar Avaliação
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'lesson' ? (
          <LessonForm 
            initialData={initialData?.type === 'lesson' ? (initialData as LessonPlan) : undefined} 
            darkMode={darkMode} 
          />
        ) : (
          <EvaluationForm 
            initialData={initialData?.type === 'evaluation' ? (initialData as Evaluation) : undefined}
            darkMode={darkMode} 
          />
        )}
      </div>
    </div>
  );
}
