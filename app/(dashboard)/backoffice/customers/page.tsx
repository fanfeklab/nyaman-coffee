'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCustomerStore, Customer } from '@/store/useCustomerStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus, Users, Search } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function CustomersPage() {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  
  useEffect(() => {
    if (currentUser && currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'MANAGER') {
       router.replace('/pos');
       toast.error('Akses ditolak: Anda tidak memiliki izin ke halaman ini');
    }
  }, [currentUser, router]);

  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomerStore();
  const [search, setSearch] = useState('');
  
  // Dialog States
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form States
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
  }>({
    name: '',
    phone: '',
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  ).sort((a,b) => b.points - a.points); // sort by highest points

  const handleOpenForm = (customerToEdit?: Customer) => {
    if (customerToEdit) {
      setEditingId(customerToEdit.id);
      setFormData({
        name: customerToEdit.name,
        phone: customerToEdit.phone,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        phone: '',
      });
    }
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.phone) {
      toast.error('Gagal: Semua kolom wajib diisi');
      return;
    }

    if (editingId) {
      updateCustomer(editingId, formData);
      toast.success('Pelanggan berhasil diperbarui');
    } else {
      addCustomer(formData);
      toast.success('Pelanggan berhasil ditambahkan');
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
       deleteCustomer(deleteId);
       toast.success('Pelanggan berhasil dihapus');
       setDeleteId(null);
    }
  };

  if (currentUser?.role !== 'SUPER_ADMIN' && currentUser?.role !== 'MANAGER') {
    return null; // Will redirect
  }

  return (
    <div className="flex flex-col h-full bg-[#FFFDF7] p-4 md:p-8 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
         <div>
            <h1 className="font-space-grotesk font-black text-3xl md:text-4xl uppercase text-black">Database Pelanggan</h1>
            <p className="font-inter font-bold text-gray-500 mt-2">Atur data pelanggan dan pantau Loyalty Points (CRM).</p>
         </div>
         <Button onClick={() => handleOpenForm()} className="bg-[#FF90E8] text-black shrink-0">
           <Plus className="w-5 h-5 mr-2" />
           TAMBAH PELANGGAN
         </Button>
      </div>

      <div className="bg-white border-4 border-black rounded-2xl flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 overflow-hidden mb-8">
         <div className="flex justify-between items-center mb-4">
           <div className="relative w-full md:w-96">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
             <Input 
               className="pl-10 h-12"
               placeholder="Cari nama atau nomor telepon..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
           </div>
         </div>

         <div className="border-4 border-black rounded-xl overflow-hidden">
           <Table>
             <TableHeader className="bg-[#FFD100]">
               <TableRow className="border-b-4 border-black hover:bg-[#FFD100]">
                 <TableHead className="font-space-grotesk font-black text-black uppercase">Nama Pelanggan</TableHead>
                 <TableHead className="font-space-grotesk font-black text-black uppercase">Nomor HP</TableHead>
                 <TableHead className="font-space-grotesk font-black text-black uppercase">Loyalty Points</TableHead>
                 <TableHead className="font-space-grotesk font-black text-black uppercase text-right">Aksi</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {filteredCustomers.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={4} className="text-center py-8 font-inter font-bold text-gray-500">
                     Tidak ada data pelanggan.
                   </TableCell>
                 </TableRow>
               ) : filteredCustomers.map((c) => (
                 <TableRow key={c.id} className="border-b-2 border-dashed border-gray-200">
                   <TableCell className="font-inter font-bold text-black">{c.name}</TableCell>
                   <TableCell className="font-inter font-bold text-black">{c.phone}</TableCell>
                   <TableCell>
                     <span className="px-2 py-1 bg-[#00E5FF] border-2 border-black rounded font-black text-xs">
                       {c.points} Poin
                     </span>
                   </TableCell>
                   <TableCell className="text-right">
                     <div className="flex justify-end gap-2">
                       <Button size="icon-sm" variant="outline" onClick={() => handleOpenForm(c)}>
                         <Edit className="w-4 h-4" />
                       </Button>
                       <Button size="icon-sm" variant="destructive" onClick={() => setDeleteId(c.id)}>
                         <Trash2 className="w-4 h-4" />
                       </Button>
                     </div>
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="border-8 border-black rounded-[2rem] max-w-lg bg-[#FFFDF7] p-0 overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
           <div className="p-6 bg-[#00A19D] border-b-8 border-black">
              <h2 className="font-space-grotesk font-black text-2xl uppercase text-black text-center">
                 {editingId ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
              </h2>
           </div>
           
           <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                 <Label>Nama Lengkap</Label>
                 <Input 
                   value={formData.name} 
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   placeholder="misal: Budi Santoso"
                 />
              </div>

              <div className="flex flex-col gap-2">
                 <Label>Nomor WhatsApp / HP</Label>
                 <Input 
                   value={formData.phone} 
                   onChange={e => setFormData({...formData, phone: e.target.value})}
                   placeholder="misal: 08123456789"
                   type="tel"
                 />
              </div>
           </div>

           <div className="p-6 border-t-8 border-black bg-white flex justify-end gap-4">
              <Button variant="outline" onClick={() => setFormOpen(false)}>BATAL</Button>
              <Button onClick={handleSave} className="bg-[#00E5FF] hover:bg-cyan-400">SIMPAN PELANGGAN</Button>
           </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Pelanggan"
        description="Apakah Anda yakin ingin menghapus data pelanggan ini? Seluruh poin loyalty mereka akan hilang."
      />
    </div>
  );
}
