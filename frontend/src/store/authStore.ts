import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  rememberMe: boolean;
  lastActivity: number;
  
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string, refreshToken?: string, rememberMe?: boolean) => void;
  logout: () => void;
  initialize: () => void;
  updateActivity: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  rememberMe: false,
  lastActivity: Date.now(),

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setToken: (token) => set({ token }),
  
  login: (user, token, refreshToken, rememberMe = false) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('rememberMe', String(rememberMe));
    localStorage.setItem('lastActivity', String(Date.now()));
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    set({ user, token, refreshToken, isAuthenticated: true, rememberMe, lastActivity: Date.now() });
  },
  
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('lastActivity');
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false, rememberMe: false });
  },
  
  initialize: () => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    const savedRefreshToken = localStorage.getItem('refreshToken');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    const savedLastActivity = Number(localStorage.getItem('lastActivity') || Date.now());
    
    if (savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser);
        
        // Check if session has expired (30 minutes for non-remember-me)
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        
        const sessionExpired = savedRememberMe 
          ? (now - savedLastActivity > sevenDays)
          : (now - savedLastActivity > thirtyMinutes);
        
        if (sessionExpired) {
          // Session expired, clear everything
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('lastActivity');
          set({ isLoading: false });
        } else {
          set({ 
            user, 
            token: savedToken, 
            refreshToken: savedRefreshToken,
            isAuthenticated: true, 
            isLoading: false,
            rememberMe: savedRememberMe,
            lastActivity: savedLastActivity
          });
        }
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('lastActivity');
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
  
  updateActivity: () => {
    const now = Date.now();
    localStorage.setItem('lastActivity', String(now));
    set({ lastActivity: now });
  },
}));
