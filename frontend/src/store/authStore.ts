import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'participant' | 'admin';
}

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      initialize: async () => {
        try {
          // Vérifier si Supabase est configuré
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
            console.warn('Supabase non configuré - Mode démo');
            set({ isLoading: false, isAuthenticated: false });
            return;
          }

          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            const response = await api.get('/auth/me', {
              headers: { Authorization: `Bearer ${session.access_token}` }
            });
            
            set({
              user: response.data.data.user,
              session,
              isAuthenticated: true,
              isLoading: false,
            });
            
            localStorage.setItem('access_token', session.access_token);
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Initialize error:', error);
          set({ isLoading: false });
        }
      },

      login: async (email: string, password: string) => {
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, session } = response.data.data;

          set({
            user,
            session,
            isAuthenticated: true,
          });

          localStorage.setItem('access_token', session.access_token);
          localStorage.setItem('user', JSON.stringify(user));

          toast.success('Connexion réussie !');
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Erreur de connexion');
          throw error;
        }
      },

      register: async (email: string, password: string, full_name: string) => {
        try {
          const response = await api.post('/auth/register', {
            email,
            password,
            full_name,
          });

          const { user, session } = response.data.data;

          set({
            user,
            session,
            isAuthenticated: true,
          });

          localStorage.setItem('access_token', session.access_token);
          localStorage.setItem('user', JSON.stringify(user));

          toast.success('Inscription réussie !');
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Erreur d\'inscription');
          throw error;
        }
      },

      logout: async () => {
        try {
          // Appeler le backend pour confirmer la déconnexion
          await api.post('/auth/logout').catch(() => {
            // Ignorer les erreurs du backend - on déconnecte quand même
            console.log('Backend logout failed, continuing with local logout');
          });
          
          // Déconnecter de Supabase Auth
          await supabase.auth.signOut();
          
          // Réinitialiser le state
          set({
            user: null,
            session: null,
            isAuthenticated: false,
          });

          // Nettoyer TOUT le localStorage
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          localStorage.removeItem('auth-storage'); // ⚠️ CRITICAL: Nettoyer le storage Zustand
          
          // Recharger la page pour réinitialiser complètement l'app
          window.location.href = '/';
          
          toast.success('Déconnexion réussie');
        } catch (error) {
          console.error('Logout error:', error);
          
          // Forcer la déconnexion même en cas d'erreur
          set({
            user: null,
            session: null,
            isAuthenticated: false,
          });
          
          localStorage.clear(); // Nettoyer tout le localStorage
          window.location.href = '/';
          
          toast.error('Erreur lors de la déconnexion');
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
