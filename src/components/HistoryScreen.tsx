import { useState, useEffect } from 'react';
import { HistoryItem, LessonPlan, Evaluation } from '../types';
import { getHistory, deleteItem, clearHistory } from '../services/historyService';
import { downloadDocx } from '../services/docxGenerator';
import { downloadEvaluationDocx, downloadEvaluationGridDocx } from '../services/evaluationDocxGenerator';
import { ArrowLeft, Download, Trash2, Calendar, BookOpen, Clock, FileText, AlertTriangle, X, Edit, FileCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import SettingsMenu from './SettingsMenu';

interface HistoryScreenProps {
  onBack: () => void;
  onEdit: (item: HistoryItem) => void;
  onProfile: () => void;
  onLogin: () => void;
  onLogout?: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

export default function HistoryScreen({ onBack, onEdit, onProfile, onLogin, onLogout, darkMode, toggleTheme }: HistoryScreenProps) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'clear', id?: string } | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const data = await getHistory();
      setItems(data);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const handleDeleteClick = (id: string) => {
    setConfirmAction({ type: 'delete', id });
  };

  const handleClearClick = () => {
    setConfirmAction({ type: 'clear' });
  };

  const confirmActionHandler = async () => {
    if (confirmAction?.type === 'delete' && confirmAction.id) {
      await deleteItem(confirmAction.id);
      const data = await getHistory();
      setItems(data);
    } else if (confirmAction?.type === 'clear') {
      await clearHistory();
      setItems([]);
    }
    setConfirmAction(null);
  };

  return (
    <>
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-50/90 dark:bg-black/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Voltar</span>
            </button>
            
            {/* Mobile Actions */}
            <div className="flex items-center gap-2 sm:hidden">
              <SettingsMenu 
                onProfile={onProfile} 
                onLogin={onLogin}
                onLogout={onLogout}
                darkMode={darkMode} 
                toggleTheme={toggleTheme} 
              />
              {items.length > 0 && (
                <button
                  onClick={handleClearClick}
                  className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate text-center sm:text-left flex-1">
            Histórico
          </h1>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <SettingsMenu 
              onProfile={onProfile} 
              onLogin={onLogin}
              onLogout={onLogout}
              darkMode={darkMode} 
              toggleTheme={toggleTheme} 
            />
            {items.length > 0 && (
              <button
                onClick={handleClearClick}
                className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Limpar Tudo
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="min-h-screen p-4 sm:p-6 md:p-8 pt-36 sm:pt-36 lg:pt-32 max-w-7xl mx-auto relative">
        {loading ? (
          <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">A carregar histórico...</h3>
          </div>
        ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-slate-100 dark:bg-slate-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Nenhum item salvo</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Seus planos de aula e avaliações gerados aparecerão aqui automaticamente para consulta futura.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards"
            >
              <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${item.type === 'evaluation' ? 'bg-slate-500/30 group-hover:bg-slate-600' : 'bg-blue-500/20 group-hover:bg-blue-500'}`} />
              
              <div className="mb-4 flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${item.type === 'evaluation' ? 'bg-slate-200 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'}`}>
                    {item.type === 'evaluation' ? 'Avaliação' : 'Plano de Aula'}
                  </span>
                </div>
                <h3 className={`text-base font-semibold text-slate-900 dark:text-white line-clamp-2 mb-2 transition-colors ${item.type === 'evaluation' ? 'group-hover:text-slate-600 dark:group-hover:text-slate-400' : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
                  {item.type === 'evaluation' ? (item as Evaluation).topics : (item as LessonPlan).topic}
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${item.type === 'evaluation' ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800'}`}>
                    {item.type === 'evaluation' ? <FileCheck className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                    {item.subject}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {item.grade}
                  </span>
                  {item.type === 'evaluation' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {(item as Evaluation).evaluationType}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{item.type === 'evaluation' ? 'Data' : 'Aula'}: {format(new Date(item.date), "dd 'de' MMM, yyyy", { locale: ptBR })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Gerado: {item.createdAt ? format(new Date(item.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }) : 'N/A'}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-auto">
                {item.type === 'evaluation' ? (
                  <>
                    <button
                      onClick={() => downloadEvaluationDocx(item as Evaluation)}
                      className="flex-1 px-3 flex items-center justify-center gap-1 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 font-medium text-xs"
                    >
                      <Download className="w-3 h-3" />
                      Avaliação
                    </button>
                    <button
                      onClick={() => downloadEvaluationGridDocx(item as Evaluation)}
                      className="flex-1 px-3 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 font-medium text-xs"
                    >
                      <Download className="w-3 h-3" />
                      Grelha
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => downloadDocx(item as LessonPlan)}
                    className="flex-grow-0 px-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 font-medium text-sm w-auto"
                  >
                    <Download className="w-4 h-4" />
                    Baixar
                  </button>
                )}
                
                <button
                  onClick={() => onEdit(item)}
                  className="flex-grow-0 px-4 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 py-2 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 font-medium text-sm w-auto"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                
                <button
                  onClick={() => handleDeleteClick(item.id!)}
                  className="p-2 ml-auto text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {confirmAction.type === 'delete' ? 'Excluir Item' : 'Limpar Histórico'}
              </h3>
            </div>
            
            <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              {confirmAction.type === 'delete' 
                ? 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.'
                : 'Tem certeza que deseja apagar TODOS os itens salvos? Esta ação é irreversível.'}
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmActionHandler}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-red-900/20"
              >
                {confirmAction.type === 'delete' ? 'Sim, Excluir' : 'Sim, Limpar Tudo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
