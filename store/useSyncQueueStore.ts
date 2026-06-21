import { create } from 'zustand';

export type SyncOperation = {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
};

type SyncHandler = (operations: SyncOperation[]) => Promise<void>;

interface SyncQueueState {
  isOnline: boolean;
  queue: SyncOperation[];
  syncHandler: SyncHandler | null;
  setSyncHandler: (handler: SyncHandler) => void;
  setOnlineStatus: (status: boolean) => Promise<void>;
  enqueueMutation: (type: string, payload: any) => Promise<void>;
  flushQueue: () => Promise<void>;
  clearQueue: () => void;
}

export const useSyncQueueStore = create<SyncQueueState>((set, get) => ({
  isOnline: true, // Default to online
  queue: [],
  syncHandler: null,
  
  setSyncHandler: (handler) => set({ syncHandler: handler }),
  
  setOnlineStatus: async (status) => {
    set({ isOnline: status });
    if (status) {
      await get().flushQueue();
    }
  },

  enqueueMutation: async (type, payload) => {
    const { isOnline, syncHandler } = get();
    const operation: SyncOperation = {
      // Use crypto.randomUUID if available, else fallback
      id: typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2, 9),
      type,
      payload,
      timestamp: Date.now(),
    };

    if (isOnline && syncHandler) {
      // Try to sync immediately
      try {
        await syncHandler([operation]);
      } catch (e) {
        // Fallback to queue if it fails despite being "online"
        set((state) => ({ queue: [...state.queue, operation] }));
      }
    } else {
      // Offline, queue it
      set((state) => ({ queue: [...state.queue, operation] }));
    }
  },

  flushQueue: async () => {
    const { queue, syncHandler, isOnline } = get();
    
    if (!isOnline || queue.length === 0 || !syncHandler) return;

    // We process the current queue and optimistic clear it, or we clear only on success.
    try {
      await syncHandler(queue);
      set({ queue: [] });
    } catch (error) {
      console.error('Failed to flush queue', error);
      // In case of error, queue remains intact
    }
  },

  clearQueue: () => set({ queue: [] }),
}));
