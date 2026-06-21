'use client';

import { useState, useMemo, useCallback } from 'react';
import { useAuthStore, User } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Plus, Pencil, Trash, Shield, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

export default function EmployeesPage() {
  const { users, addUser, updateUser, deleteUser, user: currentUser } = useAuthStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    pin: '',
    role: 'CASHIER' as 'SUPER_ADMIN' | 'MANAGER' | 'CASHIER',
  });

  const generateId = () => `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(7)}`;

  const handleOpenDialog = useCallback((user?: User) => {
    if (user) {
      setEditingItem(user);
      setFormData({
        username: user.username,
        fullName: user.fullName,
        pin: user.pin,
        role: user.role,
      });
    } else {
      setEditingItem(null);
      setFormData({
        username: '',
        fullName: '',
        pin: '',
        role: 'CASHIER',
      });
    }
    setIsDialogOpen(true);
  }, []);

  const handleSave = () => {
    if (!formData.username || !formData.fullName || !formData.pin) {
      toast.error('Semua field wajib diisi');
      return;
    }

    if (formData.pin.length < 4) {
      toast.error('PIN minimal 4 karakter');
      return;
    }

    if (editingItem) {
      updateUser(editingItem.id, formData);
      toast.success('Data karyawan berhasil diperbarui');
    } else {
      // Check if username already exists
      const exists = users.some(u => u.username.toLowerCase() === formData.username.toLowerCase());
      if (exists) {
        toast.error('Username sudah digunakan');
        return;
      }
      
      addUser({
        username: formData.username.toLowerCase(),
        fullName: formData.fullName,
        pin: formData.pin,
        role: formData.role,
      });
      toast.success('Karyawan baru berhasil ditambahkan');
    }
    setIsDialogOpen(false);
  };

  const handleDeleteRequest = useCallback((id: string) => {
    if (id === currentUser?.id) {
      toast.error('Tidak dapat menghapus akun Anda sendiri yang sedang login');
      return;
    }
    setItemToDelete(id);
    setIsConfirmOpen(true);
  }, [currentUser?.id]);

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteUser(itemToDelete);
      toast.success('Karyawan berhasil dihapus');
      setItemToDelete(null);
    }
  };

  const columns = useMemo<ColumnDef<User>[]>(() => [
    { accessorKey: 'fullName', header: 'Nama Lengkap' },
    { accessorKey: 'username', header: 'Username' },
    { accessorKey: 'role', header: 'Role', cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.role === 'SUPER_ADMIN' || row.original.role === 'MANAGER' ? <Shield className="h-4 w-4 text-blue-500" /> : <UserIcon className="h-4 w-4 text-green-500" />}
          <span className={row.original.role === 'SUPER_ADMIN' || row.original.role === 'MANAGER' ? 'text-blue-500 font-bold' : 'text-green-600 font-bold'}>{row.original.role}</span>
        </div>
    ) },
    { accessorKey: 'pin', header: 'PIN', cell: () => <span className="font-mono">••••</span> },
    { id: 'actions', header: () => <div className="text-right">Aksi</div>, cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="icon" onClick={() => handleOpenDialog(row.original)} className="h-8 w-8"><Pencil className="h-4 w-4 text-orange-500" /></Button>
          <Button variant="outline" size="icon" onClick={() => handleDeleteRequest(row.original.id)} disabled={row.original.username === 'admin'} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"><Trash className="h-4 w-4" /></Button>
        </div>
    ) }
  ], [handleOpenDialog, handleDeleteRequest]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Karyawan & Akses</h1>
          <p className="text-muted-foreground">Kelola data staf dan hak akses (Admin / Kasir).</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Karyawan
        </Button>
      </div>

      <Card className="border-2 shadow-sm">
        <CardContent className="p-0">
          <DataTable columns={columns} data={users} />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] border-2">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Karyawan' : 'Tambah Karyawan'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                placeholder="Rudi Hermawan"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="border-2"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="username">Username (Untuk Login)</Label>
              <Input
                id="username"
                placeholder="rudi"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="border-2"
                disabled={editingItem?.username === 'admin'} // Protect root admin username
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pin">PIN (4-6 Digit Angka)</Label>
              <Input
                id="pin"
                type="number"
                placeholder="1234"
                value={formData.pin}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                className="border-2 font-mono"
              />
            </div>

            <div className="grid gap-2">
              <Label>Role (Hak Akses)</Label>
              <Select
                value={formData.role}
                onValueChange={(val: string | null) => { if (val) setFormData({ ...formData, role: val as 'SUPER_ADMIN' | 'MANAGER' | 'CASHIER' })}}
                disabled={editingItem?.username === 'admin'} // Protect root admin role
              >
                <SelectTrigger className="border-2">
                  <SelectValue placeholder="Pilih Role..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASHIER">KASIR</SelectItem>
                  <SelectItem value="MANAGER">MANAGER</SelectItem>
                  <SelectItem value="SUPER_ADMIN">SUPER ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-2">
              Batal
            </Button>
            <Button onClick={handleSave} className="border-2">
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Hapus Karyawan"
        description="Apakah Anda yakin ingin menghapus karyawan ini? Karyawan tidak akan dapat login kembali ke sistem."
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
