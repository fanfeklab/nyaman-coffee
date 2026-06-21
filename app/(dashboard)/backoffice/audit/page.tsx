'use client';

import React, { useMemo, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuditStore, AuditLog } from '@/store/useAuditStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

export default function AuditPage() {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const { logs } = useAuditStore();

  useEffect(() => {
    if (currentUser && currentUser.role !== 'SUPER_ADMIN') {
       router.replace('/pos');
       toast.error('Akses ditolak: Hanya SUPER_ADMIN yang dapat melihat audit trails');
    }
  }, [currentUser, router]);

  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    const headers = ['Waktu', 'Pengguna', 'Role', 'Aksi', 'Detail'];
    const csvContent =
      headers.join(',') + '\n' +
      logs.map(log => {
        return [
          new Date(log.timestamp).toISOString(),
          `"${log.userName}"`,
          log.userRole,
          `"${log.action}"`,
          `"${log.details.replace(/"/g, '""')}"`
        ].join(',');
      }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_trails_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Berhasil mengekspor CSV');
  };

  const columns = useMemo<ColumnDef<AuditLog>[]>(() => [
    { 
      accessorKey: 'timestamp', 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Waktu" />, 
      cell: ({ row }) => <span className="whitespace-nowrap">{new Intl.DateTimeFormat('id-ID', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(row.original.timestamp))}</span> 
    },
    { 
      accessorKey: 'userName', 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Pengguna" />, 
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-inter font-bold text-black">{row.original.userName}</span>
          <span className="text-xs text-gray-500">{row.original.userRole}</span>
        </div>
      ) 
    },
    { 
      accessorKey: 'action', 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Aksi" />, 
      cell: ({ row }) => <span className="font-inter font-bold text-[#FF6321]">{row.original.action}</span> 
    },
    { 
      accessorKey: 'details', 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Detail" />, 
      cell: ({ row }) => <span className="font-inter text-gray-700">{row.original.details}</span> 
    }
  ], []);

  if (currentUser?.role !== 'SUPER_ADMIN') {
    return null; // Will redirect
  }

  return (
    <div className="flex flex-col h-full bg-[#FFFDF7] p-4 md:p-8 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
         <div>
            <h1 className="font-space-grotesk font-black text-3xl md:text-4xl uppercase text-black">Audit Trails</h1>
            <p className="font-inter font-bold text-gray-500 mt-2">Log aktivitas pengguna untuk keamanan dan pencegahan fraud.</p>
         </div>
         <Button onClick={handleExportCSV} className="border-4 border-black font-bold uppercase hover:bg-black hover:text-white transition-colors" variant="outline">
           Export CSV
         </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={logs} 
        searchPlaceholder="Cari aktivitas..." 
      />
    </div>
  );
}
