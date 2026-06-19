'use client';

import { useState } from 'react';
import { useAuthStore, User } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Plus, Pencil, Trash, Shield, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

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

  const handleOpenDialog = (user?: User) => {
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
  };

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

  const handleDeleteRequest = (id: string) => {
    if (id === currentUser?.id) {
      toast.error('Tidak dapat menghapus akun Anda sendiri yang sedang login');
      return;
    }
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteUser(itemToDelete);
      toast.success('Karyawan berhasil dihapus');
      setItemToDelete(null);
    }
  };

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
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>PIN</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Belum ada data karyawan.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.fullName}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {u.role === 'SUPER_ADMIN' || u.role === 'MANAGER' ? (
                          <Shield className="h-4 w-4 text-blue-500" />
                        ) : (
                          <UserIcon className="h-4 w-4 text-green-500" />
                        )}
                        <span className={
                          u.role === 'SUPER_ADMIN' || u.role === 'MANAGER' ? 'text-blue-500 font-bold' : 'text-green-600 font-bold'
                        }>
                          {u.role}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      ••••
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenDialog(u)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4 text-orange-500" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteRequest(u.id)}
                          disabled={u.username === 'admin'} // Protect root admin
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
