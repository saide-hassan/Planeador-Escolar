import React, { useState, useEffect, useRef } from 'react';
import { Loader2, FileText, Download, Sparkles, Sun, Moon, Paperclip, X, File as FileIcon, ChevronDown, Check, UploadCloud, Building2, BookOpen, Sliders } from 'lucide-react';
import { LessonPlanInput, LessonPlan } from '../types';
import { generateLessonPlan } from '../services/ai';
import { downloadDocx } from '../services/docxGenerator';
import { processFile, ProcessedFile } from '../utils/fileProcessor';
import { savePlan } from '../services/historyService';

interface LessonFormProps {
  onBack?: () => void;
  initialData?: LessonPlan | null;
  darkMode?: boolean;
  toggleTheme?: () => void;
}

export default function LessonForm({ onBack, initialData, darkMode, toggleTheme }: LessonFormProps) {
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Remove local darkMode state, use prop or default false if not provided (though App provides it)
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<ProcessedFile[]>([]);
  const [processingFile, setProcessingFile] = useState(false);

  const [schoolType, setSchoolType] = useState('Escola');
  const [schoolName, setSchoolName] = useState('');
  
  const [unitNumber, setUnitNumber] = useState('I');
  const [unitName, setUnitName] = useState('');

  const romanNumerals = [
    "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
    "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"
  ];

  const [formData, setFormData] = useState<LessonPlanInput>({
    school: '',
    subject: '',
    date: new Date().toISOString().split('T')[0],
    unit: '',
    grade: '',
    topic: '',
    duration: '45',
    teacher: '',
    materials: '',
    includeExercises: false,
    includeHomework: false,
    otherDetails: ''
  });

  // Populate form when initialData changes
  useEffect(() => {
    if (initialData) {
      // Parse school
      const schoolStr = initialData.school || '';
      const schoolParts = schoolStr.split(' ');
      const type = schoolParts[0] === 'Colégio' ? 'Colégio' : 'Escola';
      const name = schoolStr.replace(/^(Colégio|Escola)\s*/, "");
      
      setSchoolType(type);
      setSchoolName(name);

      // Parse unit
      const unitStr = initialData.unit || '';
      const unitParts = unitStr.split(':');
      let uNum = 'I';
      let uName = unitStr;
      if (unitParts.length > 1) {
        uNum = unitParts[0].trim();
        uName = unitParts.slice(1).join(':').trim();
      }
      setUnitNumber(uNum);
      setUnitName(uName);

      setFormData({
        school: initialData.school,
        subject: initialData.subject,
        date: initialData.date ? (initialData.date.includes('T') ? initialData.date.split('T')[0] : initialData.date) : new Date().toISOString().split('T')[0],
        unit: initialData.unit,
        grade: initialData.grade,
        topic: initialData.topic,
        duration: initialData.duration,
        teacher: initialData.teacher,
        materials: initialData.materials,
        includeExercises: initialData.includeExercises,
        includeHomework: initialData.includeHomework,
        otherDetails: initialData.otherDetails || ''
      });

      // Attachments are not easily restorable unless we store the base64 in history (we do!)
      if (initialData.attachments) {
        setAttachments(initialData.attachments);
      }
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
        // Validate size (max 4MB to be safe with API limits)
        if (file.size > 4 * 1024 * 1024) {
          throw new Error("O arquivo é muito grande. O tamanho máximo é 4MB.");
        }
        
        const processed = await processFile(file);
        setAttachments(prev => [...prev, processed]);
      } catch (err: any) {
        setError(`Erro ao processar arquivo: ${err.message}`);
      } finally {
        setProcessingFile(false);
        // Reset input
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
    setGeneratedPlan(null);

    try {
      const plan = await generateLessonPlan({
        ...formData,
        school: `${schoolType} ${schoolName}`.trim(),
        unit: `${unitNumber}: ${unitName}`,
        attachments: attachments
      });

      // If editing, preserve ID and createdAt
      if (initialData?.id) {
        plan.id = initialData.id;
        plan.createdAt = initialData.createdAt;
      }

      setGeneratedPlan(plan);
      savePlan(plan);
    } catch (err: any) {
      let errorMessage = err?.message || 'Ocorreu um erro desconhecido.';
      
      // Check for common API errors and provide friendly messages
      if (errorMessage.includes('"code":503') || errorMessage.includes('503') || errorMessage.includes('overloaded')) {
         errorMessage = "O serviço de IA está com alta demanda no momento. Por favor, aguarde alguns instantes e tente novamente.";
      } else if (errorMessage.includes('"code":429') || errorMessage.includes('429')) {
         errorMessage = "Muitas solicitações recentes. Por favor, aguarde um momento antes de tentar novamente.";
      } else if (errorMessage.includes('SAFETY')) {
         errorMessage = "O conteúdo gerado foi bloqueado pelos filtros de segurança. Tente reformular o tema.";
      }

      setError(errorMessage);
      console.error("Detalhes do erro:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-500" />
            {initialData ? 'Editar Plano' : 'Novo Plano'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {initialData 
              ? 'Atualize as informações abaixo para regenerar o plano.' 
              : 'Preencha os dados abaixo para gerar um novo plano de aula.'}
          </p>
        </div>
      </div>

      <div className="p-8 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section: Informações Básicas */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Informações da Escola
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Instituição</label>
                  <div className="flex gap-2">
                    <div className="relative w-1/3">
                      <select
                        value={schoolType}
                        onChange={(e) => setSchoolType(e.target.value)}
                        className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
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
                      className="w-2/3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      placeholder={schoolType === 'Escola' ? "Ex: Secundária da Polana" : "Ex: Bingo"}
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    placeholder="Nome completo"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>

            {/* Section: Detalhes da Aula */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Detalhes da Aula
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Disciplina</label>
                  <input
                    required
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none placeholder:text-slate-400"
                    placeholder="Ex: Matemática"
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
                      className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data</label>
                  <input
                    required
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Unidade Temática</label>
                  <div className="flex gap-2">
                    <div className="relative w-1/4">
                      <select
                        value={unitNumber}
                        onChange={(e) => setUnitNumber(e.target.value)}
                        className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-serif text-center"
                      >
                        {romanNumerals.map((num) => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                    <input
                      required
                      value={unitName}
                      onChange={(e) => setUnitName(e.target.value)}
                      className="w-3/4 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none placeholder:text-slate-400"
                      placeholder="Nome da Unidade"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Duração</label>
                  <div className="relative">
                    <select
                      required
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    >
                      <option value="45">45 Minutos (1 Tempo)</option>
                      <option value="90">90 Minutos (2 Tempos)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tema da Aula</label>
                <textarea
                  required
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none placeholder:text-slate-400 resize-none"
                  placeholder="Ex: Equações Quadráticas"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Materiais Didácticos</label>
                <input
                  required
                  name="materials"
                  value={formData.materials}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none placeholder:text-slate-400"
                  placeholder="Ex: Quadro, giz, apagador, livro do aluno..."
                />
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>

            {/* Section: Personalização */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Personalização
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Outros Detalhes</label>
                  <textarea
                    name="otherDetails"
                    value={formData.otherDetails || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none placeholder:text-slate-400 resize-none"
                    placeholder="Instruções específicas para a IA..."
                  />
                  
                  {/* Modern File Upload */}
                  <div className="mt-4">
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
                          : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 cursor-pointer group'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform ${
                        processingFile || loading ? 'bg-slate-100 dark:bg-slate-800' : 'bg-emerald-100 dark:bg-emerald-900/50 group-hover:scale-110'
                      }`}>
                        {processingFile ? (
                          <Loader2 className="w-6 h-6 animate-spin text-slate-500 dark:text-slate-400" />
                        ) : (
                          <UploadCloud className={`w-6 h-6 ${processingFile || loading ? 'text-slate-500 dark:text-slate-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
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
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.jpg,.jpeg,.png,.txt"
                      onChange={handleFileChange}
                      multiple
                      className="hidden"
                    />
                    
                    {/* Attachments List */}
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
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input
                        type="checkbox"
                        name="includeExercises"
                        checked={formData.includeExercises}
                        onChange={(e) => setFormData({ ...formData, includeExercises: e.target.checked })}
                        className="peer appearance-none w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 checked:border-blue-500 checked:bg-blue-500 transition-all cursor-pointer"
                      />
                      <Check className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={3} />
                    </div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      Incluir Exercícios
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input
                        type="checkbox"
                        name="includeHomework"
                        checked={formData.includeHomework}
                        onChange={(e) => setFormData({ ...formData, includeHomework: e.target.checked })}
                        className="peer appearance-none w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 checked:border-blue-500 checked:bg-blue-500 transition-all cursor-pointer"
                      />
                      <Check className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={3} />
                    </div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      Incluir TPC
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row items-center md:items-start md:justify-end pt-6 gap-4 border-t border-slate-100 dark:border-slate-800 mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-0.5 active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Gerando Plano...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Gerar Plano</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div 
              className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-center gap-3"
            >
              <X className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {generatedPlan && (
            <div className="mt-10 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-green-200 dark:border-green-900/50 shadow-lg shadow-green-500/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Plano Gerado com Sucesso!
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">
                  Seu plano de aula está pronto para download.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => downloadDocx(generatedPlan)}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30"
                >
                  <Download className="w-4 h-4" />
                  Baixar Plano de Aula
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
