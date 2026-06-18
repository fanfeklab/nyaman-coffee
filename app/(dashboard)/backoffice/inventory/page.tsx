'use client';

import React, { useState, useEffect } from 'react';
import { useInventoryStore, RawMaterial } from '@/store/useInventoryStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, Search, PackageOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function InventoryPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'MANAGER') {
       router.replace('/pos');
       toast.error('Akses ditolak: Anda tidak memiliki izin ke halaman ini');
    }
  }, [user, router]);

  const { rawMaterials, addRawMaterial, deleteRawMaterial, updateRawMaterial } = useInventoryStore();
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<RawMaterial>>({ name: '', unit: '', currentStock: 0 });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredMaterials = rawMaterials.filter(rm => rm.name.toLowerCase().includes(search.toLowerCase()));

  const handleOpenNew = () => {
    setEditingId(null);
    setForm({ name: '', unit: '', currentStock: 0 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rm: RawMaterial) => {
    setEditingId(rm.id);
    setForm(rm);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.unit) {
      toast.error('Nama dan Satuan wajib diisi!');
      return;
    }
    
    if (editingId) {
       updateRawMaterial(editingId, form);
       toast.success('Bahan baku diperbaharui');
    } else {
       addRawMaterial({
         id: 'rm_' + Math.random().toString(36).substr(2, 6),
         name: form.name as string,
         unit: form.unit as string,
         currentStock: form.currentStock || 0
       });
       toast.success('Bahan baku berhasil ditambahkan');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 lg:p-10 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h1 className="font-space-grotesk font-black text-4xl uppercase tracking-widest text-black">Bahan Baku & Stok</h1>
            <p className="font-inter font-bold text-gray-500">Kelola inventori bahan untuk memotong stok saat pesanan masuk.</p>
         </div>
      </div>

      <div className="bg-white border-4 border-black rounded-2xl flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 overflow-hidden">
         <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="relative w-full md:w-96">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
               <Input 
                 placeholder="Cari bahan baku..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="pl-10"
               />
            </div>
            <Button onClick={handleOpenNew} className="gap-2 bg-[#FF90E8] text-black hover:bg-pink-400">
               <Plus className="w-5 h-5"/> TAMBAH BAHAN
            </Button>
         </div>

         <div className="overflow-x-auto border-4 border-black rounded-xl">
            <Table>
               <TableHeader className="bg-gray-100 border-b-4 border-black font-space-grotesk font-black uppercase">
                 <TableRow>
                   <TableHead className="w-[80px] border-r-2 border-black"></TableHead>
                   <TableHead className="text-black border-r-2 border-black">Nama Bahan</TableHead>
                   <TableHead className="text-black border-r-2 border-black">Stok Saat Ini</TableHead>
                   <TableHead className="text-right text-black w-[150px]">Aksi</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody className="font-inter font-bold">
                 {filteredMaterials.map(rm => (
                    <TableRow key={rm.id} className="border-b-2 border-gray-200 hover:bg-gray-50">
                      <TableCell className="border-r-2 border-gray-200">
                         <div className="w-10 h-10 bg-orange-100 border-2 border-black rounded flex items-center justify-center">
                            <PackageOpen className="w-5 h-5 text-orange-600" />
                         </div>
                      </TableCell>
                      <TableCell className="border-r-2 border-gray-200">{rm.name}</TableCell>
                      <TableCell className="border-r-2 border-gray-200">
                        <span className={`px-3 py-1 border-2 border-black rounded text-sm ${rm.currentStock <= 10 ? 'bg-red-200' : 'bg-green-200'}`}>
                           {rm.currentStock} {rm.unit}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenEdit(rm)} className="p-2 border-2 border-black rounded hover:bg-gray-100 transition-colors">
                            <Edit2 className="w-4 h-4"/>
                          </button>
                          <button onClick={() => setDeleteConfirmId(rm.id)} className="p-2 border-2 border-black rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                 ))}
                 
                 {filteredMaterials.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-gray-500 font-space-grotesk tracking-widest uppercase">
                        Tidak ada bahan baku.
                      </TableCell>
                    </TableRow>
                 )}
               </TableBody>
            </Table>
         </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="border-8 border-black rounded-[2rem] bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm">
           <DialogHeader>
             <DialogTitle className="font-space-grotesk font-black text-2xl uppercase">
                {editingId ? 'Edit Bahan Baku' : 'Tambah Bahan Baku'}
             </DialogTitle>
           </DialogHeader>
           <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                 <Label>Nama Bahan</Label>
                 <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Contoh: Susu Oat" />
              </div>
              <div className="flex flex-col gap-2">
                 <Label>Satuan / Unit</Label>
                 <Input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} placeholder="Contoh: ml, gram, pcs" />
              </div>
              <div className="flex flex-col gap-2">
                 <Label>Stok Awal</Label>
                 <Input type="number" value={form.currentStock} onChange={e => setForm({...form, currentStock: parseFloat(e.target.value)})} placeholder="0" />
              </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setIsModalOpen(false)}>BATAL</Button>
             <Button onClick={handleSave}>SIMPAN</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        title="Hapus Bahan Baku?"
        description="Data bahan baku tidak dapat dikembalikan."
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteRawMaterial(deleteConfirmId);
            toast.success("Bahan baku dihapus");
          }
        }}
      />
    </div>
  );
}
