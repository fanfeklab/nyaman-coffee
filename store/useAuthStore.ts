import { create } from 'zustand';

export type UserRole = 'SUPER_ADMIN' | 'MANAGER' | 'CASHIER';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, pin: string) => boolean; // Mock login
  logout: () => void;
  updateProfile: (fullName: string, newPin?: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null, 
  isAuthenticated: false,
  
  // MOCK LOGIN LOGIC
  login: (username: string, pin: string) => {
    // Hardcoded mock credentials
    if (username === 'admin' && pin === '1235') {
       const user: User = {
         id: '1',
         username: 'admin',
         fullName: 'Ahmad Suparjo',
         role: 'SUPER_ADMIN'
       };
       set({ user, isAuthenticated: true });
       return true;
    }
    return false;
  },
  
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: (fullName: string, newPin?: string) => {
    set((state) => {
       if (!state.user) return state;
       return {
         ...state,
         user: {
           ...state.user,
           fullName
         }
       };
    });
    if (newPin) {
       console.log('Mock: Pin changed to', newPin);
       // in real app update backend
    }
  }
}));
