import React, { useState, useRef, useEffect } from 'react';
import { Settings, User, Moon, Sun, LogIn, LogOut } from 'lucide-react';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface SettingsMenuProps {
  onProfile: () => void;
  onLogin: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

export default function SettingsMenu({ onProfile, onLogin, darkMode, toggleTheme }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    if (isFirebaseConfigured()) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-slate-700 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
        aria-label="Definições"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                toggleTheme();
              }}
              className="w-full px-4 py-3 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>Modo {darkMode ? 'Claro' : 'Escuro'}</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                if (user) {
                  onProfile();
                } else {
                  onLogin();
                }
              }}
              className="w-full px-4 py-3 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
            >
              <User className="w-4 h-4" />
              <span>Perfil do Professor</span>
            </button>

            <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>

            {user ? (
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 flex items-center gap-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogin();
                }}
                className="w-full px-4 py-3 flex items-center gap-3 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left font-medium"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sessão</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
