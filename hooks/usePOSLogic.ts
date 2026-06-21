import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useInventoryStore, Product } from '@/store/useInventoryStore';
import { useCartStore } from '@/store/useCartStore';
import { useShiftStore } from '@/store/useShiftStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useCustomerStore } from '@/store/useCustomerStore';
import { toast } from 'sonner';
import { SortOption, ViewOption } from '@/components/organisms/pos/PosHeader';

export function usePOSLogic() {
  const router = useRouter();
  const { categories, products, variants, recipes, fetchInventoryData, processCheckoutInventory } = useInventoryStore();
  const { currentShift, addSalesToShift } = useShiftStore();
  const { user } = useAuthStore();
  const { addTransaction } = useTransactionStore();
  const { customers, addPoints } = useCustomerStore();
  const { 
    items, addItem, clearCart, 
    getTotal, discountType, discountValue,
    setDiscount, saveBill, loadBill, savedBills, deleteSavedBill
  } = useCartStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // UI Preferences
  const [sortOption, setSortOption] = useState<SortOption>('A-Z');
  const [viewOption, setViewOption] = useState<ViewOption>('Grid');

  useEffect(() => {
    setTimeout(() => {
      const savedSort = localStorage.getItem('pos_sort_pref') as SortOption;
      const savedView = localStorage.getItem('pos_view_pref') as ViewOption;
      if (savedSort) setSortOption(savedSort);
      if (savedView) setViewOption(savedView);
    }, 0);
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
      Object.entries(selectedVariants).forEach(([vid, value]) => {
         const v = variants.find(vr => vr.id === vid);
         if (!v) return;
         if (Array.isArray(value)) {
            value.forEach(optName => {
               const opt = v.options.find(o => o.name === optName);
               if (opt) optionsToAdd.push({ variantId: v.id, variantName: v.name, optionName: opt.name, priceAdjustment: opt.priceAdjustment || 0 });
            });
         } else {
            const opt = v.options.find(o => o.name === value);
            if (opt) optionsToAdd.push({ variantId: v.id, variantName: v.name, optionName: opt.name, priceAdjustment: opt.priceAdjustment || 0 });
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
      await new Promise(resolve => setTimeout(resolve, 800)); 

      const invRes = processCheckoutInventory(items.map(i => ({ productId: i.product.id, qty: i.qty })));
      if (!invRes.success) {
        toast.error('GAGAL POTONG STOK!', { description: invRes.reason, id: loadToast });
        setConfirmPaymentOpen(false);
        return;
      }

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

      if (selectedCustomerId) {
        addPoints(selectedCustomerId, Math.floor(total / 10000));
      }

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

  return {
    state: {
      searchQuery, setSearchQuery,
      activeCategory, setActiveCategory,
      sortOption, handleSortChange,
      viewOption, handleViewChange,
      selectedCustomerId, setSelectedCustomerId,
      customItemOpen, setCustomItemOpen,
      customName, setCustomName,
      customPrice, setCustomPrice,
      saveBillOpen, setSaveBillOpen,
      loadBillOpen, setLoadBillOpen,
      billName, setBillName,
      isDiscountOpen, setIsDiscountOpen,
      discountTypeForm, setDiscountTypeForm,
      discountValueForm, setDiscountValueForm,
      isCartDrawerOpen, setIsCartDrawerOpen,
      isPaymentOpen, setIsPaymentOpen,
      paymentMethod, setPaymentMethod,
      cashGiven, setCashGiven,
      qrisRef, setQrisRef,
      confirmPaymentOpen, setConfirmPaymentOpen,
      isReceiptOpen, setIsReceiptOpen,
      recipeItem, setRecipeItem,
      clearConfirmOpen, setClearConfirmOpen,
      isRecipeBookOpen, setIsRecipeBookOpen,
      isCustomizeOpen, setIsCustomizeOpen,
      productToCustomize, setProductToCustomize,
      selectedVariants, setSelectedVariants
    },
    data: {
      filteredProducts,
      total,
      categories,
      variants,
      recipes,
      products,
      savedBills,
      items,
      discountType,
      discountValue
    },
    handlers: {
      handleProductClick,
      handleAddCustomizedToCart,
      handleCheckoutClick,
      handleOpenPaymentConfirm,
      handleProcessPayment,
      finishTransaction,
      handleAddCustomItem,
      handleSaveBill,
      handleApplyDiscount
    }
  };
}
