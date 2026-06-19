import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  timestamp: Date;
}

interface AuditState {
  logs: AuditLog[];
  addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      logs: [],
      addLog: (log) => set((state) => ({
        logs: [{ ...log, id: 'log_' + Date.now().toString(36), timestamp: new Date() }, ...state.logs]
      })),
      clearLogs: () => set({ logs: [] })
    }),
    {
      name: 'pos-audit-storage',
    }
  )
);
