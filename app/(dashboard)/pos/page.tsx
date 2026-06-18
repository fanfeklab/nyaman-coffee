'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInventoryStore, Category, Product } from '@/store/useInventoryStore';
import { useCartStore } from '@/store/useCartStore';
import { useShiftStore } from '@/store/useShiftStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Plus, Minus, Trash2, ShoppingCart, Coffee, BookOpen, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formatRupiah = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

export default function POSPage() {
  const router = useRouter();
  const { categories, products } = useInventoryStore();
  const { currentShift, addSalesToShift } = useShiftStore();
  const { user } = useAuthStore();
  const { addTransaction } = useTransactionStore();
  const { processCheckoutInventory } = useInventoryStore();
  const { items, addItem, removeItem, updateQty, clearCart, getTotal } = useCartStore();
  
  // Protect POS access
  useEffect(() => {
    if (!currentShift || currentShift.status !== 'OPEN') {
      toast.error('AKSES DITOLAK', { description: 'Anda harus membuka shift terlebih dahulu.' });
      router.push('/shift');
    }
  }, [currentShift, router]);
  
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment UI state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'TUNAI' | 'QRIS' | null>(null);
  const [cashGiven, setCashGiven] = useState<string>('');
  const [qrisRef, setQrisRef] = useState('');

  // Receipt UI state
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [recipeItem, setRecipeItem] = useState<Product | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const filteredProducts = products.filter(p => {
    const matchesCat = activeCategory === 'all' || p.categoryId === activeCategory || searchQuery.length > 0;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const total = getTotal();
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const handleCheckoutClick = () => {
    if (!currentShift || currentShift.status !== 'OPEN') {
      toast.error('SHIFF BELUM DIBUKA!', { description: 'Silahkan buka shift terlebih dahulu di menu Manajemen Shift.' });
      return;
    }
    if (items.length === 0) return;
    setIsPaymentOpen(true);
    setPaymentMethod(null);
    setCashGiven('');
    setQrisRef('');
  };

  const handleProcessPayment = () => {
    if (paymentMethod === 'TUNAI') {
      const given = parseInt(cashGiven.replace(/\D/g, ''));
      if (isNaN(given) || given < total) {
        toast.error('PEMBAYARAN KURANG!');
        return;
      }
    }
    if (paymentMethod === 'QRIS' && !qrisRef) {
      toast.error('MOHON ISI NOMOR REFERENSI QRIS!');
      return;
    }

    // Process Inventory
    const invRes = processCheckoutInventory(items.map(i => ({ productId: i.product.id, qty: i.qty })));
    if (!invRes.success) {
      toast.error(invRes.reason || 'Gagal potong stok');
      return;
    }

    // Add transaction to history
    addTransaction({
      id: 'TXN' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      shiftId: currentShift?.id || 'unknown',
      cashierId: user?.id || 'unknown',
      items: [...items],
      total,
      paymentMethod,
      cashGiven: paymentMethod === 'TUNAI' ? parseInt(cashGiven.replace(/\D/g, '')) : undefined,
      timestamp: new Date(),
      status: 'COMPLETED'
    });

    // Success
    addSalesToShift(total);
    setIsPaymentOpen(false);
    setIsReceiptOpen(true);
  };

  const finishTransaction = () => {
    clearCart();
    setIsReceiptOpen(false);
    setRecipeItem(null);
    toast.success('Transaksi Selesai & Keranjang Direset');
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">
       {/* Left: Products Area */}
       <div className="flex-1 flex flex-col p-4 md:p-6 bg-[#FFFDF7] h-full overflow-hidden">
          
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 shrink-0">
             <div className="relative flex-grow">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
               <Input 
                 placeholder="Cari Menu..." 
                 className="pl-10 text-lg bg-white"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
          </div>

          {/* Categories */}
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2 shrink-0 hide-scrollbar">
             <button 
               onClick={() => setActiveCategory('all')}
               className={cn(
                 "whitespace-nowrap px-6 py-3 border-4 border-black rounded-xl font-space-grotesk font-black uppercase text-sm active:translate-y-1 transition-all",
                 activeCategory === 'all' ? "bg-black text-white shadow-none translate-y-1" : "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1"
               )}
             >
               Semua
             </button>
             {categories.map(c => (
               <button 
                 key={c.id}
                 onClick={() => setActiveCategory(c.id)}
                 style={{ backgroundColor: activeCategory === c.id ? c.color : 'white' }}
                 className={cn(
                   "whitespace-nowrap px-6 py-3 border-4 border-black rounded-xl font-space-grotesk font-black uppercase text-sm transition-all",
                   activeCategory === c.id ? "text-black shadow-none translate-y-1" : "text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1 active:translate-y-1"
                 )}
               >
                 {c.name}
               </button>
             ))}
          </div>

          {/* Grid Products */}
          <div className="flex-1 overflow-y-auto pr-2 pb-24 lg:pb-4">
             <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map(p => {
                  const cat = categories.find(c => c.id === p.categoryId);
                  return (
                    <div 
                      key={p.id}
                      onClick={() => addItem(p)}
                      className="bg-white border-4 border-black rounded-2xl p-4 flex flex-col cursor-pointer shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-2 active:translate-x-2 transition-all select-none group"
                    >
                       <div className="w-full aspect-square bg-gray-100 border-4 border-black rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                          {p.image ? (
                             <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          ) : (
                             <Coffee className="w-12 h-12 text-gray-300" />
                          )}
                       </div>
                       <span className="font-space-grotesk font-black uppercase text-black line-clamp-1 flex-grow mb-1">{p.name}</span>
                       <span className="font-inter font-black text-[#FF6321]">{formatRupiah(p.basePrice)}</span>
                       {cat && (
                         <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 border-2 border-black rounded-md w-max mt-2" style={{ backgroundColor: cat.color }}>
                            {cat.name}
                         </span>
                       )}
                    </div>
                  )
                })}
             </div>
          </div>
       </div>

       {/* Mobile Cart Floating Button */}
       <div className="lg:hidden fixed bottom-0 left-0 w-full p-4 bg-white border-t-4 border-black z-20 flex justify-between items-center shadow-[0px_-4px_0px_0px_rgba(0,0,0,1)]">
         <div className="flex flex-col">
            <span className="font-space-grotesk font-black text-sm uppercase text-gray-500">{items.reduce((a,b) => a+b.qty, 0)} Items</span>
            <span className="font-inter font-black text-xl text-black">{formatRupiah(total)}</span>
         </div>
         <Button onClick={() => setIsMobileCartOpen(true)} className="bg-[#FFD100] text-black border-2 border-black hover:bg-yellow-400 font-space-grotesk font-black uppercase hover:translate-y-1 transition-all h-12 px-6">Lihat Pesanan</Button>
       </div>

       {/* Right: Cart Area */}
       <div className={cn(
           "w-full lg:w-96 bg-white border-black flex flex-col z-50 lg:z-10",
           "lg:border-l-8 lg:relative lg:flex h-full",
           isMobileCartOpen ? "fixed inset-0 border-0" : "hidden lg:flex"
       )}>
          {isMobileCartOpen && (
             <div className="p-4 border-b-4 border-black bg-white flex justify-between items-center shrink-0 lg:hidden">
                 <button onClick={() => setIsMobileCartOpen(false)} className="font-space-grotesk font-black uppercase text-xl">← KEMBALI</button>
             </div>
          )}
          {/* Cart Header */}
          <div className="p-4 border-b-4 border-black bg-[#FFD100] flex justify-between items-center shrink-0">
             <div className="flex items-center gap-2">
               <ShoppingCart className="w-5 h-5 text-black" strokeWidth={2.5}/>
               <h2 className="font-space-grotesk font-black uppercase tracking-wider text-xl text-black">Pesanan</h2>
             </div>
             <button 
               onClick={() => setClearConfirmOpen(true)}
               className="p-2 border-2 border-black rounded-lg hover:bg-white transition-colors"
               disabled={items.length === 0}
             >
               <Trash2 className="w-4 h-4 text-black" />
             </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 relative">
             {items.length === 0 ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-50 p-4">
                 <ShoppingCart className="w-12 h-12 mb-2" strokeWidth={1} />
                 <p className="font-space-grotesk font-black uppercase tracking-widest">Belum ada pesanan</p>
               </div>
             ) : (
               items.map(item => (
                 <div key={item.id} className="border-4 border-black rounded-xl p-3 flex flex-col gap-2 relative group bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex justify-between items-start">
                       <span className="font-inter font-black text-sm uppercase pr-6">{item.product.name}</span>
                       <span className="font-inter font-black text-[#FF6321] text-sm">{formatRupiah(item.product.basePrice * item.qty)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-3 bg-gray-100 border-2 border-black rounded-lg px-2">
                         <button onClick={() => updateQty(item.id, item.qty - 1)} className="p-1 hover:bg-white rounded transition-colors active:scale-95"><Minus className="w-4 h-4"/></button>
                         <span className="font-black w-4 text-center">{item.qty}</span>
                         <button onClick={() => updateQty(item.id, item.qty + 1)} className="p-1 hover:bg-white rounded transition-colors active:scale-95"><Plus className="w-4 h-4"/></button>
                      </div>
                    </div>
                 </div>
               ))
             )}
          </div>

          {/* Cart Footer / Checkout */}
          <div className="border-t-8 border-black p-4 bg-white shrink-0 flex flex-col gap-3">
             <div className="flex justify-between items-center font-inter font-black text-sm text-gray-500 uppercase">
                <span>Subtotal</span>
                <span>{formatRupiah(total)}</span>
             </div>
             <div className="flex justify-between items-center font-space-grotesk font-black text-2xl uppercase">
                <span>Total</span>
                <span>{formatRupiah(total)}</span>
             </div>
             <Button 
               disabled={items.length === 0}
               onClick={handleCheckoutClick}
               size="lg" 
               className="w-full text-lg h-14 mt-2"
             >
                BAYAR
             </Button>
          </div>
       </div>

       {/* ================= PAYMENT MODAL ================= */}
       <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
         <DialogContent className="border-8 border-black rounded-[2rem] max-w-2xl bg-[#FFFDF7] p-0 overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="p-6 bg-[#00A19D] border-b-8 border-black">
               <h2 className="font-space-grotesk font-black text-3xl uppercase text-black text-center">Pilih Metode Bayar</h2>
            </div>
            
            <div className="p-6 flex flex-col md:flex-row gap-6">
               <div className="w-full md:w-1/3 flex flex-col gap-3">
                 <Button 
                   variant={paymentMethod === 'TUNAI' ? 'default' : 'outline'} 
                   className={cn("h-16 justify-center px-4 text-lg font-space-grotesk font-black uppercase tracking-widest", paymentMethod === 'TUNAI' && "bg-[#FF6321] text-black shadow-none translate-y-1")}
                   onClick={() => setPaymentMethod('TUNAI')}
                 >
                   TUNAI
                 </Button>
                 <Button 
                   variant={paymentMethod === 'QRIS' ? 'default' : 'outline'} 
                   className={cn("h-16 justify-center px-4 text-lg font-space-grotesk font-black uppercase tracking-widest", paymentMethod === 'QRIS' && "bg-[#00E5FF] text-black shadow-none translate-y-1")}
                   onClick={() => setPaymentMethod('QRIS')}
                 >
                   QRIS
                 </Button>
               </div>

               <div className="w-full md:w-2/3 border-4 border-black rounded-2xl bg-white p-6 relative">
                  <div className="flex justify-between mb-6 pb-4 border-b-4 border-black border-dashed">
                     <span className="font-space-grotesk font-black uppercase text-xl">Tagihan</span>
                     <span className="font-space-grotesk font-black uppercase text-2xl">{formatRupiah(total)}</span>
                  </div>

                  {paymentMethod === 'TUNAI' && (
                    <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
                       <Label className="text-lg">Diterima Tunai</Label>
                       <Input 
                         type="text"
                         value={cashGiven ? new Intl.NumberFormat('id-ID').format(parseInt(cashGiven)) : ''}
                         onChange={(e) => setCashGiven(e.target.value.replace(/\D/g, ''))}
                         className="text-2xl h-14 font-black"
                         placeholder="0"
                         autoFocus
                       />
                       
                       {/* Shortcut Buttons */}
                       <div className="grid grid-cols-3 gap-2">
                          <Button variant="outline" onClick={() => setCashGiven(total.toString())}>Uang Pas</Button>
                          <Button variant="outline" onClick={() => setCashGiven('50000')}>50rb</Button>
                          <Button variant="outline" onClick={() => setCashGiven('100000')}>100rb</Button>
                       </div>

                       {!!cashGiven && parseInt(cashGiven) >= total && (
                          <div className="bg-[#00A19D] border-4 border-black rounded-xl p-4 mt-2 flex justify-between items-center text-black">
                            <span className="font-space-grotesk font-black uppercase text-sm">Kembalian</span>
                            <span className="font-space-grotesk font-black uppercase text-3xl">{formatRupiah(parseInt(cashGiven) - total)}</span>
                          </div>
                       )}
                    </div>
                  )}

                  {paymentMethod === 'QRIS' && (
                    <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
                       <Label className="text-lg">No Referensi Transaksi</Label>
                       <Input 
                         value={qrisRef}
                         onChange={(e) => setQrisRef(e.target.value)}
                         className="text-xl h-14 uppercase"
                         placeholder="INPUT REF ID"
                         autoFocus
                       />
                       <p className="font-inter font-bold text-sm text-gray-500">Pastikan pembeli melihatkan layar sukses pada HP-nya dan masukkan 4-6 digit terakhir referensi.</p>
                    </div>
                  )}

                  {!paymentMethod && (
                    <div className="h-full flex items-center justify-center opacity-30 font-space-grotesk font-black uppercase tracking-widest text-center">
                       Pilih metode di samping.
                    </div>
                  )}
               </div>
            </div>

            <div className="p-6 border-t-8 border-black bg-gray-100 flex justify-end gap-4">
               <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>BATAL</Button>
               <Button onClick={handleProcessPayment} disabled={!paymentMethod} className="px-8 text-lg">PROSES TRANSAKSI</Button>
            </div>
         </DialogContent>
       </Dialog>

       {/* ================= RECEIPT MODAL ================= */}
       <Dialog open={isReceiptOpen} onOpenChange={() => {}}>
         <DialogContent className="border-8 border-black rounded-[2rem] max-w-md bg-[#FFFDF7] p-0 overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] print-area">
            <div className="p-8 pb-4 flex flex-col items-center border-b-8 border-black bg-white">
               <div className="w-16 h-16 bg-[#00A19D] border-4 border-black rounded-full flex items-center justify-center mb-4 shadow-[4px_4px_0_0_#000]">
                 <CheckSquare className="w-8 h-8 text-black" strokeWidth={3} />
               </div>
               <h2 className="font-space-grotesk font-black text-3xl uppercase text-black text-center mb-1">Transaksi<br/>Selesai!</h2>
               <p className="font-inter font-bold text-gray-500 text-sm">Kembalian: {paymentMethod === 'TUNAI' ? formatRupiah(parseInt(cashGiven) - total) : 'Rp 0'}</p>
            </div>
            
            <div className="p-6 flex flex-col gap-4 bg-gray-100">
               {/* Recipe button wrapper for specific items */}
               {items.some(i => i.product.recipe) && (
                  <div className="flex flex-col gap-2 mb-2 p-4 bg-[#FF90E8] border-4 border-black rounded-xl">
                      <span className="font-space-grotesk font-black uppercase text-sm flex items-center gap-2"><BookOpen className="w-4 h-4" /> Bantuan Barista</span>
                      <div className="flex flex-wrap gap-2">
                        {items.filter(i => i.product.recipe).map(i => (
                           <button 
                             key={i.id}
                             className="bg-white border-2 border-black rounded-lg px-3 py-1 font-inter font-black text-xs hover:bg-black hover:text-white transition-colors"
                             onClick={() => setRecipeItem(i.product)}
                           >
                              Resep: {i.product.name}
                           </button>
                        ))}
                      </div>
                  </div>
               )}

               <div className="hidden print:block mb-4 border-t-2 border-black border-dashed pt-4 w-full">
                 <h3 className="font-space-grotesk font-black uppercase text-center text-lg mb-2">NYAMAN COFFEE</h3>
                 <div className="flex flex-col gap-1 w-full text-xs font-mono">
                    {items.map(i => (
                       <div key={i.id} className="flex justify-between w-full">
                         <span>{i.qty}x {i.product.name}</span>
                         <span>{formatRupiah(i.qty * i.product.basePrice)}</span>
                       </div>
                    ))}
                    <div className="border-t-2 border-black border-dashed mt-2 pt-2 flex justify-between">
                       <span>TOTAL</span>
                       <span>{formatRupiah(total)}</span>
                    </div>
                    {paymentMethod === 'TUNAI' && (
                      <div className="flex justify-between mt-1">
                         <span>TUNAI</span>
                         <span>{formatRupiah(parseInt(cashGiven))}</span>
                      </div>
                    )}
                 </div>
               </div>

               <Button className="w-full text-lg bg-[#FFD100] text-black hover:bg-yellow-400" variant="secondary" onClick={() => {toast.success('Mencetak struk order untuk dapur...'); setTimeout(()=> {window.print()}, 300);}}>CETAK STRUK DAPUR</Button>
               <Button className="w-full text-lg bg-[#00E5FF] text-black hover:bg-cyan-400" variant="secondary" onClick={() => {toast.success('Mencetak nota...'); setTimeout(()=> {window.print()}, 300);}}>CETAK NOTA</Button>
               <Button className="w-full text-lg" onClick={finishTransaction}>TUTUP & SELESAI</Button>
            </div>
         </DialogContent>
       </Dialog>

       {/* ================= RECIPE HELP MODAL ================= */}
       <Dialog open={!!recipeItem} onOpenChange={(open) => !open && setRecipeItem(null)}>
         <DialogContent className="border-8 border-black rounded-[2rem] bg-[#FFD100] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <DialogHeader>
               <DialogTitle className="font-space-grotesk font-black text-2xl uppercase">Resep: {recipeItem?.name}</DialogTitle>
            </DialogHeader>
            <div className="bg-white border-4 border-black p-4 rounded-xl mt-4 font-inter font-bold whitespace-pre-wrap">
               {recipeItem?.recipe || "Tidak ada resep"}
            </div>
            <Button className="mt-4" onClick={() => setRecipeItem(null)}>MENGERTI</Button>
         </DialogContent>
       </Dialog>

       <ConfirmDialog 
         open={clearConfirmOpen} 
         onOpenChange={setClearConfirmOpen}
         title="Kosongkan Keranjang?"
         description="Semua pesanan yang belum dibayar akan dihapus."
         onConfirm={clearCart}
       />
    </div>
  );
}
