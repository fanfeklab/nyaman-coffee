'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuditStore, AuditLog } from '@/store/useAuditStore';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

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

  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) || 
    log.details.toLowerCase().includes(search.toLowerCase()) ||
    log.userName.toLowerCase().includes(search.toLowerCase())
  );

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
      </div>

      <div className="bg-white border-4 border-black rounded-2xl flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 overflow-hidden mb-8">
         <div className="flex justify-between items-center mb-4">
           <div className="relative w-full md:w-96">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
             <Input 
               className="pl-10 h-12"
               placeholder="Cari aktivitas..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
           </div>
         </div>

         <div className="border-4 border-black rounded-xl overflow-hidden">
           <Table>
             <TableHeader className="bg-[#FFD100]">
               <TableRow className="border-b-4 border-black hover:bg-[#FFD100]">
                 <TableHead className="font-space-grotesk font-black text-black uppercase">Waktu</TableHead>
                 <TableHead className="font-space-grotesk font-black text-black uppercase">Pengguna</TableHead>
                 <TableHead className="font-space-grotesk font-black text-black uppercase">Aksi</TableHead>
                 <TableHead className="font-space-grotesk font-black text-black uppercase">Detail</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {filteredLogs.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={4} className="text-center py-8 font-inter font-bold text-gray-500">
                     Belum ada aktivitas tercatat.
                   </TableCell>
                 </TableRow>
               ) : filteredLogs.map((log) => (
                 <TableRow key={log.id} className="border-b-2 border-dashed border-gray-200">
                   <TableCell className="font-inter font-bold text-black whitespace-nowrap">
                      {new Intl.DateTimeFormat('id-ID', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(log.timestamp))}
                   </TableCell>
                   <TableCell>
                      <div className="flex flex-col">
                        <span className="font-inter font-bold text-black">{log.userName}</span>
                        <span className="text-xs text-gray-500">{log.userRole}</span>
                      </div>
                   </TableCell>
                   <TableCell className="font-inter font-bold text-[#FF6321]">{log.action}</TableCell>
                   <TableCell className="font-inter text-gray-700">{log.details}</TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </div>
      </div>
    </div>
  );
}
