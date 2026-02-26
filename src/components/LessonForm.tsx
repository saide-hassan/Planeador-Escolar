import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2, FileText, Download, Sparkles, BookOpen, Sun, Moon } from 'lucide-react';
import { format } from 'date-fns';
import { LessonPlanInput, LessonPlan } from '../types';
import { generateLessonPlan } from '../services/ai';
import { downloadDocx } from '../services/docxGenerator';

export default function LessonForm() {
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedPlan(null);

    try {
      const plan = await generateLessonPlan({
        ...formData,
        school: `${schoolType} ${schoolName}`.trim(),
        unit: `${unitNumber}: ${unitName}`
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
    <div className="max-w-4xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-blue-50 dark:bg-slate-900 border-b border-blue-100 dark:border-slate-800 transition-colors duration-300">
          <div className="flex items-center">
            <img src="/logo.svg" alt="Logo" className="h-16 w-auto object-contain" />
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-slate-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm"
            aria-label="Alternar tema"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Escola ou Colégio</label>
                <div className="flex gap-2">
                  <select
                    value={schoolType}
                    onChange={(e) => setSchoolType(e.target.value)}
                    className="w-1/3 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  >
                    <option value="Escola">Escola</option>
                    <option value="Colégio">Colégio</option>
                  </select>
                  <input
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-2/3 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder={schoolType === 'Escola' ? "Ex: Secundária da Polana" : "Ex: Bingo"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Professor</label>
                <input
                  required
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="Nome do Professor"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Disciplina</label>
                <input
                  required
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="Ex: Matemática"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Classe</label>
                <select
                  required
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                >
                  <option value="">Selecione a Classe</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={`${i + 1}ª`}>{i + 1}ª Classe</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Unidade Temática</label>
                <div className="flex gap-2">
                  <select
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(e.target.value)}
                    className="w-1/4 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-serif"
                  >
                    {romanNumerals.map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                  <input
                    required
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    className="w-3/4 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="Ex: Álgebra"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tema da Aula</label>
                <textarea
                  required
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="Ex: Equações Quadráticas&#10;- Resolução de equações incompletas&#10;- Fórmula resolvente"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data</label>
                <input
                  required
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Duração / Tempo</label>
                <select
                  required
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                >
                  <option value="45">45 Minutos (1 Tempo)</option>
                  <option value="90">90 Minutos (2 Tempos)</option>
                </select>
              </div>

              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Materiais Didácticos</label>
                <textarea
                  required
                  name="materials"
                  value={formData.materials}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="Ex: Quadro, giz, apagador, livro do aluno..."
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row gap-6 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      name="includeExercises"
                      checked={formData.includeExercises}
                      onChange={(e) => setFormData({ ...formData, includeExercises: e.target.checked })}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 checked:border-blue-600 checked:bg-blue-600 transition-all"
                    />
                    <svg
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Incluir Exercícios de Aplicação
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      name="includeHomework"
                      checked={formData.includeHomework}
                      onChange={(e) => setFormData({ ...formData, includeHomework: e.target.checked })}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 checked:border-blue-600 checked:bg-blue-600 transition-all"
                    />
                    <svg
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Incluir TPC (Trabalho Para Casa)
                  </span>
                </label>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:justify-end pt-6 gap-4 border-t border-slate-100 dark:border-slate-800 mt-8">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gerando
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Gerar
                  </>
                )}
              </button>

              {generatedPlan && (
                <button
                  type="button"
                  onClick={() => downloadDocx(generatedPlan)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-4 duration-300"
                >
                  <Download className="w-5 h-5" />
                  Baixar
                </button>
              )}
            </div>
          </form>

          {error && (
            <div 
              className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              {error}
            </div>
          )}

          {generatedPlan && (
            <div 
              className="mt-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <FileText className="w-6 h-6" />
              <div>
                <p className="font-semibold">Plano de Aula gerado com sucesso!</p>
                <p className="text-sm opacity-90">Clique no botão "Baixar" acima para salvar o arquivo em Word (.docx).</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
