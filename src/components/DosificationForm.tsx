import React, { useState, useEffect, useRef } from 'react';
import { Loader2, FileText, Download, Sparkles, ChevronDown, Check, UploadCloud, Building2, BookOpen, Sliders, Calendar, X, File as FileIcon } from 'lucide-react';
import { DosificationInput, Dosification, BiWeeklyPlan } from '../types';
import { generateDosification, generateBiWeeklyPlan } from '../services/ai';
import { downloadDosificationDocx, downloadBiWeeklyPlanDocx } from '../services/docxGenerator';
import { processFile, ProcessedFile } from '../utils/fileProcessor';
import { saveItem } from '../services/historyService';
import { getProfile, getProfileSync } from '../services/profileService';
import { useDownload } from '../contexts/DownloadContext';

interface DosificationFormProps {
  onBack?: () => void;
  initialData?: Dosification | null;
  darkMode?: boolean;
  toggleTheme?: () => void;
}

export default function DosificationForm({ onBack, initialData, darkMode, toggleTheme }: DosificationFormProps) {
  const [loading, setLoading] = useState(false);
  const { startDownload } = useDownload();
  const [generatedDosification, setGeneratedDosification] = useState<Dosification | null>(null);
  const [generatedBiWeeklyPlan, setGeneratedBiWeeklyPlan] = useState<BiWeeklyPlan | null>(null);
  const [loadingBiWeekly, setLoadingBiWeekly] = useState(false);
  const [selectedStartWeek, setSelectedStartWeek] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<ProcessedFile[]>([]);
  const [processingFile, setProcessingFile] = useState(false);

  const profile = getProfileSync();

  const [schoolType, setSchoolType] = useState(profile?.schoolType || 'Escola');
  const [schoolName, setSchoolName] = useState(profile?.schoolName || '');
  
  const [formData, setFormData] = useState<DosificationInput>({
    school: '',
    subject: profile?.subjects || '',
    grade: profile?.grades || '',
    term: '1º Trimestre',
    year: new Date().getFullYear().toString(),
    startDate: '',
    endDate: '',
    program: '',
    teacher: profile?.teacherName || '',
    attachments: []
  });

  useEffect(() => {
    if (initialData) {
      const schoolStr = initialData.school || '';
      const schoolParts = schoolStr.split(' ');
      const type = schoolParts[0] === 'Colégio' ? 'Colégio' : 'Escola';
      const name = schoolStr.replace(/^(Colégio|Escola)\s*/, "");
      
      setSchoolType(type);
      setSchoolName(name);

      setFormData({
        school: initialData.school,
        subject: initialData.subject,
        grade: initialData.grade,
        term: initialData.term as any,
        year: initialData.year,
        startDate: initialData.startDate,
        endDate: initialData.endDate,
        program: initialData.program,
        teacher: initialData.teacher,
        attachments: initialData.attachments || []
      });

      if (initialData.attachments) {
        setAttachments(initialData.attachments);
      }
      
      setGeneratedDosification(initialData);
    } else {
      getProfile().then(p => {
        if (p) {
          setSchoolType(p.schoolType);
          setSchoolName(p.schoolName);
          setFormData(prev => ({
            ...prev,
            subject: p.subjects || prev.subject,
            grade: p.grades || prev.grade,
            teacher: p.teacherName || prev.teacher
          }));
        }
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProcessingFile(true);
      setError(null);
      try {
        const file = e.target.files[0];
        if (file.size > 4 * 1024 * 1024) {
          throw new Error("O arquivo é muito grande. O tamanho máximo é 4MB.");
        }
        
        const processed = await processFile(file);
        setAttachments(prev => [...prev, processed]);
      } catch (err: any) {
        setError(`Erro ao processar arquivo: ${err.message}`);
      } finally {
        setProcessingFile(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
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
    setGeneratedDosification(null);

    try {
      const dosification = await generateDosification({
        ...formData,
        school: `${schoolType} ${schoolName}`.trim(),
        attachments: attachments
      });

      if (initialData?.id) {
        dosification.id = initialData.id;
        dosification.createdAt = initialData.createdAt;
      }

      setGeneratedDosification(dosification);
      setLoading(false);
      saveItem(dosification);
    } catch (err: any) {
      setError(err?.message || 'Ocorreu um erro ao gerar a dosificação.');
      setLoading(false);
    }
  };

  const handleGenerateBiWeekly = async () => {
    if (!generatedDosification) return;
    setLoadingBiWeekly(true);
    setError(null);
    setGeneratedBiWeeklyPlan(null);

    try {
      // Get the current week and the next one
      const selectedIndices = [selectedStartWeek, selectedStartWeek + 1].filter(idx => idx < generatedDosification.weeks.length);
      
      const plan = await generateBiWeeklyPlan({
        dosification: generatedDosification,
        selectedWeeks: selectedIndices
      });

      setGeneratedBiWeeklyPlan(plan);
      setLoadingBiWeekly(false);
      saveItem(plan);
    } catch (err: any) {
      setError(err?.message || 'Ocorreu um erro ao gerar o plano quinzenal.');
      setLoadingBiWeekly(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-orange-500" />
            {initialData ? 'Editar Dosificação' : 'Nova Dosificação'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Planeje o seu trimestre organizando os conteúdos por semanas.
          </p>
        </div>
      </div>

      <div className="p-8 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section: Informações Básicas */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-orange-50 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Dados da Instituição e Professor
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Instituição</label>
                  <div className="flex gap-2">
                    <div className="relative w-1/3">
                      <select
                        value={schoolType}
                        onChange={(e) => setSchoolType(e.target.value as 'Escola' | 'Colégio')}
                        className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                      >
                        <option value="Escola">Escola</option>
                        <option value="Colégio">Colégio</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    <input
                      required
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-2/3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                      placeholder="Nome da Escola"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Professor(a)</label>
                  <input
                    required
                    name="teacher"
                    value={formData.teacher}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                    placeholder="Nome completo"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>

            {/* Section: Planeamento */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Planeamento do Trimestre
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Disciplina</label>
                  <input
                    required
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="Ex: Geografia"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Classe</label>
                  <div className="relative">
                    <select
                      required
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    >
                      <option value="">Selecione</option>
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={`${i + 1}ª`}>{i + 1}ª Classe</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Trimestre</label>
                  <div className="relative">
                    <select
                      required
                      name="term"
                      value={formData.term}
                      onChange={handleChange}
                      className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    >
                      <option value="1º Trimestre">1º Trimestre</option>
                      <option value="2º Trimestre">2º Trimestre</option>
                      <option value="3º Trimestre">3º Trimestre</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Início do Trimestre</label>
                  <input
                    required
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fim do Trimestre</label>
                  <input
                    required
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>

            {/* Section: Programa da Disciplina */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Programa da Disciplina
                  </h3>
                </div>

                <div 
                  onClick={() => !processingFile && !loading && fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    processingFile || loading 
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 cursor-not-allowed opacity-70' 
                      : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 cursor-pointer group'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform ${
                    processingFile || loading ? 'bg-white dark:bg-slate-800' : 'bg-emerald-100 dark:bg-emerald-900/50 group-hover:scale-110'
                  }`}>
                    {processingFile ? (
                      <Loader2 className="w-6 h-6 animate-spin text-slate-500 dark:text-slate-400" />
                    ) : (
                      <UploadCloud className={`w-6 h-6 ${processingFile || loading ? 'text-slate-500 dark:text-slate-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {processingFile ? 'Processando...' : 'Anexe o Programa da Disciplina (PDF, Imagem, etc.)'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Isso permite que a IA distribua os conteúdos corretamente pelas semanas.
                  </p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.jpg,.jpeg,.png,.txt"
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                />
                
                {attachments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                            <FileIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
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
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row items-center md:items-start md:justify-end pt-6 gap-4 border-t border-slate-100 dark:border-slate-800 mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:shadow-blue-900/20 active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Gerando Dosificação...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Gerar Dosificação</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-3">
              <X className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {generatedDosification && (
            <div className="mt-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-green-200 dark:border-green-900/50 p-8 shadow-lg">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Dosificação Pronta!
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md">
                    Sua dosificação trimestral foi gerada com sucesso e está pronta para baixar.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    type="button"
                    onClick={() => startDownload(() => downloadDosificationDocx(generatedDosification!))}
                    className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-md"
                  >
                    <Download className="w-5 h-5" />
                    Baixar Dosificação (.docx)
                  </button>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Gerar Plano Quinzenal</h4>
                  </div>
                  
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                    Agora que sua dosificação está pronta, você pode gerar o plano quinzenal (para duas semanas) baseado nela.
                  </p>

                  <div className="flex flex-col md:flex-row items-end gap-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex-1 space-y-2 w-full">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Escolha a semana de início (15 dias)</label>
                      <div className="relative">
                        <select
                          value={selectedStartWeek}
                          onChange={(e) => setSelectedStartWeek(parseInt(e.target.value))}
                          className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                        >
                          {generatedDosification.weeks.map((week, idx) => (
                            <option key={idx} value={idx}>
                              {week.weekNumber} ({week.dates})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={loadingBiWeekly}
                      onClick={handleGenerateBiWeekly}
                      className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/10"
                    >
                      {loadingBiWeekly ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Gerando...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>Gerar Plano Quinzenal</span>
                        </>
                      )}
                    </button>
                  </div>

                  {generatedBiWeeklyPlan && (
                    <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 animate-in fade-in zoom-in duration-300">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">Plano Quinzenal Gerado!</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Pronto para ser baixado no modelo oficial.</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => startDownload(() => downloadBiWeeklyPlanDocx(generatedBiWeeklyPlan!))}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
                        >
                          <Download className="w-5 h-5" />
                          Baixar Plano (.docx)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
