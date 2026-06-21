'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore, User, UserRole } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Trash2, Edit, Plus, Users, Ban } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser, users, addUser, updateUser, deleteUser } = useAuthStore();
  
  useEffect(() => {
    if (currentUser && currentUser.role !== 'SUPER_ADMIN') {
       router.replace('/pos');
       toast.error('Akses ditolak: Hanya SUPER_ADMIN yang dapat mengakses fitur ini.');
    }
  }, [currentUser, router]);

  // Dialog States
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form States
  const [formData, setFormData] = useState<{
    username: string;
    fullName: string;
    role: UserRole;
    pin: string;
  }>({
    username: '',
    fullName: '',
    role: 'CASHIER',
    pin: ''
  });

  const handleOpenForm = React.useCallback((u?: User) => {
    if (u) {
      setEditingId(u.id);
      setFormData({
        username: u.username,
        fullName: u.fullName,
        role: u.role,
        pin: u.pin
      });
    } else {
      setEditingId(null);
      setFormData({ username: '', fullName: '', role: 'CASHIER', pin: '' });
    }
    setFormOpen(true);
  }, []);

  const columns = useMemo<ColumnDef<User>[]>(() => [
    { accessorKey: 'fullName', header: 'Nama Lengkap' },
    { accessorKey: 'username', header: 'Username' },
    { accessorKey: 'role', header: 'Role', cell: ({ row }) => (
        <span className={`px-2 py-1 border-2 border-black rounded uppercase font-black text-xs ${
          row.original.role === 'SUPER_ADMIN' ? 'bg-red-300' :
          row.original.role === 'MANAGER' ? 'bg-blue-300' : 'bg-green-300'
        }`}>
          {row.original.role.replace('_', ' ')}
        </span>
    ) },
    { id: 'actions', header: () => <div className="text-right">Aksi</div>, cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button size="icon-sm" variant="outline" onClick={() => handleOpenForm(row.original)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="icon-sm" variant="destructive" onClick={() => setDeleteId(row.original.id)} disabled={row.original.id === currentUser?.id}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
    ) }
  ], [currentUser, handleOpenForm]);

  const handleSave = async () => {
    if (!formData.username || !formData.fullName || !formData.pin) {
      toast.error('Gagal: Semua kolom wajib diisi');
      return;
    }

    if (!editingId && users.find(u => u.username === formData.username)) {
       toast.error('Gagal: Username sudah digunakan');
       return;
    }

    const loadToast = toast.loading("Menyimpan data karyawan...");
    
    try {
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulasi loading
      if (editingId) {
        updateUser(editingId, formData);
        toast.success('Pengguna berhasil diperbarui', { id: loadToast });
      } else {
        addUser(formData);
        toast.success('Pengguna berhasil ditambahkan', { id: loadToast });
      }
      setFormOpen(false);
    } catch(err) {
      toast.error('Terjadi kesalahan saat menyimpan', { id: loadToast });
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
       // Prevent deleting oneself
       if (deleteId === currentUser?.id) {
          toast.error('Gagal: Tidak dapat menghapus akun Anda sendiri');
          setDeleteId(null);
          return;
       }
       const loadToast = toast.loading("Menghapus karyawan...");
       try {
         await new Promise(resolve => setTimeout(resolve, 600)); // Simulasi loading
         deleteUser(deleteId);
         toast.success('Pengguna berhasil dihapus', { id: loadToast });
       } catch (error) {
         toast.error('Gagal menghapus pengguna!', { id: loadToast });
       } finally {
         setDeleteId(null);
       }
    }
  };

  if (currentUser?.role !== 'SUPER_ADMIN') {
    return null; // Will redirect
  }

  return (
    <div className="flex flex-col h-full bg-[#FFFDF7] p-4 md:p-8 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
         <div>
            <h1 className="font-space-grotesk font-black text-3xl md:text-4xl uppercase text-black">Manajemen Karyawan</h1>
            <p className="font-inter font-bold text-gray-500 mt-2">Atur hak akses dan akun pengguna sistem (User Management).</p>
         </div>
         <Button onClick={() => handleOpenForm()} className="bg-[#FF90E8] text-black shrink-0">
           <Plus className="w-5 h-5 mr-2" />
           TAMBAH KARYAWAN
         </Button>
      </div>

      <div className="bg-white border-4 border-black rounded-2xl flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 overflow-hidden mb-8">
         <DataTable columns={columns} data={users} searchPlaceholder="Cari pengguna..." />
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="border-8 border-black rounded-[2rem] max-w-lg bg-[#FFFDF7] p-0 overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
           <div className="p-6 bg-[#00A19D] border-b-8 border-black">
              <h2 className="font-space-grotesk font-black text-2xl uppercase text-black text-center">
                 {editingId ? 'Edit Karyawan' : 'Tambah Karyawan'}
              </h2>
           </div>
           
           <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                 <Label>Username</Label>
                 <Input 
                   value={formData.username} 
                   onChange={e => setFormData({...formData, username: e.target.value})}
                   placeholder="misal: ahmad"
                 />
              </div>

              <div className="flex flex-col gap-2">
                 <Label>Nama Lengkap</Label>
                 <Input 
                   value={formData.fullName} 
                   onChange={e => setFormData({...formData, fullName: e.target.value})}
                   placeholder="misal: Ahmad Suparjo"
                 />
              </div>

              <div className="flex flex-col gap-2">
                 <Label>Role Akses</Label>
                 <Select 
                    value={formData.role}
                    onValueChange={val => setFormData({...formData, role: (val as UserRole) || 'CASHIER'})}
                 >
                    <SelectTrigger className="flex-grow h-12 w-full min-w-0 rounded-xl border-4 border-black bg-white px-4 py-2 text-base transition-all outline-none font-inter font-bold focus-visible:shadow-[4px_4px_0_0_#000]">
                       <SelectValue placeholder="Pilih Role Akses" />
                    </SelectTrigger>
                    <SelectContent className="border-4 border-black rounded-xl shadow-[4px_4px_0_0_#000] font-inter font-bold">
                       <SelectItem value="CASHIER">CASHIER (Kasir Biasa)</SelectItem>
                       <SelectItem value="MANAGER">MANAGER (Supervisor)</SelectItem>
                       <SelectItem value="SUPER_ADMIN">SUPER ADMIN (Owner/Admin)</SelectItem>
                    </SelectContent>
                 </Select>
              </div>

              <div className="flex flex-col gap-2">
                 <Label>PIN Login</Label>
                 <Input 
                   type="password"
                   inputMode="numeric"
                   maxLength={6}
                   value={formData.pin} 
                   onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})}
                   placeholder="misal: 123456"
                 />
              </div>
           </div>

           <div className="p-6 border-t-8 border-black bg-white flex justify-end gap-4">
              <Button variant="outline" onClick={() => setFormOpen(false)}>BATAL</Button>
              <Button onClick={handleSave} className="bg-[#00E5FF] hover:bg-cyan-400">SIMPAN KARYAWAN</Button>
           </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Karyawan"
        description="Apakah Anda yakin ingin menghapus akun karyawan ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
}
