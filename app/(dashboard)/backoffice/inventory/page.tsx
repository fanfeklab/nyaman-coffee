'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useInventoryStore, RawMaterial } from '@/store/useInventoryStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit2, Trash2, Search, PackageOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function InventoryPage() {
  // force cache invalidation
  const router = useRouter();
  const { user } = useAuthStore();
  
  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'MANAGER') {
       router.replace('/pos');
       toast.error('Akses ditolak: Anda tidak memiliki izin ke halaman ini');
    }
  }, [user, router]);

  const { rawMaterials, products, recipes, addRawMaterial, deleteRawMaterial, updateRawMaterial, addRecipe, updateRecipe, deleteRecipe } = useInventoryStore();
  const [activeTab, setActiveTab] = useState<'MATERIALS' | 'RECIPES'>('MATERIALS');
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<RawMaterial>>({ name: '', unit: '', currentStock: 0 });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [recipeForm, setRecipeForm] = useState<any>({ productId: '', instructions: '', ingredients: [] });
  const [deleteRecipeConfirm, setDeleteRecipeConfirm] = useState<string | null>(null);

  const handleOpenNew = useCallback(() => {
    setEditingId(null);
    setForm({ name: '', unit: '', currentStock: 0 });
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((rm: RawMaterial) => {
    setEditingId(rm.id);
    setForm(rm);
    setIsModalOpen(true);
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.unit) {
      toast.error('Nama dan Satuan wajib diisi!');
      return;
    }
    
    const loadToast = toast.loading("Menyimpan bahan baku...");
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      if (editingId) {
         updateRawMaterial(editingId, form);
         toast.success('Bahan baku diperbaharui', { id: loadToast });
      } else {
         addRawMaterial({
           id: 'rm_' + Date.now().toString(36),
           name: form.name as string,
           unit: form.unit as string,
           currentStock: form.currentStock || 0
         });
         toast.success('Bahan baku berhasil ditambahkan', { id: loadToast });
      }
      setIsModalOpen(false);
    } catch(err) {
      toast.error("Gagal menyimpan bahan baku!", { id: loadToast });
    }
  };

  const handleOpenAddRecipe = useCallback(() => {
    setEditingRecipeId(null);
    setRecipeForm({ productId: '', instructions: '', ingredients: [] });
    setIsRecipeModalOpen(true);
  }, []);

  const handleOpenEditRecipe = useCallback((r: any) => {
    setEditingRecipeId(r.id);
    setRecipeForm(JSON.parse(JSON.stringify(r)));
    setIsRecipeModalOpen(true);
  }, []);

  const handleSaveRecipe = async () => {
    if (!recipeForm.productId) return toast.error('Pilih Menu (Produk) terlebih dahulu!');
    if (!recipeForm.ingredients || recipeForm.ingredients.length === 0) return toast.error('Minimal 1 bahan wajib!');

    const loadToast = toast.loading("Menyimpan resep...");
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      if (editingRecipeId) {
         updateRecipe(editingRecipeId, recipeForm);
         toast.success('Resep berhasil diubah!', { id: loadToast });
      } else {
         // check if product already has recipe
         const existing = recipes.find(x => x.productId === recipeForm.productId);
         if (existing) {
            toast.error('Menu ini sudah memiliki resep! Silahkan edit yang sudah ada.', { id: loadToast });
            return;
         }
         
         addRecipe({
           id: 'rec_' + Date.now().toString(36),
           productId: recipeForm.productId,
           ingredients: recipeForm.ingredients,
           instructions: recipeForm.instructions
         });
         toast.success('Resep berhasil ditambahkan!', { id: loadToast });
      }
      setIsRecipeModalOpen(false);
    } catch(err) {
      toast.error("Gagal menyimpan resep!", { id: loadToast });
    }
  };

  const materialColumns = useMemo<ColumnDef<RawMaterial>[]>(() => [
    { id: 'icon', header: '', cell: () => <div className="w-10 h-10 bg-orange-100 border-2 border-black rounded flex items-center justify-center"><PackageOpen className="w-5 h-5 text-orange-600" /></div> },
    { accessorKey: 'name', header: 'Nama Bahan' },
    { accessorKey: 'currentStock', header: 'Stok Saat Ini', cell: ({ row }) => <span className={`px-3 py-1 border-2 border-black rounded text-sm ${row.original.currentStock <= 10 ? 'bg-red-200' : 'bg-green-200'}`}>{row.original.currentStock} {row.original.unit}</span> },
    { id: 'actions', header: () => <div className="text-right">Aksi</div>, cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button onClick={() => handleOpenEdit(row.original)} className="p-2 border-2 border-black rounded hover:bg-gray-100 transition-colors"><Edit2 className="w-4 h-4"/></Button>
          <Button onClick={() => setDeleteConfirmId(row.original.id)} className="p-2 border-2 border-black rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"><Trash2 className="w-4 h-4"/></Button>
        </div>
    ) }
  ], [handleOpenEdit]);

  const recipeColumns = useMemo<ColumnDef<any>[]>(() => [
    { 
      id: 'productName', 
      header: 'Menu (Produk)', 
      cell: ({ row }) => {
        const prod = products.find(p => p.id === row.original.productId);
        return <span className="uppercase font-black">{prod?.name || 'Unknown Menu'}</span>;
      } 
    },
    { 
      id: 'ingredientCount', 
      header: 'Jumlah Bahan', 
      cell: ({ row }) => <span className="font-bold text-gray-500">{row.original.ingredients.length} Bahan Baku di-link</span>
    },
    { id: 'actions', header: () => <div className="text-right">Aksi</div>, cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button onClick={() => handleOpenEditRecipe(row.original)} className="p-2 border-2 border-black rounded hover:bg-gray-100 transition-colors"><Edit2 className="w-4 h-4"/></Button>
          <Button onClick={() => setDeleteRecipeConfirm(row.original.id)} className="p-2 border-2 border-black rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"><Trash2 className="w-4 h-4"/></Button>
        </div>
    ) }
  ], [products, handleOpenEditRecipe]);

  return (
    <div className="p-6 lg:p-10 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h1 className="font-space-grotesk font-black text-4xl uppercase tracking-widest text-black">Bahan Baku & Stok</h1>
            <p className="font-inter font-bold text-gray-500">Kelola inventori bahan untuk memotong stok saat pesanan masuk.</p>
         </div>

         <div className="flex bg-white border-4 border-black p-1 rounded-xl">
            <Button 
              onClick={() => setActiveTab('MATERIALS')}
              className={`px-4 py-2 font-space-grotesk font-black uppercase rounded-lg transition-all ${activeTab === 'MATERIALS' ? 'bg-[#FFD100] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]' : 'text-gray-500 hover:text-black border-2 border-transparent'}`}
            >
              Data Bahan Baku
            </Button>
            <Button 
              onClick={() => setActiveTab('RECIPES')}
              className={`px-4 py-2 font-space-grotesk font-black uppercase rounded-lg transition-all ${activeTab === 'RECIPES' ? 'bg-[#FFD100] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]' : 'text-gray-500 hover:text-black border-2 border-transparent'}`}
            >
              Resep Menu
            </Button>
         </div>
      </div>

      <div className="bg-white border-4 border-black rounded-2xl flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 overflow-hidden">
         <div className="flex flex-col md:flex-row justify-end gap-4 mb-4">
            {activeTab === 'MATERIALS' ? (
              <Button onClick={handleOpenNew} className="gap-2 bg-[#FF90E8] text-black hover:bg-pink-400 border-2 border-black shadow-[2px_2px_0_0_#000]">
                 <Plus className="w-5 h-5"/> TAMBAH BAHAN
              </Button>
            ) : (
              <Button onClick={handleOpenAddRecipe} className="gap-2 bg-[#00E5FF] text-black hover:bg-cyan-300 border-2 border-black shadow-[2px_2px_0_0_#000]">
                 <Plus className="w-5 h-5"/> TAMBAH RESEP
              </Button>
            )}
         </div>

         {activeTab === 'MATERIALS' ? (
           <DataTable columns={materialColumns} data={rawMaterials} searchPlaceholder="Cari bahan baku..." />
         ) : (
           <DataTable columns={recipeColumns} data={recipes || []} searchPlaceholder="Cari resep menu..." />
         )}
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

      <Dialog open={isRecipeModalOpen} onOpenChange={setIsRecipeModalOpen}>
        <DialogContent className="border-8 border-black rounded-[2rem] bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-lg max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle className="font-space-grotesk font-black text-2xl uppercase">
                {editingRecipeId ? 'Edit Resep Menu' : 'Tambah Resep Menu'}
             </DialogTitle>
           </DialogHeader>
           <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                 <Label>Menu Tersedia (Single) *</Label>
                 <Select 
                   value={recipeForm.productId || ""}
                   onValueChange={val => setRecipeForm({...recipeForm, productId: val || ''})}
                   disabled={!!editingRecipeId}
                 >
                   <SelectTrigger className="flex h-10 w-full rounded-md border-2 border-black bg-white px-3 py-2 text-sm focus:outline-none focus:ring-0">
                     <SelectValue placeholder="Pilih Menu" />
                   </SelectTrigger>
                   <SelectContent className="border-4 border-black rounded-xl shadow-[4px_4px_0_0_#000] font-inter font-bold">
                     {products.filter(p => p.type === 'SINGLE').map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>

              <div className="flex flex-col gap-2 border-4 border-black p-4 rounded-xl mt-2 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <Label className="text-lg font-space-grotesk font-black uppercase">Komposisi Bahan (BOM)</Label>
                      <p className="text-xs font-inter font-bold text-gray-500">Stok bahan akan berkurang saat menu ini dipesan.</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                     {recipeForm.ingredients?.map((ing: any, idx: number) => {
                        const rm = rawMaterials.find(r => r.id === ing.rawMaterialId);
                        return (
                          <div key={idx} className="flex gap-2 items-center bg-white p-2 border-2 border-black rounded-lg">
                             <div className="flex-1 flex flex-col font-bold">
                                <span>{rm?.name || 'Unknown'}</span>
                                <span className="text-xs text-gray-500">{rm?.unit || '-'}</span>
                             </div>
                             <Input 
                               type="number"
                               placeholder="Takaran" 
                               value={ing.qty || ''}
                               onChange={(e) => {
                                 const newIngs = [...recipeForm.ingredients];
                                 newIngs[idx].qty = parseFloat(e.target.value) || 0;
                                 setRecipeForm({...recipeForm, ingredients: newIngs});
                               }}
                               className="w-24 text-right"
                             />
                             <Button 
                               onClick={() => {
                                 const newIngs = [...recipeForm.ingredients];
                                 newIngs.splice(idx, 1);
                                 setRecipeForm({...recipeForm, ingredients: newIngs});
                               }}
                               className="text-red-500 hover:text-red-700 p-2"
                             >
                               <Trash2 className="w-5 h-5"/>
                             </Button>
                          </div>
                        )
                     })}
                     {(!recipeForm.ingredients || recipeForm.ingredients.length === 0) && (
                        <div className="text-sm text-center text-gray-500 font-bold py-4">Belum ada bahan baku.</div>
                     )}
                     
                     <Select 
                       value=""
                       onValueChange={(val) => {
                          if (!val) return;
                          
                          const exists = recipeForm.ingredients.find((i:any) => i.rawMaterialId === val);
                          if (!exists) {
                             setRecipeForm({
                               ...recipeForm,
                               ingredients: [...(recipeForm.ingredients || []), { rawMaterialId: val, qty: 1 }]
                             });
                          }
                       }}
                     >
                       <SelectTrigger className="flex h-10 mt-2 w-full rounded-md border-2 border-black bg-white px-3 py-2 text-sm focus:outline-none focus:ring-0 text-black">
                         <SelectValue placeholder="+ Tambah Bahan Baru" />
                       </SelectTrigger>
                       <SelectContent className="border-4 border-black rounded-xl shadow-[4px_4px_0_0_#000] font-inter font-bold text-black">
                         {rawMaterials.map(rm => (
                           <SelectItem key={rm.id} value={rm.id}>{rm.name} ({rm.unit})</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                  </div>
              </div>

              <div className="flex flex-col gap-2">
                 <Label>Instruksi Penyajian (Opsional)</Label>
                 <textarea 
                   value={recipeForm.instructions}
                   onChange={e => setRecipeForm({...recipeForm, instructions: e.target.value})}
                   rows={4}
                   className="flex w-full min-w-0 rounded-xl border-4 border-black bg-white px-4 py-2 text-base transition-all outline-none font-inter font-bold placeholder:font-normal placeholder:text-gray-400 focus-visible:shadow-[4px_4px_0_0_#000]"
                   placeholder="Tuliskan instruksi penyeduhan/pembuatan..."
                 />
              </div>

           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setIsRecipeModalOpen(false)}>BATAL</Button>
             <Button onClick={handleSaveRecipe}>SIMPAN RESEP</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        title="Hapus Bahan Baku?"
        description="Data bahan baku tidak dapat dikembalikan."
        onConfirm={async () => {
          if (deleteConfirmId) {
            const loadToast = toast.loading("Menghapus bahan baku...");
            await new Promise(resolve => setTimeout(resolve, 600));
            deleteRawMaterial(deleteConfirmId);
            toast.success("Bahan baku dihapus", { id: loadToast });
          }
        }}
      />
      
      <ConfirmDialog 
        open={!!deleteRecipeConfirm}
        onOpenChange={(open) => !open && setDeleteRecipeConfirm(null)}
        title="Hapus Resep?"
        description="Menu terkait tidak akan memotong stok bahan lagi."
        onConfirm={async () => {
          if (deleteRecipeConfirm) {
            const loadToast = toast.loading("Menghapus resep...");
            await new Promise(resolve => setTimeout(resolve, 600));
            deleteRecipe(deleteRecipeConfirm);
            toast.success("Resep dihapus", { id: loadToast });
          }
        }}
      />
    </div>
  );
}
