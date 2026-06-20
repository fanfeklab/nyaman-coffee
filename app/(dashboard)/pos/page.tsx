'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useInventoryStore, Category, Product } from '@/store/useInventoryStore';
import { useCartStore } from '@/store/useCartStore';
import { useShiftStore } from '@/store/useShiftStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useCustomerStore } from '@/store/useCustomerStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Plus, Minus, Trash2, ShoppingCart, Coffee, BookOpen, CheckSquare, Check, Save, FolderOpen, Tag, Edit, Percent, ChevronDown, X, AlignJustify, Grid3X3, ArrowDownAZ, ArrowUpZA, ArrowDown10, ArrowUp01, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { PosHeader, SortOption, ViewOption } from '@/components/organisms/pos/PosHeader';
import { PosCategories } from '@/components/organisms/pos/PosCategories';
import { PosProductGrid } from '@/components/organisms/pos/PosProductGrid';
import { CartDrawer } from '@/components/organisms/pos/CartDrawer';
import { PaymentModal } from '@/components/organisms/pos/PaymentModal';
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
  const { categories, products, variants, recipes, fetchInventoryData } = useInventoryStore();
  const { currentShift, addSalesToShift } = useShiftStore();
  const { user } = useAuthStore();
  const { addTransaction } = useTransactionStore();
  const { processCheckoutInventory } = useInventoryStore();
  const { customers } = useCustomerStore();
  const { 
    items, addItem, removeItem, updateQty, clearCart, 
    getTotal, getSubtotal, getDiscountAmount, getTaxAmount, getServiceChargeAmount,
    discountType, discountValue, taxRate, serviceChargeRate,
    setDiscount, saveBill, loadBill, savedBills, deleteSavedBill
  } = useCartStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // UI Preferences
  const [sortOption, setSortOption] = useState<SortOption>('A-Z');
  const [viewOption, setViewOption] = useState<ViewOption>('Grid');

  useEffect(() => {
    // Load preferences from local storage in next tick to avoid cascading render error
    setTimeout(() => {
      const savedSort = localStorage.getItem('pos_sort_pref') as SortOption;
      const savedView = localStorage.getItem('pos_view_pref') as ViewOption;
      if (savedSort) setSortOption(savedSort);
      if (savedView) setViewOption(savedView);
    }, 0);
    
    // Fetch real data from Supabase
    fetchInventoryData();
  }, [fetchInventoryData]);

  const handleSortChange = (opt: SortOption) => {
    setSortOption(opt);
    localStorage.setItem('pos_sort_pref', opt);
  };

  const handleViewChange = (opt: ViewOption) => {
    setViewOption(opt);
    localStorage.setItem('pos_view_pref', opt);
  };
  
  // Current customer
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

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
  
  // Cart Drawer state
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  
  // Protect POS access
  useEffect(() => {
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER';


    if (isAdmin) {
      toast.error('AKSES DITOLAK', { description: 'Admin tidak dapat bertransaksi.' });
      router.push('/shift');
      return;
    }
    if (!currentShift || currentShift.status !== 'OPEN') {
      toast.error('AKSES DITOLAK', { description: 'Anda harus membuka shift terlebih dahulu.' });
      router.push('/shift');
    }
  }, [currentShift, user, router]);

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
  
  // Recipe Book global state
  const [isRecipeBookOpen, setIsRecipeBookOpen] = useState(false);

  // Customize Item Modal
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [productToCustomize, setProductToCustomize] = useState<Product | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, any>>({});
  
  const handleProductClick = (p: Product) => {
    if (p.variantIds && p.variantIds.length > 0) {
      setProductToCustomize(p);
      setSelectedVariants({});
      setIsCustomizeOpen(true);
    } else {
      addItem(p);
    }
  };

  const handleAddCustomizedToCart = () => {
    if (!productToCustomize) return;
    
    const optionsToAdd: any[] = [];
    
    // Validation
    if (productToCustomize.variantIds) {
      for (const vid of productToCustomize.variantIds) {
        const v = variants.find(vr => vr.id === vid);
        if (v && v.isRequired) {
          if (!selectedVariants[vid] || (Array.isArray(selectedVariants[vid]) && selectedVariants[vid].length === 0)) {
            toast.error(`PILIHAN WAJIB!`, { description: `Silahkan pilih ${v.name}` });
            return;
          }
        }
      }
      
      // Building options
      Object.entries(selectedVariants).forEach(([vid, value]) => {
         const v = variants.find(vr => vr.id === vid);
         if (!v) return;
         if (Array.isArray(value)) {
            value.forEach(optName => {
               const opt = v.options.find(o => o.name === optName);
               if (opt) {
                 optionsToAdd.push({ variantId: v.id, variantName: v.name, optionName: opt.name, priceAdjustment: opt.priceAdjustment || 0 });
               }
            });
         } else {
            const opt = v.options.find(o => o.name === value);
            if (opt) {
              optionsToAdd.push({ variantId: v.id, variantName: v.name, optionName: opt.name, priceAdjustment: opt.priceAdjustment || 0 });
            }
         }
      });
    }

    addItem(productToCustomize, optionsToAdd);
    setIsCustomizeOpen(false);
    setProductToCustomize(null);
  };

  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategory !== 'all') {
      result = result.filter(p => p.categoryId === activeCategory);
    }
    if (searchQuery) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    // Sort
    return [...result].sort((a, b) => {
      if (sortOption === 'A-Z') return a.name.localeCompare(b.name);
      if (sortOption === 'Z-A') return b.name.localeCompare(a.name);
      if (sortOption === 'Highest') return b.basePrice - a.basePrice;
      if (sortOption === 'Lowest') return a.basePrice - b.basePrice;
      return 0;
    });
  }, [products, activeCategory, searchQuery, sortOption]);

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

  const handleProcessPayment = async () => {
    const loadToast = toast.loading("Memproses pembayaran & stok...");
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulasi pemrosesan (API/jaringan/database)

      // Process Inventory
      const invRes = processCheckoutInventory(items.map(i => ({ productId: i.product.id, qty: i.qty })));
      if (!invRes.success) {
        toast.error('GAGAL POTONG STOK!', { description: invRes.reason, id: loadToast });
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
        customerId: selectedCustomerId || undefined,
        customerName: selectedCustomerId ? customers.find(c => c.id === selectedCustomerId)?.name : undefined,
        items: [...items],
        total,
        paymentMethod,
        cashGiven: paymentMethod === 'TUNAI' ? parseInt(cashGiven.replace(/\D/g, '')) : undefined,
        timestamp: new Date(),
        status: 'COMPLETED'
      });

      // Customer Points Logic
      if (selectedCustomerId) {
        useCustomerStore.getState().addPoints(selectedCustomerId, Math.floor(total / 10000)); // 1 Point per 10k
      }

      // Success
      if (paymentMethod === 'TUNAI') {
        addSalesToShift(total);
      }
      setConfirmPaymentOpen(false);
      setIsPaymentOpen(false);
      setIsReceiptOpen(true);
      setSelectedCustomerId(null);
      toast.success('TRANSAKSI BERHASIL', { description: 'Pembayaran telah diterima dan dicatat.', id: loadToast });
    } catch (e) {
      toast.error('GAGAL MEMPROSES PEMBAYARAN', { id: loadToast });
      setConfirmPaymentOpen(false);
    }
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
    <div className="flex flex-col h-full bg-[#FFFDF7] overflow-hidden relative">
       {/* Bottom: Products Area */}
       <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
          
          <PosHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortOption={sortOption}
            handleSortChange={handleSortChange}
            viewOption={viewOption}
            handleViewChange={handleViewChange}
            setCustomItemOpen={setCustomItemOpen}
            setIsRecipeBookOpen={setIsRecipeBookOpen}
          />
          <PosCategories
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
          <PosProductGrid
            filteredProducts={filteredProducts}
            categories={categories}
            viewOption={viewOption}
            handleProductClick={handleProductClick}
          />
       </div>

       {/* Floating Cart & Bottom Drawer overlay */}
       <CartDrawer
          items={items}
          isCartDrawerOpen={isCartDrawerOpen}
          setIsCartDrawerOpen={setIsCartDrawerOpen}
          getTotal={getTotal}
          getSubtotal={getSubtotal}
          getDiscountAmount={getDiscountAmount}
          getTaxAmount={getTaxAmount}
          getServiceChargeAmount={getServiceChargeAmount}
          discountType={discountType}
          discountValue={discountValue}
          taxRate={taxRate}
          serviceChargeRate={serviceChargeRate}
          setLoadBillOpen={setLoadBillOpen}
          setSaveBillOpen={setSaveBillOpen}
          setClearConfirmOpen={setClearConfirmOpen}
          savedBills={savedBills}
          updateQty={updateQty}
          setIsDiscountOpen={setIsDiscountOpen}
          selectedCustomerId={selectedCustomerId}
          setSelectedCustomerId={setSelectedCustomerId}
          customers={customers}
          handleCheckoutClick={handleCheckoutClick}
       />

       {/* ================= CUSTOMIZE MODAL ================= */}
       <Dialog open={isCustomizeOpen} onOpenChange={setIsCustomizeOpen}>
         <DialogContent className="border-8 border-black rounded-[2rem] max-w-xl bg-white p-0 overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] flex flex-col">
            <div className="p-5 bg-black text-white shrink-0">
               <h2 className="font-space-grotesk font-black text-2xl uppercase tracking-widest">{productToCustomize?.name}</h2>
               <p className="font-inter font-bold text-gray-300">Pilih varian atau kustomisasi pesanan</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 hide-scrollbar">
               {productToCustomize?.variantIds?.map(vid => {
                  const v = variants.find(vr => vr.id === vid);
                  if (!v) return null;
                  
                  return (
                    <div key={v.id} className="flex flex-col gap-3">
                       <div className="flex items-center justify-between">
                         <Label className="font-space-grotesk font-black text-lg uppercase">{v.name}</Label>
                         {v.isRequired ? <span className="bg-[#FFD100] text-black text-[10px] font-black uppercase px-2 py-1 rounded border-2 border-black">Wajib</span> : <span className="text-gray-400 text-xs font-bold uppercase">Opsional</span>}
                       </div>
                       
                       <div className="grid grid-cols-2 gap-3">
                          {v.options.map(opt => {
                             const isSelected = v.type === 'SINGLE_CHOICE' 
                               ? selectedVariants[v.id] === opt.name 
                               : (selectedVariants[v.id] || []).includes(opt.name);

                             return (
                               <button
                                 key={opt.name}
                                 onClick={() => {
                                   if (v.type === 'SINGLE_CHOICE') {
                                     setSelectedVariants({...selectedVariants, [v.id]: opt.name});
                                   } else {
                                     const curr = selectedVariants[v.id] || [];
                                     if (curr.includes(opt.name)) {
                                        setSelectedVariants({...selectedVariants, [v.id]: curr.filter((x:any) => x !== opt.name)});
                                     } else {
                                        setSelectedVariants({...selectedVariants, [v.id]: [...curr, opt.name]});
                                     }
                                   }
                                 }}
                                 className={cn(
                                   "p-3 text-left border-4 border-black rounded-xl font-bold transition-all flex flex-col justify-between h-20 active:translate-y-1 active:shadow-none",
                                   isSelected ? "bg-[#00E5FF] shadow-[2px_2px_0_0_#000] translate-y-0" : "bg-white shadow-[4px_4px_0_0_#000] hover:translate-y-1 hover:shadow-[2px_2px_0_0_#000]"
                                 )}
                               >
                                  <span className="truncate">{opt.name}</span>
                                  {opt.priceAdjustment > 0 && <span className="text-xs">+{formatRupiah(opt.priceAdjustment)}</span>}
                               </button>
                             )
                          })}
                       </div>
                    </div>
                  )
               })}
            </div>

            <div className="p-6 bg-gray-50 border-t-4 border-black shrink-0 flex gap-4">
              <Button variant="outline" className="flex-1 h-14 font-black border-4 border-black shadow-[4px_4px_0_0_#000]" onClick={() => setIsCustomizeOpen(false)}>BATAL</Button>
              <Button onClick={handleAddCustomizedToCart} className="flex-1 h-14 bg-[#FF90E8] text-black font-black border-4 border-black shadow-[4px_4px_0_0_#000] hover:bg-pink-400">TAMBAH</Button>
            </div>
         </DialogContent>
       </Dialog>

       {/* ================= PAYMENT MODAL ================= */}
       <PaymentModal
          isPaymentOpen={isPaymentOpen}
          setIsPaymentOpen={setIsPaymentOpen}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          cashGiven={cashGiven}
          setCashGiven={setCashGiven}
          qrisRef={qrisRef}
          setQrisRef={setQrisRef}
          handleOpenPaymentConfirm={handleOpenPaymentConfirm}
          total={total}
       />

       {/* ================= RECEIPT MODAL ================= */}
       <Dialog open={isReceiptOpen} onOpenChange={() => {}}>
         <DialogContent className="border-8 border-black rounded-[2rem] max-w-md bg-[#FFFDF7] p-0 overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="p-8 pb-4 flex flex-col items-center border-b-8 border-black bg-white">
               <div className="w-16 h-16 bg-[#00A19D] border-4 border-black rounded-full flex items-center justify-center mb-4 shadow-[4px_4px_0_0_#000]">
                 <CheckSquare className="w-8 h-8 text-black" strokeWidth={3} />
               </div>
               <h2 className="font-space-grotesk font-black text-3xl uppercase text-black text-center mb-1">Transaksi<br/>Selesai!</h2>
               <p className="font-inter font-bold text-gray-500 text-sm">Kembalian: {paymentMethod === 'TUNAI' ? formatRupiah(parseInt((cashGiven || '0').toString().replace(/\D/g, '')) - total) : 'Rp 0'}</p>
            </div>
            
            <div className="p-6 flex flex-col gap-4 bg-gray-100">
               {/* Recipe button wrapper for specific items */}
               {items.some(i => recipes.find(r => r.productId === i.product.id)) && (
                  <div className="flex flex-col gap-2 mb-2 p-4 bg-[#FFD100] border-4 border-black rounded-xl">
                      <span className="font-space-grotesk font-black uppercase text-sm flex items-center gap-2"><BookOpen className="w-4 h-4" /> Resep Terkait Order Ini</span>
                      <div className="flex flex-wrap gap-2">
                        {items.filter(i => recipes.find(r => r.productId === i.product.id)).map(i => {
                           const r = recipes.find(r => r.productId === i.product.id);
                           return (
                             <button 
                               key={i.id}
                               className="px-3 py-1.5 bg-white border-2 border-black rounded-md text-xs font-bold font-inter shadow-[2px_2px_0_0_#000] hover:translate-y-0.5 hover:shadow-none active:translate-y-1 transition-all"
                               onClick={() => {
                                 setRecipeItem({...i.product, recipe: r?.instructions});
                               }}
                             >
                               Resep: {i.product.name}
                             </button>
                           )
                        })}
                      </div>
                  </div>
               )}

               {/* ================= RECEIPT PREVIEW SCROLLABLE AREA ================= */}
               <div className="border-2 border-black rounded-xl max-h-64 overflow-y-auto bg-gray-50 mb-2 relative print-area">
                  <div className="p-4 bg-white min-h-[150px] font-mono text-sm shadow-sm" id="print-receipt-section">
                     <h3 className="font-space-grotesk font-black uppercase text-center text-lg mb-4 border-b-2 border-dashed border-gray-400 pb-2">NYAMAN COFFEE</h3>
                     <div className="flex flex-col gap-1 w-full text-xs">
                        <div className="flex justify-between w-full mb-2">
                           <span className="text-gray-500">2026-06-19</span>
                           <span className="text-gray-500 uppercase">{paymentMethod}</span>
                        </div>
                        {items.map(i => {
                           const itemOptsPrice = (i.selectedOptions || []).reduce((a:any,b:any)=>a+b.priceAdjustment, 0);
                           return (
                           <div key={i.id} className="flex flex-col w-full mb-1">
                             <div className="flex justify-between w-full">
                               <span>{i.qty}x {i.product.name}</span>
                               <span>{formatRupiah(i.qty * (i.product.basePrice + itemOptsPrice))}</span>
                             </div>
                             {i.selectedOptions && i.selectedOptions.length > 0 && (
                               <div className="ml-4 text-[10px] text-gray-500 w-3/4">
                                 {i.selectedOptions.map((o:any) => o.optionName).join(', ')}
                               </div>
                             )}
                           </div>
                           )
                        })}
                        <div className="border-t-2 border-black border-dashed mt-2 pt-2 flex justify-between font-bold">
                           <span>TOTAL</span>
                           <span>{formatRupiah(total)}</span>
                        </div>
                        {paymentMethod === 'TUNAI' && (
                          <>
                            <div className="flex justify-between mt-1 text-gray-500">
                               <span>TUNAI</span>
                               <span>{formatRupiah(parseInt((cashGiven || '0').toString().replace(/\D/g, '')))}</span>
                            </div>
                            <div className="flex justify-between mt-1 font-bold">
                               <span>KEMBALI</span>
                               <span>{formatRupiah(parseInt((cashGiven || '0').toString().replace(/\D/g, '')) - total)}</span>
                            </div>
                          </>
                        )}
                        <div className="border-t-2 border-black border-dashed mt-4 pt-2 text-center text-xs text-gray-500">
                           Terima kasih & Semoga nyaman
                        </div>
                     </div>
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
            <Button className="mt-4 border-white" onClick={() => setRecipeItem(null)}>MENGERTI</Button>
         </DialogContent>
       </Dialog>

       {/* ================= BUKU RESEP UTAMA ================= */}
       <Dialog open={isRecipeBookOpen} onOpenChange={setIsRecipeBookOpen}>
         <DialogContent className="border-8 border-black rounded-[2rem] bg-[#FFFDF7] p-0 overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[85vh] max-w-4xl flex flex-col">
            <div className="p-5 md:p-6 bg-[#FF90E8] border-b-8 border-black shrink-0">
               <DialogTitle className="font-space-grotesk font-black text-2xl md:text-3xl uppercase text-black text-center flex items-center justify-center gap-3">
                  <BookOpen className="w-8 h-8" /> Buku Resep Barista
               </DialogTitle>
            </div>
            <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 bg-gray-50 hide-scrollbar">
              {recipes.length === 0 ? (
                <div className="col-span-1 md:col-span-2 text-center text-gray-500 font-bold py-10">Belum ada resep yang dicatat pada menu.</div>
              ) : (
                recipes.map(recipe => {
                  const product = products.find(p => p.id === recipe.productId);
                  if (!product) return null;
                  const cat = categories.find(c => c.id === product.categoryId);
                  return (
                    <div key={recipe.id} className="bg-white border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0_0_#000]">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="font-space-grotesk font-black uppercase text-xl">{product.name}</span>
                         {cat && <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-2 border-black rounded-md" style={{ backgroundColor: cat.color }}>{cat.name}</span>}
                      </div>
                      <div className="bg-gray-100 border-2 border-dashed border-gray-300 p-3 rounded-lg font-inter font-bold text-sm whitespace-pre-wrap">
                        {recipe.instructions || 'Tidak ada instruksi khusus.'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="p-4 border-t-8 border-black bg-white flex justify-end shrink-0">
               <Button onClick={() => setIsRecipeBookOpen(false)} className="px-8 text-lg w-full md:w-auto">TUTUP BUKU RESEP</Button>
            </div>
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
