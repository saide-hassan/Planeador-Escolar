import React, { useState, useEffect } from 'react';
import LessonForm from './LessonForm';
import EvaluationForm from './EvaluationForm';
import DosificationForm from './DosificationForm';
import { HistoryItem, LessonPlan, Evaluation, Dosification } from '../types';
import { BookOpen, FileCheck, ChevronDown, Calendar } from 'lucide-react';
import SettingsMenu from './SettingsMenu';

interface GeneratorTabsProps {
  onBack: () => void;
  onProfile: () => void;
  onLogin: () => void;
  onLogout?: () => void;
  initialData?: HistoryItem | null;
  darkMode: boolean;
  toggleTheme: () => void;
}

export default function GeneratorTabs({ onBack, onProfile, onLogin, onLogout, initialData, darkMode, toggleTheme }: GeneratorTabsProps) {
  const [activeTab, setActiveTab] = useState<'lesson' | 'evaluation' | 'dosification'>('lesson');

  useEffect(() => {
    if (initialData) {
      if (initialData.type === 'evaluation') {
        setActiveTab('evaluation');
      } else if (initialData.type === 'dosification') {
        setActiveTab('dosification');
      } else {
        setActiveTab('lesson');
      }
    }
  }, [initialData]);

  return (
    <>
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 flex flex-col gap-4 md:gap-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
                title="Voltar"
              >
                <ChevronDown className="w-5 h-5 rotate-90 text-slate-500" />
              </button>
              <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-xl">
                <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
              </div>
            </div>
            
            <SettingsMenu 
              onProfile={onProfile} 
              onLogin={onLogin}
              onLogout={onLogout}
              darkMode={darkMode} 
              toggleTheme={toggleTheme} 
            />
          </div>

          <div className="flex justify-center w-full">
            <div className="flex w-full sm:w-auto overflow-x-auto no-scrollbar bg-slate-200/50 dark:bg-slate-900/50 p-1.5 rounded-2xl backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 shadow-inner">
              <button
                onClick={() => setActiveTab('lesson')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-4 sm:px-10 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'lesson'
                    ? 'text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-700 shadow-md shadow-blue-900/5 dark:shadow-black/20 border border-slate-200/50 dark:border-slate-600/50'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <BookOpen className={`w-5 h-5 transition-transform duration-300 ${activeTab === 'lesson' ? 'scale-110 text-blue-600 dark:text-blue-400' : 'scale-100'}`} />
                <span>Plano de Aula</span>
              </button>
              
              <button
                onClick={() => setActiveTab('evaluation')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-4 sm:px-10 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'evaluation'
                    ? 'text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-700 shadow-md shadow-indigo-900/5 dark:shadow-black/20 border border-slate-200/50 dark:border-slate-600/50'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <FileCheck className={`w-5 h-5 transition-transform duration-300 ${activeTab === 'evaluation' ? 'scale-110 text-indigo-600 dark:text-indigo-400' : 'scale-100'}`} />
                <span>Gerar Avaliação</span>
              </button>

              <button
                onClick={() => setActiveTab('dosification')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-4 sm:px-10 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'dosification'
                    ? 'text-orange-700 dark:text-orange-300 bg-white dark:bg-slate-700 shadow-md shadow-orange-900/5 dark:shadow-black/20 border border-slate-200/50 dark:border-slate-600/50'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Calendar className={`w-5 h-5 transition-transform duration-300 ${activeTab === 'dosification' ? 'scale-110 text-orange-600 dark:text-orange-400' : 'scale-100'}`} />
                <span>Dosificação</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-44 md:pt-48 pb-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-800 transition-all duration-300 relative overflow-hidden">
          {activeTab === 'lesson' ? (
            <LessonForm 
              initialData={initialData?.type === 'lesson' ? (initialData as LessonPlan) : undefined} 
              darkMode={darkMode} 
            />
          ) : activeTab === 'evaluation' ? (
            <EvaluationForm 
              initialData={initialData?.type === 'evaluation' ? (initialData as Evaluation) : undefined}
              darkMode={darkMode} 
            />
          ) : (
            <DosificationForm 
              initialData={initialData?.type === 'dosification' ? (initialData as Dosification) : undefined}
              darkMode={darkMode} 
            />
          )}
        </div>
      </div>
    </>
  );
}
