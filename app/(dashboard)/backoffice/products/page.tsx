'use client';

import React, { useState, useEffect } from 'react';
import { useInventoryStore, Product, Category } from '@/store/useInventoryStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, Search, Coffee, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function ProductsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'MANAGER') {
       router.replace('/pos');
       toast.error('Akses ditolak: Anda tidak memiliki izin ke halaman ini');
    }
  }, [user, router]);

  const { products, categories, rawMaterials, deleteProduct, deleteCategory, addCategory, addProduct, updateProduct, updateCategory } = useInventoryStore();
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'CATEGORIES'>('PRODUCTS');
  const [search, setSearch] = useState('');

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#00E5FF');
  const [deleteProductConfirm, setDeleteProductConfirm] = useState<string | null>(null);
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<string | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    categoryId: '',
    basePrice: 0,
    type: 'SINGLE',
    recipe: ''
  });
  const [moneyText, setMoneyText] = useState('');

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({ name: '', categoryId: categories[0]?.id || '', basePrice: 0, type: 'SINGLE', recipe: ''});
    setMoneyText('');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setProductForm({ name: p.name, categoryId: p.categoryId, basePrice: p.basePrice, type: p.type, recipe: p.recipe || ''});
    setMoneyText(p.basePrice?.toString() || '0');
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.categoryId || !moneyText) {
      return toast.error('Harap lengkapi data wajib (Nama, Kategori, Harga)!');
    }
    
    const finalPrice = parseInt(moneyText) || 0;
    
    if (editingProductId) {
       updateProduct(editingProductId, { ...productForm, basePrice: finalPrice });
       toast.success('Menu diubah!');
    } else {
       addProduct({
          id: 'p' + Math.random().toString(36).substring(2,6),
          name: productForm.name,
          categoryId: productForm.categoryId,
          basePrice: finalPrice,
          type: productForm.type as 'SINGLE' | 'COMBO',
          recipe: productForm.recipe
       });
       toast.success('Menu ditambahkan!');
    }
    setIsProductModalOpen(false);
  };

  const handleOpenAddCategory = () => {
    setEditingCategoryId(null);
    setNewCatName('');
    setNewCatColor('#00E5FF');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (c: Category) => {
    setEditingCategoryId(c.id);
    setNewCatName(c.name);
    setNewCatColor(c.color);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = () => {
    if (!newCatName) return;
    if (editingCategoryId) {
      updateCategory(editingCategoryId, { name: newCatName, color: newCatColor });
      toast.success('Kategori berhasil diubah!');
    } else {
      addCategory({
        id: 'cat_' + Math.random().toString(36).substr(2, 6),
        name: newCatName,
        color: newCatColor
      });
      toast.success('Kategori berhasil ditambahkan!');
    }
    setIsCategoryModalOpen(false);
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
                 <Button onClick={handleOpenAddProduct} className="gap-2">
                   <Plus className="w-5 h-5"/> TAMBAH MENU
                 </Button>
               </div>
            ) : (
               <Button onClick={handleOpenAddCategory} className="gap-2 bg-[#00E5FF] text-black hover:bg-cyan-300">
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
                            <button onClick={() => handleOpenEditProduct(p)} className="p-2 border-2 border-black rounded hover:bg-gray-100 transition-colors">
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
                          <button onClick={() => handleOpenEditCategory(c)} className="p-2 border-2 border-black rounded hover:bg-gray-100 transition-colors">
                            <Edit2 className="w-4 h-4"/>
                          </button>
                          <button onClick={() => setDeleteCategoryConfirm(c.id)} className="p-2 border-2 border-black rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
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

      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="border-8 border-black rounded-[2rem] bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle className="font-space-grotesk font-black text-2xl uppercase">
               {editingProductId ? 'Edit Menu' : 'Tambah Menu Baru'}
             </DialogTitle>
           </DialogHeader>
           <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                 <Label>Nama Menu *</Label>
                 <Input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="Contoh: Kopi Susu Aren" />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                 <div className="flex flex-col gap-2 flex-1">
                    <Label>Kategori *</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border-2 border-black bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                      value={productForm.categoryId}
                      onChange={e => setProductForm({...productForm, categoryId: e.target.value})}
                    >
                      <option value="" disabled>Pilih Kategori</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 </div>
                 <div className="flex flex-col gap-2 flex-1">
                    <Label>Tipe / Jenis</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border-2 border-black bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                      value={productForm.type}
                      onChange={e => setProductForm({...productForm, type: e.target.value as 'SINGLE' | 'COMBO'})}
                    >
                      <option value="SINGLE">Single (Menu Satuan)</option>
                      <option value="COMBO">Combo (Paket)</option>
                    </select>
                 </div>
              </div>

              <div className="flex flex-col gap-2">
                 <Label>Harga Dasar (Rp) *</Label>
                 <Input 
                   type="text"
                   value={moneyText ? new Intl.NumberFormat('id-ID').format(parseInt(moneyText)) : ''}
                   onChange={e => setMoneyText(e.target.value.replace(/\D/g, ''))}
                   placeholder="Contoh: 15.000" 
                 />
              </div>

              {productForm.type === 'SINGLE' && (
                <div className="flex flex-col gap-2 border-4 border-black p-4 rounded-xl mt-2 bg-gray-50">
                  <Label className="text-lg font-space-grotesk font-black uppercase">Resep Bahan Baku (BOM)</Label>
                  <p className="text-xs font-inter font-bold text-gray-500 mb-2">Bahan baku yang akan dipotong otomatis saat menu dipesan.</p>
                  
                  {productForm.ingredients && productForm.ingredients.length > 0 ? (
                    <div className="flex flex-col gap-2 mb-4">
                      {productForm.ingredients.map((ing, idx) => {
                        const rm = rawMaterials.find(r => r.id === ing.rawMaterialId);
                        return (
                          <div key={idx} className="flex justify-between items-center bg-white border-2 border-black p-2 rounded-lg">
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">{rm?.name || 'Unknown'}</span>
                              <span className="text-xs text-gray-500">Satuan: {rm?.unit}</span>
                            </div>
                            <div className="flex gap-2 items-center">
                              <Input 
                                type="number" 
                                value={ing.amount}
                                onChange={(e) => {
                                  const newIngs = [...(productForm.ingredients || [])];
                                  newIngs[idx].amount = parseFloat(e.target.value) || 0;
                                  setProductForm({...productForm, ingredients: newIngs});
                                }}
                                className="w-20 text-right h-8"
                              />
                              <button 
                                onClick={() => {
                                  const newIngs = [...(productForm.ingredients || [])];
                                  newIngs.splice(idx, 1);
                                  setProductForm({...productForm, ingredients: newIngs});
                                }}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-4 h-4"/>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-sm font-bold text-gray-400 italic mb-4">Pilih bahan baku di bawah untuk menambahkan.</div>
                  )}

                  <div className="flex gap-2">
                    <select 
                      className="flex-grow h-10 rounded-md border-2 border-black bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                      onChange={(e) => {
                         const val = e.target.value;
                         if (!val) return;
                         // Add with default amount 1
                         const exists = productForm.ingredients?.find(i => i.rawMaterialId === val);
                         if (!exists) {
                            setProductForm({
                              ...productForm, 
                              ingredients: [...(productForm.ingredients || []), { rawMaterialId: val, amount: 1 }]
                            });
                         }
                         e.target.value = "";
                      }}
                       defaultValue=""
                    >
                       <option value="" disabled>+ Tambah Bahan Baru</option>
                       {rawMaterials.map(rm => (
                         <option key={rm.id} value={rm.id}>{rm.name} ({rm.unit})</option>
                       ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                 <Label>Instruksi Penyajian (Opsional)</Label>
                 <textarea 
                   value={productForm.recipe}
                   onChange={e => setProductForm({...productForm, recipe: e.target.value})}
                   rows={5}
                   className="flex w-full rounded-md border-2 border-black bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                   placeholder="Tuliskan resep, instruksi, takaran gramasi untuk barista / dapur disini..."
                 />
                 <small className="font-inter font-bold text-gray-500">Akan dicetak di struk dapur jika diperlukan.</small>
              </div>

           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setIsProductModalOpen(false)}>BATAL</Button>
             <Button onClick={handleSaveProduct}>SIMPAN MENU</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="border-8 border-black rounded-[2rem] bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm">
           <DialogHeader>
             <DialogTitle className="font-space-grotesk font-black text-2xl uppercase">
               {editingCategoryId ? 'Edit Kategori' : 'Kategori Baru'}
             </DialogTitle>
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
             <Button onClick={handleSaveCategory}>SIMPAN</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <ConfirmDialog 
        open={!!deleteCategoryConfirm}
        onOpenChange={(open) => !open && setDeleteCategoryConfirm(null)}
        title="Hapus Kategori?"
        description="Semua menu di kategori ini dapat kehilangan referensi kategori."
        onConfirm={() => {
          if (deleteCategoryConfirm) {
            deleteCategory(deleteCategoryConfirm);
            toast.success("Kategori berhasil dihapus");
          }
        }}
      />
      
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
