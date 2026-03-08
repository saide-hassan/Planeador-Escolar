import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, logout, isFirebaseInitialized } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isOffline: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseInitialized || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    if (!isFirebaseInitialized) {
      alert("O login não está disponível no momento (configuração do Firebase ausente).");
      return;
    }
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Login failed", error);
      if (error.code === 'auth/unauthorized-domain') {
        alert(
          "Erro: Domínio não autorizado no Firebase.\n\n" +
          "Por favor, adicione este domínio (" + window.location.hostname + ") no Console do Firebase > Authentication > Configurações > Domínios autorizados."
        );
      } else if (error.code === 'auth/popup-closed-by-user') {
        // User closed popup, ignore
      } else {
        alert("Falha no login: " + (error.message || "Erro desconhecido"));
      }
    }
  };

  const signOut = async () => {
    if (!isFirebaseInitialized) return;
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, isOffline: !isFirebaseInitialized }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
