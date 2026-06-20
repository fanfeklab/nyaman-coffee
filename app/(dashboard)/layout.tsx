'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/templates/AppLayout';
import { useAuthStore } from '@/store/useAuthStore';
import { subscribeToInventoryData, subscribeToTransactions, subscribeToShifts } from '@/lib/firebase/services';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated, push to login
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      const unsubInventory = subscribeToInventoryData();
      const unsubTx = subscribeToTransactions();
      const unsubShifts = subscribeToShifts();
      return () => {
        unsubInventory();
        unsubTx();
        unsubShifts();
      };
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
     return null; // or a loader
  }

  return (
    <AppLayout>
      {children}
    </AppLayout>
  );
}
