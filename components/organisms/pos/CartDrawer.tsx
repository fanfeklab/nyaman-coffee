import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, FolderOpen, Save, Trash2, Minus, Plus, Edit, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Customer } from '@/store/useCustomerStore';
import { SavedBill } from '@/store/useCartStore';
import { cn } from '@/lib/utils';

const formatRupiah = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

interface CartDrawerProps {
  items: any[];
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (val: boolean) => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTaxAmount: () => number;
  getServiceChargeAmount: () => number;
  discountType: 'PERCENTAGE' | 'NOMINAL' | null;
  discountValue: number;
  taxRate: number;
  serviceChargeRate: number;
  setLoadBillOpen: (val: boolean) => void;
  setSaveBillOpen: (val: boolean) => void;
  setClearConfirmOpen: (val: boolean) => void;
  savedBills: SavedBill[];
  updateQty: (id: string, qty: number) => void;
  setIsDiscountOpen: (val: boolean) => void;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (val: string | null) => void;
  customers: Customer[];
  handleCheckoutClick: () => void;
}

export function CartDrawer({
  items,
  isCartDrawerOpen,
  setIsCartDrawerOpen,
  getTotal,
  getSubtotal,
  getDiscountAmount,
  getTaxAmount,
  getServiceChargeAmount,
  discountType,
  discountValue,
  taxRate,
  serviceChargeRate,
  setLoadBillOpen,
  setSaveBillOpen,
  setClearConfirmOpen,
  savedBills,
  updateQty,
  setIsDiscountOpen,
  selectedCustomerId,
  setSelectedCustomerId,
  customers,
  handleCheckoutClick
}: CartDrawerProps) {
  return (
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
               <Button 
                 variant="ghost"
                 className="h-auto pointer-events-auto bg-[#00E5FF] border-4 border-black px-4 py-3 md:px-6 md:py-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-[#00E5FF]/90 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-2 transition-all w-full max-w-2xl flex justify-between items-center group gap-2 text-black hover:text-black"
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
               </Button>
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
                    <Button variant="outline" size="icon" onClick={() => setIsCartDrawerOpen(false)} className="h-10 w-10 p-2 bg-white border-4 border-black rounded-xl hover:translate-y-1 hover:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 transition-all">
                       <ChevronDown className="w-5 h-5 font-black"/>
                    </Button>
                    <h2 className="font-space-grotesk font-black uppercase tracking-wider text-xl md:text-2xl text-black">Pesanan: {items.reduce((a,b) => a+b.qty, 0)} Items</h2>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" size="icon"
                      onClick={() => setLoadBillOpen(true)}
                      title="Buka Tagihan"
                      className="h-12 w-12 p-2 md:p-3 border-4 border-black rounded-xl hover:bg-gray-100 transition-colors bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 relative"
                    >
                      <FolderOpen className="w-5 h-5 text-black" />
                      {savedBills.length > 0 && <span className="absolute -top-3 -right-3 bg-[#00E5FF] text-black text-xs font-black px-2 py-0.5 rounded-full border-4 border-black">{savedBills.length}</span>}
                    </Button>
                    <Button 
                      variant="ghost" size="icon"
                      onClick={() => setSaveBillOpen(true)}
                      title="Simpan Tagihan (Open Tab)"
                      className="h-12 w-12 p-2 md:p-3 border-4 border-black rounded-xl hover:bg-[#FF90E8]/80 transition-colors bg-[#FF90E8] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 text-black"
                      disabled={items.length === 0}
                    >
                      <Save className="w-5 h-5 text-black" />
                    </Button>
                    <Button 
                      variant="destructive" size="icon"
                      onClick={() => setClearConfirmOpen(true)}
                      title="Kosongkan Keranjang"
                      className="h-12 w-12 p-2 md:p-3 border-4 border-black rounded-xl hover:bg-[#FF6321]/90 transition-colors bg-[#FF6321] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
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
                             <Button variant="outline" size="icon" onClick={() => updateQty(item.id, item.qty - 1)} className="h-8 w-8 p-1 bg-white border-2 border-black rounded-lg hover:bg-gray-100 active:scale-95 transition-transform"><Minus className="w-4 h-4"/></Button>
                             <span className="font-black text-lg w-8 text-center">{item.qty}</span>
                             <Button variant="default" size="icon" onClick={() => updateQty(item.id, item.qty + 1)} className="h-8 w-8 p-1 bg-[#FFD100] border-2 border-black rounded-lg hover:bg-[#FFD100]/80 active:scale-95 transition-transform text-black"><Plus className="w-4 h-4"/></Button>
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
                        <SelectItem value="none" label="-- Tanpa Pelanggan --">-- Tanpa Pelanggan --</SelectItem>
                        {customers.map(c => (
                          <SelectItem key={c.id} value={c.id} label={`${c.name} (${c.points} Poin)`}>{c.name} ({c.points} Poin)</SelectItem>
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
  );
}
