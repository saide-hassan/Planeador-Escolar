import React, { useState, useEffect } from 'react';
import { X, Save, User } from 'lucide-react';
import { TeacherProfile, getProfile, saveProfile } from '../services/profileService';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [profile, setProfile] = useState<TeacherProfile>({
    schoolName: '',
    schoolType: 'Escola',
    teacherName: '',
    subjects: '',
    grades: '',
  });

  useEffect(() => {
    if (isOpen) {
      const saved = getProfile();
      if (saved) {
        setProfile(saved);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile(profile);
    onClose();
  };

  const inputClassName = "w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 dark:text-white";
  const labelClassName = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Perfil do Professor</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
            Preencha os seus dados para preenchimento automático nos formulários de Planos de Aula e Avaliações.
          </p>

          <form id="profile-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClassName}>Nome do Professor</label>
              <input
                type="text"
                name="teacherName"
                value={profile.teacherName}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Seu nome completo"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-1">
                <label className={labelClassName}>Tipo</label>
                <select
                  name="schoolType"
                  value={profile.schoolType}
                  onChange={handleChange}
                  className={inputClassName}
                >
                  <option value="Escola">Escola</option>
                  <option value="Colégio">Colégio</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClassName}>Nome da Instituição</label>
                <input
                  type="text"
                  name="schoolName"
                  value={profile.schoolName}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="Nome da escola/colégio"
                />
              </div>
            </div>

            <div>
              <label className={labelClassName}>Disciplinas que leciona</label>
              <input
                type="text"
                name="subjects"
                value={profile.subjects}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Ex: Matemática, Física"
              />
            </div>

            <div>
              <label className={labelClassName}>Classes</label>
              <input
                type="text"
                name="grades"
                value={profile.grades}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Ex: 8ª, 9ª e 10ª Classe"
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="profile-form"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-500/20"
          >
            <Save className="w-4 h-4" />
            Guardar Perfil
          </button>
        </div>
      </div>
    </div>
  );
}
