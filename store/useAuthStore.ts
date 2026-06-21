import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useAuditStore } from './useAuditStore';
import { supabase } from '@/lib/supabase/client';

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
  login: (username: string, pin: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (fullName: string, newPin?: string) => Promise<void>;
  addUser: (userData: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, userData: Partial<Omit<User, 'id'>>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  fetchUsers: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null, 
      isAuthenticated: false,
      users: [],
      
      fetchUsers: async () => {
        const { data, error } = await supabase.from('users').select('*');
        if (!error && data) {
          const mappedUsers = data.map((u: any) => ({
            id: u.id,
            username: u.username,
            fullName: u.full_name,
            role: u.role as UserRole,
            pin: u.pin,
          }));
          set({ users: mappedUsers });
        }
      },

      login: async (username: string, pin: string) => {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .eq('pin', pin)
          .single();
        
        if (data && !error) {
           const foundUser: User = {
             id: data.id,
             username: data.username,
             fullName: data.full_name,
             role: data.role as UserRole,
             pin: data.pin
           };
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

      updateProfile: async (fullName: string, newPin?: string) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        const updates: any = { full_name: fullName };
        if (newPin) updates.pin = newPin;

        const { error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', currentUser.id);

        if (!error) {
          set((state) => {
            const updatedUser = {
              ...state.user!,
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
        }
      },

      addUser: async (userData) => {
        const id = 'usr_' + Date.now().toString(36);
        const { error } = await supabase.from('users').insert({
          id,
          username: userData.username,
          full_name: userData.fullName,
          role: userData.role,
          pin: userData.pin
        });

        if (!error) {
          const currentUser = get().user;
          const newUser = { ...userData, id };
          set((state) => {
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
        }
      },

      updateUser: async (id, userData) => {
        const updates: any = {};
        if (userData.username) updates.username = userData.username;
        if (userData.fullName) updates.full_name = userData.fullName;
        if (userData.role) updates.role = userData.role;
        if (userData.pin) updates.pin = userData.pin;

        const { error } = await supabase.from('users').update(updates).eq('id', id);

        if (!error) {
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
        }
      },

      deleteUser: async (id) => {
        const { error } = await supabase.from('users').delete().eq('id', id);
        
        if (!error) {
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
      }
    }),
    {
      name: 'pos-auth-storage',
      // We still persist the user session for local state
    }
  )
);
