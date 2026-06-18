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
import { Search, Plus, Minus, Trash2, ShoppingCart, Coffee, BookOpen, CheckSquare, Save, FolderOpen, Tag, Edit, Percent } from 'lucide-react';
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
  const { 
    items, addItem, removeItem, updateQty, clearCart, 
    getTotal, getSubtotal, getDiscountAmount, getTaxAmount, getServiceChargeAmount,
    discountType, discountValue, taxRate, serviceChargeRate,
    setDiscount, saveBill, loadBill, savedBills, deleteSavedBill
  } = useCartStore();
  
  // Custom item form state
  const [customItemOpen, setCustomItemOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  
  // Save/Load bill form state
  const [saveBillOpen, setSaveBillOpen] = useState(false);
  const [loadBillOpen, setLoadBillOpen] = useState(false);
  const [billName, setBillName] = useState('');

  // Discount form state
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [discountTypeForm, setDiscountTypeForm] = useState<'PERCENTAGE'|'NOMINAL'|null>(null);
  const [discountValueForm, setDiscountValueForm] = useState('');
  
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
  const [confirmPaymentOpen, setConfirmPaymentOpen] = useState(false);

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

  const handleOpenPaymentConfirm = () => {
    if (paymentMethod === 'TUNAI') {
      const given = parseInt(cashGiven.replace(/\D/g, ''));
      if (isNaN(given) || given < total) {
        toast.error('UANG KURANG!', { description: 'Pembayaran tunai tidak mencukupi tagihan.', duration: 3000 });
        return;
      }
    }
    if (paymentMethod === 'QRIS' && !qrisRef) {
      toast.error('REF ID KOSONG!', { description: 'Mohon masukkan nomor referensi QRIS pelanggan.', duration: 3000 });
      return;
    }
    setConfirmPaymentOpen(true);
  };

  const handleProcessPayment = () => {
    // Process Inventory
    const invRes = processCheckoutInventory(items.map(i => ({ productId: i.product.id, qty: i.qty })));
    if (!invRes.success) {
      toast.error('GAGAL POTONG STOK!', { description: invRes.reason });
      setConfirmPaymentOpen(false);
      return;
    }

    // Add transaction to history
    // eslint-disable-next-line react-hooks/purity
    const txId = 'TXN' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2,6).toUpperCase();
    
    addTransaction({
      id: txId,
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
    setConfirmPaymentOpen(false);
    setIsPaymentOpen(false);
    setIsReceiptOpen(true);
    toast.success('TRANSAKSI BERHASIL', { description: 'Pembayaran telah diterima dan dicatat.', duration: 3000 });
  };

  const finishTransaction = () => {
    clearCart();
    setIsReceiptOpen(false);
    setRecipeItem(null);
    toast.success('Transaksi Selesai & Keranjang Direset');
  };

  const handleAddCustomItem = () => {
    if (!customName || !customPrice) {
      toast.error('Gagal', { description: 'Nama dan Harga harus diisi' });
      return;
    }
    const product: Product = {
      id: 'custom_' + Date.now(),
      name: customName,
      basePrice: parseInt(customPrice.replace(/\D/g, '')) || 0,
      categoryId: 'custom',
      type: 'SINGLE'
    };
    addItem(product);
    setCustomItemOpen(false);
    setCustomName('');
    setCustomPrice('');
    toast.success('Custom Item Ditambahkan');
  };

  const handleSaveBill = () => {
    if (!billName) {
      toast.error('Gagal', { description: 'Nama meja / pemesan harus diisi' });
      return;
    }
    saveBill(billName);
    setSaveBillOpen(false);
    setBillName('');
    toast.success('Tagihan Disimpan');
  };

  const handleApplyDiscount = () => {
    setDiscount(discountTypeForm, parseFloat(discountValueForm) || 0);
    setIsDiscountOpen(false);
    toast.success('Diskon Diterapkan');
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFDF7] overflow-hidden">
       {/* Top: Cart Area (Split View) */}
       {items.length > 0 && (
         <div className="h-[45vh] lg:h-[40vh] border-b-8 border-black flex flex-col bg-white shrink-0 shadow-[0px_8px_0px_0px_rgba(0,0,0,1)] z-10 relative">
            {/* Cart Header */}
            <div className="p-3 md:p-4 border-b-4 border-black bg-[#FFD100] flex justify-between items-center shrink-0">
               <div className="flex items-center gap-2">
                 <ShoppingCart className="w-5 h-5 text-black" strokeWidth={2.5}/>
                 <h2 className="font-space-grotesk font-black uppercase tracking-wider text-lg md:text-xl text-black">Pesanan: {items.reduce((a,b) => a+b.qty, 0)} Items</h2>
               </div>
               
               <div className="flex items-center gap-2">
                 <button 
                   onClick={() => setLoadBillOpen(true)}
                   title="Buka Tagihan Tersimpan"
                   className="p-2 border-2 border-black rounded-lg hover:bg-white transition-colors bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 relative"
                 >
                   <FolderOpen className="w-4 h-4 text-black" />
                   {savedBills.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full border-2 border-black">{savedBills.length}</span>}
                 </button>
                 <button 
                   onClick={() => setSaveBillOpen(true)}
                   title="Simpan Tagihan (Open Tab)"
                   className="p-2 border-2 border-black rounded-lg hover:bg-white transition-colors bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1"
                   disabled={items.length === 0}
                 >
                   <Save className="w-4 h-4 text-black" />
                 </button>
                 <button 
                   onClick={() => setClearConfirmOpen(true)}
                   title="Kosongkan Keranjang"
                   className="p-2 border-2 border-black rounded-lg hover:bg-white transition-colors bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1"
                 >
                   <Trash2 className="w-4 h-4 text-black" />
                 </button>
               </div>
            </div>

            {/* Cart Content (Split layout for Items and Footer) */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
               {/* Cart Items List */}
               <div className="flex-1 overflow-y-auto p-4 flex flex-col md:flex-row md:flex-wrap gap-3 md:content-start border-b-4 md:border-b-0 md:border-r-4 border-black relative">
                  {items.map(item => (
                    <div key={item.id} className="w-full md:w-[calc(50%-0.375rem)] xl:w-[calc(33.333%-0.5rem)] border-4 border-black rounded-xl p-3 flex flex-col gap-2 relative group bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                       <div className="flex justify-between items-start">
                          <span className="font-inter font-black text-sm uppercase pr-2 line-clamp-2">{item.product.name}</span>
                       </div>
                       
                       <div className="flex items-center justify-between mt-auto pt-2">
                         <span className="font-inter font-black text-[#FF6321] text-sm">{formatRupiah(item.product.basePrice * item.qty)}</span>
                         <div className="flex items-center gap-3 bg-gray-100 border-2 border-black rounded-lg px-2">
                            <button onClick={() => updateQty(item.id, item.qty - 1)} className="p-1 hover:bg-white rounded transition-colors active:scale-95"><Minus className="w-4 h-4"/></button>
                            <span className="font-black w-4 text-center">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, item.qty + 1)} className="p-1 hover:bg-white rounded transition-colors active:scale-95"><Plus className="w-4 h-4"/></button>
                         </div>
                       </div>
                    </div>
                  ))}
               </div>

               {/* Cart Footer / Checkout Sticky Panel */}
               <div className="w-full md:w-72 xl:w-80 p-4 bg-gray-50 flex flex-col justify-end gap-3 shrink-0 overflow-y-auto hide-scrollbar">
                 <div className="flex flex-col gap-1 text-xs font-inter font-bold text-gray-500 uppercase">
                   <div className="flex justify-between items-center">
                      <span>Subtotal</span>
                      <span>{formatRupiah(getSubtotal())}</span>
                   </div>
                   {(discountType || discountValue > 0) && (
                     <div className="flex justify-between items-center text-[#FF6321]">
                        <span className="flex items-center gap-1 cursor-pointer hover:text-red-500 transition-colors" onClick={() => setIsDiscountOpen(true)}>
                          Diskon {discountType === 'PERCENTAGE' && `(${discountValue}%)`} <Edit className="w-3 h-3"/>
                        </span>
                        <span>-{formatRupiah(getDiscountAmount())}</span>
                     </div>
                   )}
                   {!discountType && (
                     <div className="flex justify-between items-center text-gray-400">
                        <span className="flex items-center gap-1 cursor-pointer hover:text-black transition-colors" onClick={() => setIsDiscountOpen(true)}>
                          Tambah Diskon <Tag className="w-3 h-3"/>
                        </span>
                     </div>
                   )}
                   {getServiceChargeAmount() > 0 && (
                     <div className="flex justify-between items-center">
                        <span>Service ({serviceChargeRate}%)</span>
                        <span>{formatRupiah(getServiceChargeAmount())}</span>
                     </div>
                   )}
                   {getTaxAmount() > 0 && (
                     <div className="flex justify-between items-center">
                        <span>Pajak ({taxRate}%)</span>
                        <span>{formatRupiah(getTaxAmount())}</span>
                     </div>
                   )}
                 </div>
                 
                 <div className="border-t-2 border-dashed border-gray-300 mt-1 pt-2 flex justify-between items-center font-space-grotesk font-black text-xl xl:text-2xl uppercase">
                    <span>Total</span>
                    <span>{formatRupiah(getTotal())}</span>
                 </div>
                 <Button 
                   onClick={handleCheckoutClick}
                   size="lg" 
                   className="w-full text-lg h-14 mt-1 bg-[#00E5FF] hover:bg-cyan-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all"
                 >
                    BAYAR SEKARANG
                 </Button>
               </div>
            </div>
         </div>
       )}

       {/* Bottom: Products Area */}
       <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
          
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-4 md:mb-6 shrink-0 z-10 relative">
             <div className="relative flex-grow">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
               <Input 
                 placeholder="Cari Menu..." 
                 className="pl-10 h-12 border-4 border-black text-lg bg-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
             <Button 
               onClick={() => setCustomItemOpen(true)}
               className="h-12 bg-black text-white hover:bg-gray-800 border-4 border-black font-space-grotesk font-black uppercase tracking-wider rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 active:shadow-none active:translate-y-2 transition-all"
             >
               <Plus className="w-5 h-5 mr-2" />
               Custom Item
             </Button>
          </div>

          {/* Categories */}
          <div className="flex gap-3 mb-4 md:mb-6 overflow-x-auto pb-2 shrink-0 hide-scrollbar pt-1 pl-1">
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
          <div className="flex-1 overflow-y-auto pr-2 pb-6">
             <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 pt-1 pl-1">
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
                       <span className="font-space-grotesk font-black uppercase text-black line-clamp-2 flex-grow mb-1">{p.name}</span>
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

       {/* ================= PAYMENT MODAL ================= */}
       <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
         <DialogContent className="border-8 border-black rounded-[2rem] max-w-4xl bg-[#FFFDF7] p-0 overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[95vh] flex flex-col">
            <div className="p-6 bg-[#00A19D] border-b-8 border-black shrink-0">
               <h2 className="font-space-grotesk font-black text-3xl uppercase text-black text-center">Pilih Metode Bayar</h2>
            </div>
            
            <div className="flex flex-col md:flex-row flex-1 overflow-y-auto">
               {/* Left: Summary Pesanan */}
               <div className="w-full md:w-1/2 p-6 border-b-8 md:border-b-0 md:border-r-8 border-black bg-white flex flex-col">
                  <h3 className="font-space-grotesk font-black text-xl uppercase mb-4 border-b-4 border-black pb-2 shrink-0">Ringkasan Pesanan</h3>
                  <div className="flex-1 flex flex-col gap-3 overflow-y-auto hide-scrollbar min-h-[min(30vh,200px)]">
                     {items.map(item => (
                       <div key={item.id} className="flex justify-between items-start font-inter font-bold text-sm border-b-2 border-dashed border-gray-200 pb-2">
                         <div>
                            <span className="block uppercase text-black">{item.product.name}</span>
                            <span className="text-gray-500">{item.qty}x @ {formatRupiah(item.product.basePrice)}</span>
                         </div>
                         <span className="text-black text-right">{formatRupiah(item.product.basePrice * item.qty)}</span>
                       </div>
                     ))}
                  </div>
                  <div className="mt-4 pt-4 shrink-0 flex justify-between items-center bg-[#FFD100] p-4 border-4 border-black rounded-xl shadow-[4px_4px_0_0_#000]">
                      <span className="font-space-grotesk font-black uppercase text-xl text-black">Tagihan</span>
                      <span className="font-space-grotesk font-black uppercase text-2xl text-black">{formatRupiah(total)}</span>
                  </div>
               </div>

               {/* Right: Payment Methods */}
               <div className="w-full md:w-1/2 p-6 flex flex-col gap-6 bg-gray-50 overflow-y-auto hide-scrollbar">
                   <div className="grid grid-cols-2 gap-4 shrink-0">
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
                   
                   <div className="flex-1 flex flex-col">
                      {paymentMethod === 'TUNAI' && (
                        <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 h-full justify-center">
                           <Label className="text-lg">Diterima Tunai</Label>
                           <Input 
                             type="text"
                             inputMode="numeric"
                             value={cashGiven ? new Intl.NumberFormat('id-ID').format(parseInt(cashGiven.replace(/\D/g, '')) || 0) : ''}
                             onChange={(e) => setCashGiven(e.target.value.replace(/\D/g, ''))}
                             className="text-2xl h-14 font-black"
                             placeholder="0"
                             autoFocus
                           />
                           
                           <div className="grid grid-cols-3 gap-2 mt-2">
                              <Button variant="outline" onClick={() => setCashGiven(total.toString())}>Uang Pas</Button>
                              <Button variant="outline" onClick={() => setCashGiven('50000')}>50rb</Button>
                              <Button variant="outline" onClick={() => setCashGiven('100000')}>100rb</Button>
                           </div>

                           {!!cashGiven && (
                              <div className={cn("border-4 border-black rounded-xl p-4 mt-2 flex justify-between items-center text-black shadow-[4px_4px_0_0_#000]", parseInt(cashGiven.replace(/\D/g, '')) >= total ? "bg-[#00A19D]" : "bg-red-400 text-white")}>
                                <span className="font-space-grotesk font-black uppercase text-sm">{parseInt(cashGiven.replace(/\D/g, '')) >= total ? "Kembalian" : "Kurang"}</span>
                                <span className="font-space-grotesk font-black uppercase text-3xl">{formatRupiah(Math.abs(parseInt(cashGiven.replace(/\D/g, '')) - total))}</span>
                              </div>
                           )}
                        </div>
                      )}

                      {paymentMethod === 'QRIS' && (
                        <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 h-full justify-center">
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
                        <div className="flex-1 flex items-center justify-center opacity-30 font-space-grotesk font-black uppercase tracking-widest text-center mt-4">
                           Pilih metode pembayaran<br />di atas.
                        </div>
                      )}
                   </div>
               </div>
            </div>

            <div className="p-6 border-t-8 border-black bg-white flex justify-end gap-4 shrink-0">
               <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>BATAL</Button>
               <Button onClick={handleOpenPaymentConfirm} disabled={!paymentMethod} className="px-8 text-lg bg-[#00E5FF] hover:bg-cyan-400">PROSES TRANSAKSI</Button>
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
               <p className="font-inter font-bold text-gray-500 text-sm">Kembalian: {paymentMethod === 'TUNAI' ? formatRupiah(parseInt(cashGiven.replace(/\D/g, '')) - total) : 'Rp 0'}</p>
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
                         <span>{formatRupiah(parseInt(cashGiven.replace(/\D/g, '')))}</span>
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
         open={confirmPaymentOpen}
         onOpenChange={setConfirmPaymentOpen}
         onConfirm={handleProcessPayment}
         title="Konfirmasi Pembayaran"
         description={`Apakah Anda yakin ingin memproses pembayaran ini? Tagihan: ${formatRupiah(total)} menggunakan metode ${paymentMethod}.`}
       />

       {/* ================= CUSTOM ITEM MODAL ================= */}
       <Dialog open={customItemOpen} onOpenChange={setCustomItemOpen}>
         <DialogContent className="border-8 border-black rounded-[2rem] bg-[#FFFDF7] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
           <DialogHeader>
             <DialogTitle className="font-space-grotesk font-black text-2xl uppercase">Tambah Custom Item</DialogTitle>
           </DialogHeader>
           <div className="flex flex-col gap-4 mt-4">
             <div className="flex flex-col gap-2">
               <Label>Nama Item</Label>
               <Input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Contoh: Plastik Tambahan" />
             </div>
             <div className="flex flex-col gap-2">
               <Label>Harga</Label>
               <Input 
                 value={customPrice ? formatRupiah(parseInt(customPrice)) : ''} 
                 onChange={e => setCustomPrice(e.target.value.replace(/\D/g, ''))} 
                 inputMode="numeric"
                 placeholder="Rp 0" 
               />
             </div>
             <Button onClick={handleAddCustomItem} className="mt-4 bg-[#00E5FF] text-black hover:bg-cyan-400 font-bold">TAMBAH KE KERANJANG</Button>
           </div>
         </DialogContent>
       </Dialog>

       {/* ================= SAVE BILL MODAL ================= */}
       <Dialog open={saveBillOpen} onOpenChange={setSaveBillOpen}>
         <DialogContent className="border-8 border-black rounded-[2rem] bg-[#FFFDF7] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
           <DialogHeader>
             <DialogTitle className="font-space-grotesk font-black text-2xl uppercase">Simpan Open Tab</DialogTitle>
           </DialogHeader>
           <div className="flex flex-col gap-4 mt-4">
             <div className="flex flex-col gap-2">
               <Label>Nama Pemesan / No Meja</Label>
               <Input value={billName} onChange={e => setBillName(e.target.value)} placeholder="Contoh: Meja 4 / Budi" />
             </div>
             <Button onClick={handleSaveBill} className="mt-4 bg-[#FFD100] text-black hover:bg-yellow-400 font-bold">SIMPAN TAGIHAN</Button>
           </div>
         </DialogContent>
       </Dialog>

       {/* ================= LOAD BILL MODAL ================= */}
       <Dialog open={loadBillOpen} onOpenChange={setLoadBillOpen}>
         <DialogContent className="border-8 border-black rounded-[2rem] bg-[#FFFDF7] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[80vh] flex flex-col">
           <DialogHeader className="shrink-0">
             <DialogTitle className="font-space-grotesk font-black text-2xl uppercase">Tagihan Tersimpan ({savedBills.length})</DialogTitle>
           </DialogHeader>
           <div className="flex flex-col gap-3 mt-4 overflow-y-auto">
             {savedBills.length === 0 ? (
               <div className="text-center py-8 text-gray-500 font-bold">Belum ada tagihan yang disimpan.</div>
             ) : (
               savedBills.map(bill => (
                 <div key={bill.id} className="border-4 border-black p-4 rounded-xl flex justify-between items-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                   <div className="flex flex-col">
                     <span className="font-space-grotesk font-black text-lg uppercase">{bill.name}</span>
                     <span className="text-xs text-gray-500 font-bold">{bill.items.length} item - {new Intl.DateTimeFormat('id-ID', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(bill.timestamp))}</span>
                   </div>
                   <div className="flex gap-2">
                     <Button 
                       variant="outline" 
                       size="icon" 
                       onClick={() => deleteSavedBill(bill.id)}
                     >
                       <Trash2 className="w-4 h-4" />
                     </Button>
                     <Button 
                       className="bg-[#00E5FF] text-black hover:bg-cyan-400"
                       onClick={() => {
                         if (items.length > 0) {
                           toast.error('Gagal', { description: 'Harap kosongkan keranjang saat ini terlebih dahulu.' });
                           return;
                         }
                         loadBill(bill.id);
                         setLoadBillOpen(false);
                         toast.success('Tagihan Dibuka');
                       }}
                     >
                       BUKA
                     </Button>
                   </div>
                 </div>
               ))
             )}
           </div>
         </DialogContent>
       </Dialog>

       {/* ================= DISCOUNT MODAL ================= */}
       <Dialog open={isDiscountOpen} onOpenChange={(open) => {
         setIsDiscountOpen(open);
         if (open) {
           setDiscountTypeForm(discountType);
           setDiscountValueForm(discountValue ? discountValue.toString() : '');
         }
       }}>
         <DialogContent className="border-8 border-black rounded-[2rem] bg-[#FFFDF7] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
           <DialogHeader>
             <DialogTitle className="font-space-grotesk font-black text-2xl uppercase">Pengaturan Diskon</DialogTitle>
           </DialogHeader>
           <div className="flex flex-col gap-4 mt-4">
             <div className="grid grid-cols-3 gap-2">
               <Button 
                 variant={discountTypeForm === null ? 'default' : 'outline'} 
                 onClick={() => { setDiscountTypeForm(null); setDiscountValueForm(''); }}
                 className={cn(discountTypeForm === null && "bg-black text-white hover:bg-gray-800 border-2 border-black")}
               >Tanpa Diskon</Button>
               <Button 
                 variant={discountTypeForm === 'PERCENTAGE' ? 'default' : 'outline'} 
                 onClick={() => setDiscountTypeForm('PERCENTAGE')}
                 className={cn(discountTypeForm === 'PERCENTAGE' && "bg-[#FF90E8] text-black border-2 border-black hover:bg-pink-300")}
               >Persen (%)</Button>
               <Button 
                 variant={discountTypeForm === 'NOMINAL' ? 'default' : 'outline'} 
                 onClick={() => setDiscountTypeForm('NOMINAL')}
                 className={cn(discountTypeForm === 'NOMINAL' && "bg-[#FFD100] text-black border-2 border-black hover:bg-yellow-400")}
               >Nominal (Rp)</Button>
             </div>
             
             {discountTypeForm && (
               <div className="flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
                 <Label>Nilai Diskon</Label>
                 <Input 
                   value={discountTypeForm === 'NOMINAL' && discountValueForm ? formatRupiah(parseInt(discountValueForm.replace(/\D/g, ''))) : discountValueForm}
                   onChange={e => {
                     const val = e.target.value.replace(/\D/g, '');
                     if (discountTypeForm === 'PERCENTAGE' && parseInt(val) > 100) return;
                     setDiscountValueForm(val);
                   }}
                   inputMode="numeric"
                   placeholder={discountTypeForm === 'PERCENTAGE' ? 'Contoh: 10' : 'Contoh: 15000'} 
                 />
               </div>
             )}
             
             <Button onClick={handleApplyDiscount} className="mt-4 bg-[#00E5FF] text-black hover:bg-cyan-400 font-bold">TERAPKAN DISKON</Button>
           </div>
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
