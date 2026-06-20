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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formatRupiah = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

type SortOption = 'A-Z' | 'Z-A' | 'Highest' | 'Lowest';
type ViewOption = 'Grid' | 'Compact';

export default function POSPage() {
  const router = useRouter();
  const { categories, products, variants, recipes } = useInventoryStore();
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
  }, []);

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
    addSalesToShift(total);
    setConfirmPaymentOpen(false);
    setIsPaymentOpen(false);
    setIsReceiptOpen(true);
    setSelectedCustomerId(null);
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
    <div className="flex flex-col h-full bg-[#FFFDF7] overflow-hidden relative">
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
             
             {/* Views & Filters */}
             <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                 <Popover>
                   <PopoverTrigger className="h-12 w-12 border-4 border-black shadow-[4px_4px_0_0_#000] p-0 flex items-center justify-center rounded-xl bg-white hover:bg-gray-100 transition-colors" title="Urutkan" type="button">
                     <Filter className="w-5 h-5"/>
                   </PopoverTrigger>
                   <PopoverContent align="end" className="w-56 p-2 border-4 border-black shadow-[4px_4px_0_0_#000] rounded-2xl bg-white">
                      <div className="flex flex-col gap-1">
                        <span className="font-space-grotesk font-black uppercase text-xs tracking-widest text-gray-500 mb-2 px-2">Urutkan Berdasarkan</span>
                        {[
                          { id: 'A-Z', label: 'Nama A - Z', icon: ArrowDownAZ },
                          { id: 'Z-A', label: 'Nama Z - A', icon: ArrowUpZA },
                          { id: 'Highest', label: 'Harga Tertinggi', icon: ArrowDown10 },
                          { id: 'Lowest', label: 'Harga Terendah', icon: ArrowUp01 },
                        ].map(opt => (
                           <button 
                             key={opt.id}
                             onClick={() => handleSortChange(opt.id as SortOption)}
                             className={cn("flex items-center gap-2 px-3 py-2 text-sm font-inter font-bold rounded-xl text-left transition-colors", sortOption === opt.id ? "bg-[#00E5FF] border-2 border-black" : "hover:bg-gray-100 border-2 border-transparent")}
                           >
                             <opt.icon className="w-4 h-4"/>
                             {opt.label}
                             {sortOption === opt.id && <Check className="w-4 h-4 ml-auto"/>}
                           </button>
                        ))}
                      </div>
                   </PopoverContent>
                 </Popover>

                 <div className="flex items-center bg-white border-4 border-black rounded-xl p-1 shadow-[4px_4px_0_0_#000]">
                    <button 
                      onClick={() => handleViewChange('Grid')}
                      className={cn("p-2 rounded-lg transition-colors", viewOption === 'Grid' ? "bg-black text-white" : "text-gray-500 hover:text-black")}
                      title="Tampilan Grid (Gambar)"
                    >
                      <Grid3X3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleViewChange('Compact')}
                      className={cn("p-2 rounded-lg transition-colors", viewOption === 'Compact' ? "bg-black text-white" : "text-gray-500 hover:text-black")}
                      title="Tampilan Kompak (Tanpa Gambar)"
                    >
                      <AlignJustify className="w-5 h-5" />
                    </button>
                 </div>

                 <Button 
                   onClick={() => setCustomItemOpen(true)}
                   className="h-12 bg-black text-white hover:bg-gray-800 border-4 border-black font-space-grotesk font-black uppercase tracking-wider rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 active:shadow-none active:translate-y-2 transition-all"
                 >
                   <Plus className="w-5 h-5 mr-0 lg:mr-2" />
                   <span className="hidden lg:inline">Custom</span>
                 </Button>

                 <Button 
                   onClick={() => setIsRecipeBookOpen(true)}
                   variant="secondary"
                   className="h-12 bg-[#FF90E8] border-4 border-black font-space-grotesk font-black uppercase tracking-wider rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 active:shadow-none active:translate-y-2 transition-all"
                 >
                   <BookOpen className="w-5 h-5 mr-0 md:mr-2 text-black" />
                   <span className="hidden md:inline">Resep</span>
                 </Button>
             </div>
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
          <div className="flex-1 overflow-y-auto pr-2 pb-32">
             <div className={cn("grid gap-4 md:gap-6 pt-1 pl-1", viewOption === 'Grid' ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-5" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3")}>
                {filteredProducts.map(p => {
                  const cat = categories.find(c => c.id === p.categoryId);
                  
                  if (viewOption === 'Compact') {
                    return (
                      <div 
                        key={p.id}
                        onClick={() => handleProductClick(p)}
                        className="bg-white border-4 border-black rounded-2xl p-4 flex justify-between items-center cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-2 active:translate-x-2 transition-all select-none group"
                      >
                         <div className="flex flex-col">
                           <span className="font-space-grotesk font-black uppercase text-black line-clamp-1 text-lg mb-1">{p.name}</span>
                           <div className="flex items-center gap-2">
                             <span className="font-inter font-black text-[#FF6321]">{formatRupiah(p.basePrice)}</span>
                             {cat && (
                               <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-2 border-black rounded-md" style={{ backgroundColor: cat.color }}>
                                  {cat.name}
                               </span>
                             )}
                           </div>
                         </div>
                         <Button variant="outline" className="h-10 w-10 p-0 border-2 border-black bg-[#FFD100] group-hover:bg-[#FFD100]">
                           <Plus className="w-5 h-5 text-black" />
                         </Button>
                      </div>
                    );
                  }

                  // Grid View (Default)
                  return (
                    <div 
                      key={p.id}
                      onClick={() => handleProductClick(p)}
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

       {/* Floating Cart & Bottom Drawer overlay */}
       <AnimatePresence>
         {items.length > 0 && (
           <>
             {/* Floating sticky bar when drawer is CLOSED */}
             {!isCartDrawerOpen && (
               <motion.div
                 initial={{ y: 100 }}
                 animate={{ y: 0 }}
                 exit={{ y: 100 }}
                 className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-40 bg-transparent flex justify-center pointer-events-none"
               >
                  <button 
                    className="pointer-events-auto bg-[#00E5FF] border-4 border-black px-4 py-3 md:px-6 md:py-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-2 transition-all w-full max-w-2xl flex justify-between items-center group gap-2"
                    onClick={() => setIsCartDrawerOpen(true)}
                  >
                      <div className="flex items-center gap-2 md:gap-4 shrink-0">
                         <div className="bg-black text-[#00E5FF] w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform shrink-0">{items.reduce((a,b) => a+b.qty, 0)}</div>
                         <div className="flex flex-col items-start gap-0 text-left">
                             <span className="font-space-grotesk font-black uppercase text-lg md:text-xl leading-none">Keranjang</span>
                             <span className="font-inter font-bold text-black/70 text-[10px] md:text-xs">Klik buka pesanan</span>
                         </div>
                      </div>
                      <span className="font-space-grotesk font-black text-sm md:text-2xl bg-white px-2 py-1.5 md:px-4 md:py-1.5 rounded-lg border-2 border-black shrink-0 truncate">{formatRupiah(getTotal())}</span>
                  </button>
               </motion.div>
             )}

             {/* Backdrop when drawer is OPEN */}
             {isCartDrawerOpen && (
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 0.6 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-black z-40"
                 onClick={() => setIsCartDrawerOpen(false)}
               />
             )}

             {/* Bottom Drawer Cart Area */}
             {isCartDrawerOpen && (
               <motion.div
                 initial={{ y: "100%" }}
                 animate={{ y: 0 }}
                 exit={{ y: "100%" }}
                 transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                 className="absolute bottom-0 left-0 right-0 max-h-[90vh] bg-white border-t-8 border-x-8 border-black rounded-t-[2.5rem] z-50 flex flex-col shadow-[0px_-8px_0px_0px_rgba(0,0,0,0.5)] md:max-w-3xl md:mx-auto"
               >
                  {/* Handle & Header */}
                  <div className="p-4 md:p-5 border-b-4 border-black bg-[#FFD100] flex justify-between items-center rounded-t-[2rem] shrink-0">
                     <div className="flex items-center gap-3">
                       <button onClick={() => setIsCartDrawerOpen(false)} className="p-2 bg-white border-4 border-black rounded-xl hover:translate-y-1 hover:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 transition-all">
                          <ChevronDown className="w-5 h-5 font-black"/>
                       </button>
                       <h2 className="font-space-grotesk font-black uppercase tracking-wider text-xl md:text-2xl text-black">Pesanan: {items.reduce((a,b) => a+b.qty, 0)} Items</h2>
                     </div>
                     
                     <div className="flex items-center gap-2">
                       <button 
                         onClick={() => setLoadBillOpen(true)}
                         title="Buka Tagihan"
                         className="p-2 md:p-3 border-4 border-black rounded-xl hover:bg-white transition-colors bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 relative"
                       >
                         <FolderOpen className="w-5 h-5 text-black" />
                         {savedBills.length > 0 && <span className="absolute -top-3 -right-3 bg-[#00E5FF] text-black text-xs font-black px-2 py-0.5 rounded-full border-4 border-black">{savedBills.length}</span>}
                       </button>
                       <button 
                         onClick={() => setSaveBillOpen(true)}
                         title="Simpan Tagihan (Open Tab)"
                         className="p-2 md:p-3 border-4 border-black rounded-xl hover:bg-white transition-colors bg-[#FF90E8] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1"
                         disabled={items.length === 0}
                       >
                         <Save className="w-5 h-5 text-black" />
                       </button>
                       <button 
                         onClick={() => setClearConfirmOpen(true)}
                         title="Kosongkan Keranjang"
                         className="p-2 md:p-3 border-4 border-black rounded-xl hover:bg-white transition-colors bg-[#FF6321] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1"
                       >
                         <Trash2 className="w-5 h-5" />
                       </button>
                     </div>
                  </div>
                  
                  {/* Cart Items List */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-3 min-h-[30vh] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
                      {items.map(item => {
                       const itemOptsPrice = (item.selectedOptions || []).reduce((a:any,b:any)=>a+b.priceAdjustment, 0);
                       const itemTotalPrice = (item.product.basePrice + itemOptsPrice) * item.qty;
                       return (
                       <div key={item.id} className="w-full border-4 border-black rounded-2xl p-4 flex flex-col md:flex-row md:items-start gap-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <div className="flex-1 flex flex-col">
                             <span className="font-space-grotesk font-black text-lg uppercase line-clamp-1">{item.product.name}</span>
                             {item.selectedOptions && item.selectedOptions.length > 0 && (
                               <div className="flex flex-wrap gap-1 my-1">
                                 {item.selectedOptions.map((o: any, oidx: number) => (
                                   <span key={oidx} className="text-[10px] font-bold uppercase bg-gray-100 border-2 border-black px-1.5 py-0.5 rounded-md">
                                     {o.optionName} {o.priceAdjustment > 0 ? `(+${o.priceAdjustment})` : ''}
                                   </span>
                                 ))}
                               </div>
                             )}
                             <span className="font-inter font-bold text-gray-500 text-sm">
                               {formatRupiah(item.product.basePrice)}
                               {itemOptsPrice > 0 && ` + ${formatRupiah(itemOptsPrice)} varian`}
                             </span>
                          </div>
                          
                          <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t-2 border-dashed md:border-none border-gray-200 mt-2 md:mt-0">
                             <span className="font-space-grotesk font-black text-[#FF6321] text-xl">{formatRupiah(itemTotalPrice)}</span>
                             <div className="flex items-center gap-1 bg-gray-100 border-4 border-black rounded-xl p-1 shrink-0">
                                <button onClick={() => updateQty(item.id, item.qty - 1)} className="p-2 bg-white border-2 border-black rounded-lg hover:bg-gray-100 active:scale-95 transition-transform"><Minus className="w-4 h-4"/></button>
                                <span className="font-black text-lg w-8 text-center">{item.qty}</span>
                                <button onClick={() => updateQty(item.id, item.qty + 1)} className="p-2 bg-[#FFD100] border-2 border-black rounded-lg hover:brightness-95 active:scale-95 transition-transform"><Plus className="w-4 h-4"/></button>
                             </div>
                          </div>
                       </div>
                     )})}
                  </div>

                  {/* Cart Footer / Checkout Sticky Panel */}
                  <div className="p-4 md:p-6 bg-white border-t-8 border-black shrink-0">
                    <div className="flex flex-col gap-2 text-sm font-inter font-bold uppercase mb-4 px-2">
                       <div className="flex justify-between items-center text-gray-600">
                          <span>Subtotal</span>
                          <span>{formatRupiah(getSubtotal())}</span>
                       </div>
                       {(discountType || discountValue > 0) && (
                         <div className="flex justify-between items-center text-[#FF6321]">
                            <span className="flex items-center gap-2 cursor-pointer hover:underline" onClick={() => setIsDiscountOpen(true)}>
                              Diskon {discountType === 'PERCENTAGE' && `(${discountValue}%)`} <Edit className="w-4 h-4"/>
                            </span>
                            <span>-{formatRupiah(getDiscountAmount())}</span>
                         </div>
                       )}
                       {!discountType && (
                         <div className="flex justify-between items-center text-gray-400">
                            <span className="flex items-center gap-2 cursor-pointer hover:text-black transition-colors" onClick={() => setIsDiscountOpen(true)}>
                              Tambah Diskon <Tag className="w-4 h-4"/>
                            </span>
                         </div>
                       )}
                       {getServiceChargeAmount() > 0 && (
                         <div className="flex justify-between items-center text-gray-600">
                            <span>Service ({serviceChargeRate}%)</span>
                            <span>{formatRupiah(getServiceChargeAmount())}</span>
                         </div>
                       )}
                       {getTaxAmount() > 0 && (
                         <div className="flex justify-between items-center text-gray-600">
                            <span>Pajak ({taxRate}%)</span>
                            <span>{formatRupiah(getTaxAmount())}</span>
                         </div>
                       )}
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-2 mb-4 px-2">
                       <Label className="text-sm font-bold uppercase">Pelanggan (Opsional)</Label>
                       <Select 
                         value={selectedCustomerId || "none"}
                         onValueChange={(val) => setSelectedCustomerId(val === "none" ? null : val)}
                       >
                         <SelectTrigger className="flex h-10 w-full rounded-xl border-4 border-black bg-white px-3 py-2 text-sm focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-inter font-bold uppercase transition-all shadow-[2px_2px_0_0_#000]">
                           <SelectValue placeholder="-- Pilih Pelanggan --" />
                         </SelectTrigger>
                         <SelectContent className="border-4 border-black rounded-xl shadow-[4px_4px_0_0_#000] font-inter font-bold uppercase">
                           <SelectItem value="none">-- Tanpa Pelanggan --</SelectItem>
                           {customers.map(c => (
                             <SelectItem key={c.id} value={c.id}>{c.name} ({c.points} Poin)</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                    </div>

                    <div className="border-t-4 border-black border-dashed pt-4 mb-4 flex justify-between items-center font-space-grotesk font-black text-3xl uppercase">
                       <span>Total</span>
                       <span>{formatRupiah(getTotal())}</span>
                    </div>
                    <Button 
                      onClick={() => {
                        setIsCartDrawerOpen(false);
                        handleCheckoutClick();
                      }}
                      size="lg" 
                      className="w-full h-16 text-2xl bg-[#00E5FF] hover:bg-cyan-400 text-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all uppercase tracking-widest font-space-grotesk font-black"
                    >
                       BAYAR SEKARANG
                    </Button>
                  </div>
               </motion.div>
             )}
           </>
         )}
       </AnimatePresence>

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
       <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
         <DialogContent className="border-8 border-black rounded-[2rem] max-w-2xl bg-[#FFFDF7] p-0 overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[95vh] flex flex-col">
            <div className="p-5 md:p-6 bg-[#00A19D] border-b-8 border-black shrink-0 flex justify-between items-center">
               <h2 className="font-space-grotesk font-black text-2xl md:text-3xl uppercase text-black text-center">Pembayaran</h2>
               <div className="bg-white px-4 py-2 rounded-xl border-4 border-black font-space-grotesk font-black text-xl md:text-2xl shadow-[4px_4px_0_0_#000]">
                  {formatRupiah(total)}
               </div>
            </div>
            
            <div className="flex flex-col p-5 md:p-8 gap-6 md:gap-8 overflow-y-auto hide-scrollbar bg-white">
                <div className="grid grid-cols-2 gap-4 shrink-0">
                  <Button 
                    variant={paymentMethod === 'TUNAI' ? 'default' : 'outline'} 
                    className={cn("h-16 md:h-20 justify-center px-4 text-xl font-space-grotesk font-black uppercase tracking-widest border-4 border-black transition-all", paymentMethod === 'TUNAI' ? "bg-[#FF6321] text-white shadow-none translate-y-1" : "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none")}
                    onClick={() => setPaymentMethod('TUNAI')}
                  >
                    TUNAI
                  </Button>
                  <Button 
                    variant={paymentMethod === 'QRIS' ? 'default' : 'outline'} 
                    className={cn("h-16 md:h-20 justify-center px-4 text-xl font-space-grotesk font-black uppercase tracking-widest border-4 border-black transition-all", paymentMethod === 'QRIS' ? "bg-[#FFD100] text-black shadow-none translate-y-1" : "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none")}
                    onClick={() => setPaymentMethod('QRIS')}
                  >
                    QRIS
                  </Button>
                </div>
                
                <div className="flex-1 flex flex-col min-h-[30vh]">
                   {paymentMethod === 'TUNAI' && (
                     <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
                        <Label className="text-xl font-space-grotesk font-black uppercase">Diterima Tunai</Label>
                        <Input 
                          type="text"
                          inputMode="numeric"
                          value={cashGiven ? new Intl.NumberFormat('id-ID').format(parseInt(cashGiven.replace(/\D/g, '')) || 0) : ''}
                          onChange={(e) => setCashGiven(e.target.value.replace(/\D/g, ''))}
                          className="text-3xl h-20 font-black border-4 border-black shadow-[4px_4px_0_0_#000] text-center"
                          placeholder="0"
                          autoFocus
                        />
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                           <Button variant="outline" className="h-14 font-black border-4 border-black shadow-[2px_2px_0_0_#000] active:translate-y-1 active:shadow-none" onClick={() => setCashGiven(total.toString())}>UANG PAS</Button>
                           <Button variant="outline" className="h-14 font-black border-4 border-black shadow-[2px_2px_0_0_#000] active:translate-y-1 active:shadow-none" onClick={() => setCashGiven('50000')}>50.000</Button>
                           <Button variant="outline" className="h-14 font-black border-4 border-black shadow-[2px_2px_0_0_#000] active:translate-y-1 active:shadow-none" onClick={() => setCashGiven('100000')}>100.000</Button>
                           <Button variant="outline" className="h-14 font-black border-4 border-black shadow-[2px_2px_0_0_#000] active:translate-y-1 active:shadow-none" onClick={() => {
                             const current = parseInt(cashGiven.replace(/\D/g, '')) || 0;
                             setCashGiven('0');
                           }}>RESET</Button>
                        </div>

                        {!!cashGiven && (
                           <div className={cn("border-4 border-black rounded-2xl p-6 mt-4 flex flex-col md:flex-row justify-between md:items-center shadow-[4px_4px_0_0_#000]", parseInt(cashGiven.replace(/\D/g, '')) >= total ? "bg-[#00E5FF] text-black" : "bg-red-500 text-white")}>
                             <span className="font-space-grotesk font-black uppercase text-xl mb-2 md:mb-0">{parseInt(cashGiven.replace(/\D/g, '')) >= total ? "Kembalian" : "Uang Kurang"}</span>
                             <span className="font-space-grotesk font-black uppercase text-4xl">{formatRupiah(Math.abs(parseInt(cashGiven.replace(/\D/g, '')) - total))}</span>
                           </div>
                        )}
                     </div>
                   )}

                   {paymentMethod === 'QRIS' && (
                     <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
                        <Label className="text-xl font-space-grotesk font-black uppercase">No Referensi Transaksi (Opsional)</Label>
                        <Input 
                          value={qrisRef}
                          onChange={(e) => setQrisRef(e.target.value)}
                          className="text-2xl h-16 uppercase border-4 border-black shadow-[4px_4px_0_0_#000]"
                          placeholder="INPUT REF ID"
                          autoFocus
                        />
                        <div className="bg-[#FFD100] border-4 border-black p-4 rounded-xl shadow-[4px_4px_0_0_#000] mt-2">
                          <p className="font-inter font-black text-sm text-black uppercase">Instruksi Kasir:</p>
                          <p className="font-inter font-bold text-sm text-black/80 mt-1">Pastikan pembeli melihatkan layar sukses (hijau) pada aplikasi dompet digital / m-banking dan masukkan 4-6 digit terakhir nomor referensi sebagai bukti.</p>
                        </div>
                     </div>
                   )}

                   {!paymentMethod && (
                     <div className="flex-1 flex items-center justify-center font-space-grotesk font-black uppercase tracking-widest text-center text-gray-300 text-2xl h-full border-4 border-dashed border-gray-200 rounded-2xl p-8">
                        Pilih Menu Pembayaran<br />di Atas
                     </div>
                   )}
                </div>
            </div>

            <div className="p-5 md:p-6 border-t-8 border-black bg-gray-50 flex flex-col-reverse md:flex-row justify-end gap-4 shrink-0">
               <Button variant="outline" className="h-16 px-6 text-xl font-space-grotesk font-black border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-y-1 hover:shadow-none active:translate-y-2 uppercase w-full md:w-auto" onClick={() => setIsPaymentOpen(false)}>KEMBALI</Button>
               <Button onClick={handleOpenPaymentConfirm} disabled={!paymentMethod} className="h-16 px-8 text-xl font-space-grotesk font-black tracking-widest bg-[#00E5FF] hover:bg-cyan-400 border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-y-1 hover:shadow-none active:translate-y-2 transition-all text-black uppercase w-full md:w-auto">PROSES TRANSAKSI</Button>
            </div>
         </DialogContent>
       </Dialog>

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
