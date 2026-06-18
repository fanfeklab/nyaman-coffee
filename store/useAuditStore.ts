import { create } from 'zustand';

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
}

export const useAuditStore = create<AuditState>((set) => ({
  logs: [],
  addLog: (log) => set((state) => ({
    logs: [{ ...log, id: 'log_' + Date.now().toString(36), timestamp: new Date() }, ...state.logs]
  }))
}));
