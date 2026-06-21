'use client';

import { useEffect } from 'react';
import { useSyncQueueStore, SyncOperation } from '@/store/useSyncQueueStore';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const setSyncHandler = useSyncQueueStore(state => state.setSyncHandler);
  const setOnlineStatus = useSyncQueueStore(state => state.setOnlineStatus);
  const flushQueue = useSyncQueueStore(state => state.flushQueue);

  useEffect(() => {
    // Define the handler
    const handler = async (operations: SyncOperation[]) => {
      let failedOps = 0;
      
      for (const op of operations) {
        try {
          if (op.type === 'NEW_TRANSACTION') {
            const { transaction, items } = op.payload;
            const txToInsert = {
              id: transaction.id,
              shift_id: transaction.shiftId,
              cashier_id: transaction.cashierId,
              customer_id: transaction.customerId,
              customer_name: transaction.customerName,
              total: transaction.total,
              payment_method: transaction.paymentMethod,
              cash_given: transaction.cashGiven,
              timestamp: new Date(transaction.timestamp).toISOString(),
              status: transaction.status,
            };
            const { error: txError } = await supabase.from('transactions').insert(txToInsert);
            if (txError) throw txError;
            
            if (items && items.length > 0) {
              const itemsToInsert = items.map((item: any) => ({
                transaction_id: transaction.id,
                product_id: item.product.id,
                qty: item.qty,
                price_at_time: item.price,
                note: item.notes,
              }));
              const { error: itemsError } = await supabase.from('transaction_items').insert(itemsToInsert);
              if (itemsError) throw itemsError;
            }
          }
          if (op.type === 'AUDIT_LOG') {
             const { error } = await supabase.from('audit_logs').insert(op.payload);
             if (error) throw error;
          }
          // handle other operations as needed...
        } catch (e) {
          console.error("Failed to sync operation", op.id, e);
          failedOps++;
        }
      }
      
      if (failedOps > 0) {
         throw new Error(`Failed to sync ${failedOps} operations`);
      }
    };
    
    setSyncHandler(handler);

    // Monitor online/offline status
    const handleOnline = () => {
      setOnlineStatus(true);
      toast.success('Kembali Online', { description: 'Koneksi internet terhubung. Menyinkronkan data...' });
    };
    const handleOffline = () => {
      setOnlineStatus(false);
      toast.error('Offline Mode', { description: 'Koneksi terputus. Kasir tetap bisa digunakan.' });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial status
    if (typeof navigator !== 'undefined') {
       setOnlineStatus(navigator.onLine);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setSyncHandler, setOnlineStatus]);

  // Periodic fallback flush
  useEffect(() => {
    const interval = setInterval(() => {
      if (useSyncQueueStore.getState().isOnline) {
        flushQueue();
      }
    }, 30000); // every 30 seconds
    return () => clearInterval(interval);
  }, [flushQueue]);

  return <>{children}</>;
}
