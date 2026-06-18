'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppLayout } from '@/components/templates/AppLayout';
import { useAuthStore } from '@/store/useAuthStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not authenticated, push to login
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
     return null; // or a loader
  }

  // POS mode generally doesn't have sidebar always open, but let's just use the layout.
  // We can pass hideSidebar based on route if we want later.
  return (
    <AppLayout>
      {children}
    </AppLayout>
  );
}
