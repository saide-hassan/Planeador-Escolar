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
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-50/95 dark:bg-[#0d1b2a]/95 backdrop-blur-md shadow-sm">
        {/* Row 1: 48px height, back left and logo close together, settings right */}
        <div className="h-[48px] flex items-center justify-between px-[20px] max-w-4xl mx-auto w-full">
          {/* Left side group: back button + logo side-by-side */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-[#8aa4c8] transition-colors"
              title="Voltar"
            >
              <ChevronDown className="w-5 h-5 rotate-90" />
            </button>
            <img src="/logo.svg" alt="Logo" className="w-[28px] h-[28px]" />
          </div>

          {/* Right settings action */}
          <div>
            <SettingsMenu 
              onProfile={onProfile} 
              onLogin={onLogin}
              onLogout={onLogout}
              darkMode={darkMode} 
              toggleTheme={toggleTheme} 
              minimal={true}
            />
          </div>
        </div>

        {/* 6. Linha divisória fina entre o header superior e o container das abas */}
        <div className="h-px bg-slate-200 dark:bg-[#1a3050] w-full" />

        {/* Row 2: Tabs Container (Height-optimized, no overflow/scroll, flex-1 equal cols, mx-3) */}
        <div className="py-3 flex justify-center max-w-4xl mx-auto w-full">
          <div className="mx-3 w-[calc(100%_-_24px)] md:max-w-md bg-slate-200/60 dark:bg-[#112033] p-[4px] rounded-[12px] flex">
            {/* 1st Tab: Plano */}
            <button
              onClick={() => setActiveTab('lesson')}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-[8px] font-semibold transition-all duration-300 ${
                activeTab === 'lesson'
                  ? 'bg-[#1e3a5f] text-white shadow-sm'
                  : 'bg-transparent text-slate-500 dark:text-[#6b8cad] hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className={`w-[16px] h-[16px] shrink-0 transition-transform ${activeTab === 'lesson' ? 'text-white' : 'text-slate-400 dark:text-[#6b8cad]'}`} />
              <span className="text-[11px]">Plano</span>
            </button>
            
            {/* 2nd Tab: Avaliação */}
            <button
              onClick={() => setActiveTab('evaluation')}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-[8px] font-semibold transition-all duration-300 ${
                activeTab === 'evaluation'
                  ? 'bg-[#1e3a5f] text-white shadow-sm'
                  : 'bg-transparent text-slate-500 dark:text-[#6b8cad] hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileCheck className={`w-[16px] h-[16px] shrink-0 transition-transform ${activeTab === 'evaluation' ? 'text-white' : 'text-slate-400 dark:text-[#6b8cad]'}`} />
              <span className="text-[11px]">Avaliação</span>
            </button>

            {/* 3rd Tab: Dosificação */}
            <button
              onClick={() => setActiveTab('dosification')}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-[8px] font-semibold transition-all duration-300 ${
                activeTab === 'dosification'
                  ? 'bg-[#1e3a5f] text-white shadow-sm'
                  : 'bg-transparent text-slate-500 dark:text-[#6b8cad] hover:text-slate-800 dark:hover:text-[#8aa4c8]'
              }`}
            >
              <Calendar className={`w-[16px] h-[16px] shrink-0 transition-transform ${activeTab === 'dosification' ? 'text-white' : 'text-slate-400 dark:text-[#6b8cad]'}`} />
              <span className="text-[11px]">Dosificação</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-[132px] sm:pt-[140px] pb-12">
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
