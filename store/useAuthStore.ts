import { create } from 'zustand';
import { useAuditStore } from './useAuditStore';

export type UserRole = 'SUPER_ADMIN' | 'MANAGER' | 'CASHIER';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  pin: string;
}

interface AuthState {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (username: string, pin: string) => boolean;
  logout: () => void;
  updateProfile: (fullName: string, newPin?: string) => void;
  addUser: (userData: Omit<User, 'id'>) => void;
  updateUser: (id: string, userData: Partial<Omit<User, 'id'>>) => void;
  deleteUser: (id: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null, 
  isAuthenticated: false,
  users: [
    {
      id: '1',
      username: 'admin',
      fullName: 'Ahmad Suparjo',
      role: 'SUPER_ADMIN',
      pin: '1235'
    },
    {
      id: '2',
      username: 'kasir1',
      fullName: 'Siti Rahma',
      role: 'CASHIER',
      pin: '1111'
    }
  ],
  
  login: (username: string, pin: string) => {
    const { users } = get();
    const foundUser = users.find(u => u.username === username && u.pin === pin);
    
    if (foundUser) {
       set({ user: foundUser, isAuthenticated: true });
       useAuditStore.getState().addLog({
         userId: foundUser.id,
         userName: foundUser.fullName,
         userRole: foundUser.role,
         action: 'LOGIN',
         details: `Pengguna ${foundUser.fullName} melakukan login.`
       });
       return true;
    }
    return false;
  },
  
  logout: () => {
    const { user } = get();
    if (user) {
       useAuditStore.getState().addLog({
         userId: user.id,
         userName: user.fullName,
         userRole: user.role,
         action: 'LOGOUT',
         details: `Pengguna ${user.fullName} keluar dari sistem.`
       });
    }
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: (fullName: string, newPin?: string) => {
    set((state) => {
       if (!state.user) return state;
       
       const updatedUser = {
         ...state.user,
         fullName,
         ...(newPin ? { pin: newPin } : {})
       };
       
       const updatedUsers = state.users.map(u => 
         u.id === state.user!.id ? updatedUser : u
       );

       useAuditStore.getState().addLog({
         userId: updatedUser.id,
         userName: updatedUser.fullName,
         userRole: updatedUser.role,
         action: 'UPDATE_PROFILE',
         details: `Pengguna memperbarui profilnya sendiri.`
       });

       return {
         ...state,
         user: updatedUser,
         users: updatedUsers
       };
    });
  },

  addUser: (userData) => {
    const currentUser = get().user;
    set((state) => {
      const newUser = { ...userData, id: 'usr_' + Date.now().toString(36) };
      if (currentUser) {
         useAuditStore.getState().addLog({
           userId: currentUser.id,
           userName: currentUser.fullName,
           userRole: currentUser.role,
           action: 'TAMBAH_KARYAWAN',
           details: `Menambahkan karyawan baru: ${userData.fullName} (${userData.role})`
         });
      }
      return { users: [...state.users, newUser] };
    });
  },

  updateUser: (id, userData) => {
    const currentUser = get().user;
    set((state) => {
      if (currentUser) {
         const target = state.users.find(u => u.id === id);
         useAuditStore.getState().addLog({
           userId: currentUser.id,
           userName: currentUser.fullName,
           userRole: currentUser.role,
           action: 'UBAH_KARYAWAN',
           details: `Mengubah data karyawan: ${target?.fullName}`
         });
      }
      return {
        users: state.users.map((u) => (u.id === id ? { ...u, ...userData } : u))
      };
    });
  },

  deleteUser: (id) => {
    const currentUser = get().user;
    set((state) => {
      if (currentUser) {
         const target = state.users.find(u => u.id === id);
         useAuditStore.getState().addLog({
           userId: currentUser.id,
           userName: currentUser.fullName,
           userRole: currentUser.role,
           action: 'HAPUS_KARYAWAN',
           details: `Menghapus karyawan: ${target?.fullName}`
         });
      }
      return {
        users: state.users.filter((u) => u.id !== id)
      };
    });
  }
}));
