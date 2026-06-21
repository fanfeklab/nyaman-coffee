import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSyncQueueStore, SyncOperation } from '../useSyncQueueStore';

describe('Offline-First Queue Sync PoC', () => {
  beforeEach(() => {
    // Reset store state before each test
    useSyncQueueStore.setState({
      isOnline: true,
      queue: [],
      syncHandler: null,
    });
  });

  it('should process immediately when online', async () => {
    const mockDb: any[] = [];
    
    const mockHandler = vi.fn(async (ops: SyncOperation[]) => {
      ops.forEach(op => {
        if (op.type === 'ADD_ITEM') {
          mockDb.push(op.payload);
        }
      });
    });

    const store = useSyncQueueStore.getState();
    store.setSyncHandler(mockHandler);
    
    await store.enqueueMutation('ADD_ITEM', { name: 'Latte', price: 25000 });
    
    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockDb).toHaveLength(1);
    expect(mockDb[0].name).toBe('Latte');
    expect(useSyncQueueStore.getState().queue).toHaveLength(0);
  });

  it('should queue operations when offline', async () => {
    const mockDb: any[] = [];
    const mockHandler = vi.fn(async (ops: SyncOperation[]) => {
      ops.forEach(op => mockDb.push(op.payload));
    });

    const store = useSyncQueueStore.getState();
    store.setSyncHandler(mockHandler);
    
    // Go offline
    await store.setOnlineStatus(false);
    
    // Add items
    await store.enqueueMutation('ADD_ITEM', { name: 'Americano', price: 20000 });
    await store.enqueueMutation('ADD_ITEM', { name: 'Espresso', price: 15000 });
    
    // Should not have called handler
    expect(mockHandler).not.toHaveBeenCalled();
    expect(mockDb).toHaveLength(0);
    
    // Should be in queue
    expect(useSyncQueueStore.getState().queue).toHaveLength(2);
    expect(useSyncQueueStore.getState().queue[0].payload.name).toBe('Americano');
    expect(useSyncQueueStore.getState().queue[1].payload.name).toBe('Espresso');
  });

  it('should flush queue correctly when coming back online', async () => {
    const mockDb: any[] = [];
    const mockHandler = vi.fn(async (ops: SyncOperation[]) => {
      ops.forEach(op => mockDb.push(op.payload));
    });

    const store = useSyncQueueStore.getState();
    store.setSyncHandler(mockHandler);
    
    // Offline mode
    await store.setOnlineStatus(false);
    await store.enqueueMutation('ADD_ITEM', { name: 'Cappuccino', price: 25000 });
    await store.enqueueMutation('ADD_ITEM', { name: 'Mocha', price: 30000 });
    
    expect(useSyncQueueStore.getState().queue).toHaveLength(2);
    expect(mockDb).toHaveLength(0);
    
    // Come back online
    await store.setOnlineStatus(true);
    
    // Handler should be called with 2 operations
    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler.mock.calls[0][0]).toHaveLength(2);
    
    // DB should have 2 items
    expect(mockDb).toHaveLength(2);
    expect(mockDb[0].name).toBe('Cappuccino');
    expect(mockDb[1].name).toBe('Mocha');
    
    // Queue should be empty
    expect(useSyncQueueStore.getState().queue).toHaveLength(0);
  });
});
