'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCustomerStore, Customer } from '@/store/useCustomerStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit, Plus, Users } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

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

  const sortedCustomers = useMemo(() => [...customers].sort((a,b) => b.points - a.points), [customers]);

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

  const handleSave = async () => {
    if (!formData.name || !formData.phone) {
      toast.error('Gagal: Semua kolom wajib diisi');
      return;
    }

    const loadToast = toast.loading("Menyimpan data pelanggan...");
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      if (editingId) {
        updateCustomer(editingId, formData);
        toast.success('Pelanggan berhasil diperbarui', { id: loadToast });
      } else {
        addCustomer(formData);
        toast.success('Pelanggan berhasil ditambahkan', { id: loadToast });
      }
      setFormOpen(false);
    } catch(err) {
      toast.error("Gagal menyimpan data pelanggan", { id: loadToast });
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
       const loadToast = toast.loading("Menghapus data pelanggan...");
       try {
         await new Promise(resolve => setTimeout(resolve, 600));
         deleteCustomer(deleteId);
         toast.success('Pelanggan berhasil dihapus', { id: loadToast });
       } catch(err) {
         toast.error("Gagal menghapus data pelanggan", { id: loadToast });
       } finally {
         setDeleteId(null);
       }
    }
  };

  const columns = useMemo<ColumnDef<Customer>[]>(() => [
    { accessorKey: 'name', header: 'Nama Pelanggan' },
    { accessorKey: 'phone', header: 'Nomor HP' },
    { accessorKey: 'points', header: 'Loyalty Points', cell: ({ row }) => <span className="px-2 py-1 bg-[#00E5FF] border-2 border-black rounded font-black text-xs">{row.original.points} Poin</span> },
    { id: 'actions', header: () => <div className="text-right">Aksi</div>, cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button size="icon-sm" variant="outline" onClick={() => handleOpenForm(row.original)}><Edit className="w-4 h-4" /></Button>
          <Button size="icon-sm" variant="destructive" onClick={() => setDeleteId(row.original.id)}><Trash2 className="w-4 h-4" /></Button>
        </div>
    ) }
  ], []);

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
         <div className="border-4 border-black rounded-xl overflow-hidden">
           <DataTable columns={columns} data={sortedCustomers} />
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
