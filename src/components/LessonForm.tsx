import React, { useState, useEffect, useRef } from 'react';
import { Loader2, FileText, Download, Sparkles, Sun, Moon, Paperclip, X, File as FileIcon, ChevronDown, Check } from 'lucide-react';
import { LessonPlanInput, LessonPlan } from '../types';
import { generateLessonPlan } from '../services/ai';
import { downloadDocx } from '../services/docxGenerator';
import { processFile, ProcessedFile } from '../utils/fileProcessor';



export default function LessonForm() {
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<ProcessedFile[]>([]);
  const [processingFile, setProcessingFile] = useState(false);

  // Toggle dark mode class on html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
  });

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
      setGeneratedPlan(plan);
    } catch (err: any) {
      const errorMessage = err?.message || 'Ocorreu um erro desconhecido.';
      setError(`Erro: ${errorMessage}`);
      console.error("Detalhes do erro:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div 
        className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-900/5 dark:shadow-black/50 overflow-hidden border border-white/50 dark:border-slate-800 transition-colors duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        {/* Minimal Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-xl">
              <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Novo Plano</h2>
            </div>
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-slate-700"
            aria-label="Alternar tema"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section: Informações Básicas */}
            <div className="space-y-6">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Informações da Escola
              </h3>
              
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
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Detalhes da Aula
              </h3>

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
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Personalização
              </h3>

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
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={processingFile}
                        className="group flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-all border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md"
                      >
                        {processingFile ? <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> : <Paperclip className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />}
                        Anexar Referência
                      </button>
                      <span className="text-xs text-slate-400">PDF, DOCX, Imagem (Máx: 4MB)</span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.jpg,.jpeg,.png,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {/* Attachments List */}
                    {attachments.length > 0 && (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 group hover:border-blue-200 dark:hover:border-blue-900/30 transition-colors">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                <FileIcon className="w-4 h-4 text-blue-500" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{file.name}</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                                  {file.isText ? 'Texto Extraído' : 'Arquivo Binário'}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
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
            <div className="flex flex-col md:flex-row items-center md:justify-end pt-6 gap-4 border-t border-slate-100 dark:border-slate-800 mt-8">
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

              {generatedPlan && (
                <button
                  type="button"
                  onClick={() => downloadDocx(generatedPlan)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-xl shadow-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:scale-95 animate-in fade-in slide-in-from-bottom-4 duration-300"
                >
                  <Download className="w-5 h-5" />
                  <span>Baixar Word</span>
                </button>
              )}
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
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div 
                className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 flex items-start gap-4"
              >
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                  <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 text-lg">Sucesso!</h4>
                  <p className="text-emerald-700 dark:text-emerald-300 mt-1">
                    O plano de aula foi gerado com sucesso. Clique em "Baixar Word" para salvar o arquivo.
                  </p>
                </div>
              </div>


            </div>
          )}
        </div>
      </div>
    </div>
  );
}
