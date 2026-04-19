import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, FileText, Download, Sparkles, Paperclip, X, File as FileIcon, Check,
  Building2, ClipboardList, BookOpen, UploadCloud, ChevronDown
} from 'lucide-react';
import { EvaluationInput, Evaluation } from '../types';
import { generateEvaluation } from '../services/ai';
import { downloadEvaluationDocx, downloadEvaluationGridDocx } from '../services/evaluationDocxGenerator';
import { processFile, ProcessedFile } from '../utils/fileProcessor';
import { saveItem } from '../services/historyService';
import { getProfile, getProfileSync } from '../services/profileService';

interface EvaluationFormProps {
  onBack?: () => void;
  initialData?: Evaluation | null;
  darkMode?: boolean;
}

export default function EvaluationForm({ onBack, initialData, darkMode }: EvaluationFormProps) {
  const [loading, setLoading] = useState(false);
  const [generatedEval, setGeneratedEval] = useState<Evaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<ProcessedFile[]>([]);
  const [processingFile, setProcessingFile] = useState(false);

  const profile = getProfileSync();

  const [formData, setFormData] = useState<EvaluationInput>({
    evaluationType: 'ACS 1',
    questionType: 'Ambos',
    numQuestions: 5,
    schoolType: profile?.schoolType || 'Escola',
    schoolName: profile?.schoolName || '',
    topics: '',
    grade: profile?.grades || '',
    term: '',
    subject: profile?.subjects || '',
    duration: '90',
    date: new Date().toISOString().split('T')[0],
    classes: '',
    teacher: profile?.teacherName || '',
    otherDetails: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        evaluationType: initialData.evaluationType || 'ACS 1',
        questionType: initialData.questionType || 'Ambos',
        numQuestions: initialData.numQuestions || 5,
        schoolType: initialData.schoolType || 'Escola',
        schoolName: initialData.schoolName || '',
        topics: initialData.topics || '',
        grade: initialData.grade || '',
        term: initialData.term || '',
        subject: initialData.subject || '',
        duration: initialData.duration || '90',
        date: initialData.date ? (initialData.date.includes('T') ? initialData.date.split('T')[0] : initialData.date) : new Date().toISOString().split('T')[0],
        classes: initialData.classes || '',
        teacher: initialData.teacher || '',
        otherDetails: initialData.otherDetails || ''
      });
      
      if (initialData.attachments) {
        setAttachments(initialData.attachments);
      }
      
      setGeneratedEval(initialData);
    } else {
      getProfile().then(p => {
        if (p) {
          setFormData(prev => ({
            ...prev,
            schoolType: p.schoolType || prev.schoolType,
            schoolName: p.schoolName || prev.schoolName,
            subject: p.subjects || prev.subject,
            grade: p.grades || prev.grade,
            teacher: p.teacherName || prev.teacher
          }));
        }
      });
    }
  }, [initialData]);

  useEffect(() => {
    const handleProfileUpdate = async () => {
      if (!initialData) {
        const p = await getProfile();
        if (p) {
          setFormData(prev => ({
            ...prev,
            schoolType: p.schoolType || prev.schoolType,
            schoolName: p.schoolName || prev.schoolName,
            subject: p.subjects || prev.subject,
            grade: p.grades || prev.grade,
            teacher: p.teacherName || prev.teacher
          }));
        }
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setProcessingFile(true);
    setError(null);

    try {
      const newAttachments: ProcessedFile[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const processed = await processFile(file);
          newAttachments.push(processed);
        } catch (err: any) {
          setError(`Erro ao processar ${file.name}: ${err.message}`);
        }
      }

      setAttachments(prev => [...prev, ...newAttachments]);
    } catch (err: any) {
      setError(`Erro geral ao processar arquivos: ${err.message}`);
    } finally {
      setProcessingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedEval(null);

    try {
      const inputWithAttachments = {
        ...formData,
        attachments: attachments.length > 0 ? attachments : undefined
      };

      const result = await generateEvaluation(inputWithAttachments);
      
      // If editing, preserve ID and createdAt
      if (initialData?.id) {
        result.id = initialData.id;
        result.createdAt = initialData.createdAt;
      }

      setGeneratedEval(result);
      await saveItem(result);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao gerar a avaliação. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadEval = () => {
    if (generatedEval) {
      downloadEvaluationDocx(generatedEval);
    }
  };

  const handleDownloadGrid = () => {
    if (generatedEval) {
      downloadEvaluationGridDocx(generatedEval);
    }
  };

  const inputClassName = "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800";
  const labelClassName = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" />
            {initialData ? 'Editar Avaliação' : 'Nova Avaliação'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {initialData 
              ? 'Atualize as informações abaixo para regenerar a avaliação.' 
              : 'Preencha os dados abaixo para criar uma avaliação personalizada e sua respectiva grelha de correcção.'}
          </p>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section: Informações Básicas */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Informações da Escola
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClassName}>Instituição</label>
                <div className="flex gap-2">
                  <div className="relative w-1/3">
                    <select
                      name="schoolType"
                      value={formData.schoolType}
                      onChange={handleChange}
                      className={`${inputClassName} appearance-none`}
                    >
                      <option value="Escola">Escola</option>
                      <option value="Colégio">Colégio</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <input
                    required
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    className={`${inputClassName} w-2/3`}
                    placeholder={formData.schoolType === 'Escola' ? "Ex: Secundária da Polana" : "Ex: Bingo"}
                  />
                </div>
              </div>

              <div>
                <label className={labelClassName}>Professor(a)</label>
                <input
                  required
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="Nome completo"
                />
              </div>
            </div>
          </div>

          {/* Section: Detalhes da Avaliação */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Detalhes da Avaliação
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className={labelClassName}>Tipo de Avaliação</label>
                <input
                  required
                  name="evaluationType"
                  value={formData.evaluationType}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="Ex: ACS 1, AP"
                />
              </div>

              <div>
                <label className={labelClassName}>Tipo de Questões</label>
                <div className="relative">
                  <select
                    name="questionType"
                    value={formData.questionType}
                    onChange={handleChange}
                    className={`${inputClassName} appearance-none`}
                  >
                    <option value="Escolha Múltipla">Escolha Múltipla</option>
                    <option value="Perguntas Abertas">Perguntas Abertas</option>
                    <option value="Preenchimento de Lacunas">Preenchimento de Lacunas</option>
                    <option value="Ambos">Ambos</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelClassName}>Número de Questões</label>
                <input
                  required
                  type="number"
                  name="numQuestions"
                  value={formData.numQuestions}
                  onChange={handleChange}
                  min="1"
                  max="20"
                  className={inputClassName}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className={labelClassName}>Classe</label>
                <input
                  required
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="Ex: 10ª Classe"
                />
              </div>

              <div>
                <label className={labelClassName}>Trimestre</label>
                <input
                  required
                  name="term"
                  value={formData.term}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="Ex: 1º Trimestre"
                />
              </div>

              <div>
                <label className={labelClassName}>Disciplina</label>
                <input
                  required
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="Ex: Matemática"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClassName}>Duração (min)</label>
                <input
                  required
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>Data</label>
                <input
                  required
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>Turmas</label>
                <input
                  required
                  name="classes"
                  value={formData.classes}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="Ex: A, B, C"
                />
              </div>
            </div>
          </div>

          {/* Section: Conteúdo e Anexos */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Conteúdo e Anexos
              </h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className={labelClassName}>Tópicos a Cobrir</label>
                <textarea
                  required
                  name="topics"
                  value={formData.topics}
                  onChange={handleChange}
                  rows={3}
                  className={`${inputClassName} resize-y`}
                  placeholder="Liste os tópicos que devem ser avaliados..."
                />
              </div>

              <div>
                <label className={labelClassName}>Instruções Específicas (Opcional)</label>
                <textarea
                  name="otherDetails"
                  value={formData.otherDetails}
                  onChange={handleChange}
                  rows={2}
                  className={`${inputClassName} resize-y`}
                  placeholder="Ex: Incluir uma pergunta de bónus, focar mais na prática..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Material de Referência (Opcional)
                  </label>
                </div>
                
                <div 
                  onClick={() => !processingFile && !loading && fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    processingFile || loading 
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 cursor-not-allowed opacity-70' 
                      : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 cursor-pointer group'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform ${
                    processingFile || loading ? 'bg-slate-100 dark:bg-slate-800' : 'bg-indigo-100 dark:bg-indigo-900/50 group-hover:scale-110'
                  }`}>
                    {processingFile ? (
                      <Loader2 className="w-6 h-6 animate-spin text-slate-500 dark:text-slate-400" />
                    ) : (
                      <UploadCloud className={`w-6 h-6 ${processingFile || loading ? 'text-slate-500 dark:text-slate-400' : 'text-indigo-600 dark:text-indigo-400'}`} />
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {processingFile ? 'Processando arquivo...' : 'Clique para anexar arquivos'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    .docx, .doc, .pdf (Máx 5MB)
                  </p>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".docx,.doc,.pdf"
                  multiple
                  className="hidden"
                />

                {attachments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                            <FileIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                            {file.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAttachment(index);
                          }}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start md:justify-end pt-6 gap-4 border-t border-slate-100 dark:border-slate-800 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-0.5 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Gerando Avaliação...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Gerar Avaliação</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 flex items-start gap-3">
            <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {generatedEval && (
          <div className="mt-10 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-green-200 dark:border-green-900/50 shadow-lg shadow-green-500/5">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Avaliação Gerada com Sucesso!
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">
                A avaliação e respectiva grelha de correcção foram guardadas no histórico e estão prontas para download.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleDownloadEval}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30"
              >
                <Download className="w-4 h-4" />
                Baixar Avaliação
              </button>
              <button
                onClick={handleDownloadGrid}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30"
              >
                <Download className="w-4 h-4" />
                Baixar Grelha
              </button>
            </div>
            
            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl text-yellow-800 dark:text-yellow-500 text-sm text-center">
              A IA pode cometer erros. Considere verificar as informações geradas antes de imprimir.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
