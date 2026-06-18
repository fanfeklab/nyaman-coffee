'use client';

import React, { useState } from 'react';
import { useInventoryStore, Product, Category } from '@/store/useInventoryStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, Search, Coffee, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function ProductsPage() {
  const { products, categories, deleteProduct, deleteCategory, addCategory } = useInventoryStore(); // Assuming deleteCategory isn't there, we'll mock it or add it later. Wait, we'll just mock here for UI.
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'CATEGORIES'>('PRODUCTS');
  const [search, setSearch] = useState('');

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#00E5FF');
  const [deleteProductConfirm, setDeleteProductConfirm] = useState<string | null>(null);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleAddCategory = () => {
    if (!newCatName) return;
    addCategory({
      id: 'cat_' + Math.random().toString(36).substr(2, 6),
      name: newCatName,
      color: newCatColor
    });
    setNewCatName('');
    setIsCategoryModalOpen(false);
    toast.success('Kategori berhasil ditambahkan!');
  };

  const formatRupiah = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

  return (
    <div className="p-6 lg:p-10 flex flex-col gap-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h1 className="font-space-grotesk font-black text-4xl uppercase tracking-widest text-black">Master Produk</h1>
            <p className="font-inter font-bold text-gray-500">Kelola menu dan kategori yang tampil di kasir.</p>
         </div>
         
         <div className="flex bg-white border-4 border-black p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('PRODUCTS')}
              className={`px-6 py-2 font-space-grotesk font-black uppercase rounded-lg transition-all ${activeTab === 'PRODUCTS' ? 'bg-[#FFD100] text-black border-2 border-black' : 'text-gray-500 hover:text-black'}`}
            >
              Menu Produk
            </button>
            <button 
              onClick={() => setActiveTab('CATEGORIES')}
              className={`px-6 py-2 font-space-grotesk font-black uppercase rounded-lg transition-all ${activeTab === 'CATEGORIES' ? 'bg-[#FFD100] text-black border-2 border-black' : 'text-gray-500 hover:text-black'}`}
            >
              Kategori
            </button>
         </div>
      </div>

      <div className="bg-white border-4 border-black rounded-2xl flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 overflow-hidden">
         
         <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="relative w-full md:w-96">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
               <Input 
                 placeholder={activeTab === 'PRODUCTS' ? "Cari menu..." : "Cari kategori..."}
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="pl-10"
               />
            </div>
            {activeTab === 'PRODUCTS' ? (
               <div className="flex gap-2">
                 {/* This would route to new product form later */}
                 <Button onClick={() => toast.info('Akan membuka form produk')} className="gap-2">
                   <Plus className="w-5 h-5"/> TAMBAH MENU
                 </Button>
               </div>
            ) : (
               <Button onClick={() => setIsCategoryModalOpen(true)} className="gap-2 bg-[#00E5FF] text-black hover:bg-cyan-300">
                 <Plus className="w-5 h-5"/> KATEGORI BARU
               </Button>
            )}
         </div>

         <div className="overflow-x-auto border-4 border-black rounded-xl">
            <Table>
               <TableHeader className="bg-gray-100 border-b-4 border-black font-space-grotesk font-black uppercase">
                 {activeTab === 'PRODUCTS' ? (
                   <TableRow>
                     <TableHead className="w-[100px] text-black border-r-2 border-black">Tipe</TableHead>
                     <TableHead className="text-black border-r-2 border-black">Nama Menu</TableHead>
                     <TableHead className="text-black border-r-2 border-black">Kategori</TableHead>
                     <TableHead className="text-black border-r-2 border-black text-right">Harga Dasar</TableHead>
                     <TableHead className="text-right text-black w-[150px]">Aksi</TableHead>
                   </TableRow>
                 ) : (
                   <TableRow>
                     <TableHead className="text-black border-r-2 border-black w-[200px]">Warna</TableHead>
                     <TableHead className="text-black border-r-2 border-black">Nama Kategori</TableHead>
                     <TableHead className="text-right text-black w-[150px]">Aksi</TableHead>
                   </TableRow>
                 )}
               </TableHeader>
               <TableBody className="font-inter font-bold">
                 {activeTab === 'PRODUCTS' && filteredProducts.map(p => {
                    const cat = categories.find(c => c.id === p.categoryId);
                    return (
                      <TableRow key={p.id} className="border-b-2 border-gray-200 hover:bg-gray-50">
                        <TableCell className="border-r-2 border-gray-200">
                          <span className={`px-2 py-1 text-xs border-2 border-black rounded-md ${p.type === 'COMBO' ? 'bg-[#FF90E8]' : 'bg-gray-200'}`}>
                            {p.type}
                          </span>
                        </TableCell>
                        <TableCell className="border-r-2 border-gray-200">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 bg-gray-200 border-2 border-black rounded-md flex items-center justify-center">
                                <Coffee className="w-4 h-4 text-gray-500" />
                             </div>
                             {p.name}
                          </div>
                        </TableCell>
                        <TableCell className="border-r-2 border-gray-200">
                          {cat && (
                            <span className="px-2 py-1 text-xs border-2 border-black rounded-md uppercase" style={{ backgroundColor: cat.color }}>
                              {cat.name}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right border-r-2 border-gray-200 text-[#FF6321]">{formatRupiah(p.basePrice)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <button className="p-2 border-2 border-black rounded hover:bg-gray-100 transition-colors">
                              <Edit2 className="w-4 h-4"/>
                            </button>
                            <button onClick={() => setDeleteProductConfirm(p.id)} className="p-2 border-2 border-black rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                 })}
                 {activeTab === 'CATEGORIES' && filteredCategories.map(c => (
                    <TableRow key={c.id} className="border-b-2 border-gray-200 hover:bg-gray-50">
                      <TableCell className="border-r-2 border-gray-200">
                        <div className="w-6 h-6 border-2 border-black rounded-full" style={{ backgroundColor: c.color }} />
                      </TableCell>
                      <TableCell className="border-r-2 border-gray-200 uppercase">{c.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 border-2 border-black rounded hover:bg-gray-100 transition-colors">
                            <Edit2 className="w-4 h-4"/>
                          </button>
                          <button onClick={() => toast.info('Fitur hapus kategori')} className="p-2 border-2 border-black rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                 ))}
                 
                 {((activeTab === 'PRODUCTS' && filteredProducts.length === 0) || (activeTab === 'CATEGORIES' && filteredCategories.length === 0)) && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-gray-500 font-space-grotesk tracking-widest uppercase">
                        Tidak ada data ditemukan.
                      </TableCell>
                    </TableRow>
                 )}
               </TableBody>
            </Table>
         </div>
      </div>

      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="border-8 border-black rounded-[2rem] bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm">
           <DialogHeader>
             <DialogTitle className="font-space-grotesk font-black text-2xl uppercase">Kategori Baru</DialogTitle>
           </DialogHeader>
           <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                 <Label>Nama Kategori</Label>
                 <Input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Contoh: Snack" />
              </div>
              <div className="flex flex-col gap-2">
                 <Label>Warna Kategori (Hex)</Label>
                 <div className="flex gap-2">
                    <Input type="color" value={newCatColor} onChange={e => setNewCatColor(e.target.value)} className="w-16 h-12 p-1" />
                    <Input value={newCatColor} onChange={e => setNewCatColor(e.target.value)} className="flex-1 uppercase font-mono" />
                 </div>
              </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>BATAL</Button>
             <Button onClick={handleAddCategory}>SIMPAN</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <ConfirmDialog 
        open={!!deleteProductConfirm}
        onOpenChange={(open) => !open && setDeleteProductConfirm(null)}
        title="Hapus Menu?"
        description="Menu yang dihapus tidak akan tampil lagi di kasir."
        onConfirm={() => {
          if (deleteProductConfirm) {
            deleteProduct(deleteProductConfirm);
            toast.success("Menu berhasil dihapus");
          }
        }}
      />
    </div>
  );
}
