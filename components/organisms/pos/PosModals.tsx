import React from 'react';
import { Product } from '@/store/useInventoryStore';
import { useCartStore } from '@/store/useCartStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CheckSquare, BookOpen, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const formatRupiah = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

export function PosModals({ logic }: { logic: any }) {
  const { state, data, handlers } = logic;
  const { deleteSavedBill, loadBill, clearCart } = useCartStore();

  return (
    <>
       {/* CUSTOMIZE MODAL */}
       <Dialog open={state.isCustomizeOpen} onOpenChange={state.setIsCustomizeOpen}>
         <DialogContent className="border-8 border-black rounded-[2rem] max-w-xl bg-white p-0 overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] flex flex-col">
            <div className="p-5 bg-black text-white shrink-0">
               <h2 className="font-space-grotesk font-black text-2xl uppercase tracking-widest">{state.productToCustomize?.name}</h2>
               <p className="font-inter font-bold text-gray-300">Pilih varian atau kustomisasi pesanan</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 hide-scrollbar">
               {state.productToCustomize?.variantIds?.map((vid: string) => {
                  const v = data.variants.find((vr: any) => vr.id === vid);
                  if (!v) return null;
                  
                  return (
                    <div key={v.id} className="flex flex-col gap-3">
                       <div className="flex items-center justify-between">
                         <Label className="font-space-grotesk font-black text-lg uppercase">{v.name}</Label>
                         {v.isRequired ? <span className="bg-[#FFD100] text-black text-[10px] font-black uppercase px-2 py-1 rounded border-2 border-black">Wajib</span> : <span className="text-gray-400 text-xs font-bold uppercase">Opsional</span>}
                       </div>
                       
                       <div className="grid grid-cols-2 gap-3">
                          {v.options.map((opt: any) => {
                             const isSelected = v.type === 'SINGLE_CHOICE' 
                               ? state.selectedVariants[v.id] === opt.name 
                               : (state.selectedVariants[v.id] || []).includes(opt.name);

                             return (
                               <button
                                 key={opt.name}
                                 onClick={() => {
                                   if (v.type === 'SINGLE_CHOICE') {
                                     state.setSelectedVariants({...state.selectedVariants, [v.id]: opt.name});
                                   } else {
                                     const curr = state.selectedVariants[v.id] || [];
                                     if (curr.includes(opt.name)) {
                                        state.setSelectedVariants({...state.selectedVariants, [v.id]: curr.filter((x:any) => x !== opt.name)});
                                     } else {
                                        state.setSelectedVariants({...state.selectedVariants, [v.id]: [...curr, opt.name]});
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
              <Button variant="outline" className="flex-1 h-14 font-black border-4 border-black shadow-[4px_4px_0_0_#000]" onClick={() => state.setIsCustomizeOpen(false)}>BATAL</Button>
              <Button onClick={handlers.handleAddCustomizedToCart} className="flex-1 h-14 bg-[#FF90E8] text-black font-black border-4 border-black shadow-[4px_4px_0_0_#000] hover:bg-pink-400">TAMBAH</Button>
            </div>
         </DialogContent>
       </Dialog>

       {/* RECEIPT MODAL */}
       <Dialog open={state.isReceiptOpen} onOpenChange={() => {}}>
         <DialogContent className="border-8 border-black rounded-[2rem] max-w-md bg-[#FFFDF7] p-0 overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="p-8 pb-4 flex flex-col items-center border-b-8 border-black bg-white">
               <div className="w-16 h-16 bg-[#00A19D] border-4 border-black rounded-full flex items-center justify-center mb-4 shadow-[4px_4px_0_0_#000]">
                 <CheckSquare className="w-8 h-8 text-black" strokeWidth={3} />
               </div>
               <h2 className="font-space-grotesk font-black text-3xl uppercase text-black text-center mb-1">Transaksi<br/>Selesai!</h2>
               <p className="font-inter font-bold text-gray-500 text-sm">Kembalian: {state.paymentMethod === 'TUNAI' ? formatRupiah(parseInt((state.cashGiven || '0').toString().replace(/\D/g, '')) - data.total) : 'Rp 0'}</p>
            </div>
            
            <div className="p-6 flex flex-col gap-4 bg-gray-100">
               {data.items.some((i: any) => data.recipes.find((r: any) => r.productId === i.product.id)) && (
                  <div className="flex flex-col gap-2 mb-2 p-4 bg-[#FFD100] border-4 border-black rounded-xl">
                      <span className="font-space-grotesk font-black uppercase text-sm flex items-center gap-2"><BookOpen className="w-4 h-4" /> Resep Terkait Order Ini</span>
                      <div className="flex flex-wrap gap-2">
                        {data.items.filter((i: any) => data.recipes.find((r: any) => r.productId === i.product.id)).map((i: any) => {
                           const r = data.recipes.find((r: any) => r.productId === i.product.id);
                           return (
                             <button 
                               key={i.id}
                               className="px-3 py-1.5 bg-white border-2 border-black rounded-md text-xs font-bold font-inter shadow-[2px_2px_0_0_#000] hover:translate-y-0.5 hover:shadow-none active:translate-y-1 transition-all"
                               onClick={() => {
                                 state.setRecipeItem({...i.product, recipe: r?.instructions});
                               }}
                             >
                               Resep: {i.product.name}
                             </button>
                           )
                        })}
                      </div>
                  </div>
               )}

               <div className="border-2 border-black rounded-xl max-h-64 overflow-y-auto bg-gray-50 mb-2 relative print-area">
                  <div className="p-4 bg-white min-h-[150px] font-mono text-sm shadow-sm" id="print-receipt-section">
                     <h3 className="font-space-grotesk font-black uppercase text-center text-lg mb-4 border-b-2 border-dashed border-gray-400 pb-2">NYAMAN COFFEE</h3>
                     <div className="flex flex-col gap-1 w-full text-xs">
                        <div className="flex justify-between w-full mb-2">
                           <span className="text-gray-500">2026-06-19</span>
                           <span className="text-gray-500 uppercase">{state.paymentMethod}</span>
                        </div>
                        {data.items.map((i: any) => {
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
                           <span>{formatRupiah(data.total)}</span>
                        </div>
                        {state.paymentMethod === 'TUNAI' && (
                          <>
                            <div className="flex justify-between mt-1 text-gray-500">
                               <span>TUNAI</span>
                               <span>{formatRupiah(parseInt((state.cashGiven || '0').toString().replace(/\D/g, '')))}</span>
                            </div>
                            <div className="flex justify-between mt-1 font-bold">
                               <span>KEMBALI</span>
                               <span>{formatRupiah(parseInt((state.cashGiven || '0').toString().replace(/\D/g, '')) - data.total)}</span>
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
               <Button className="w-full text-lg" onClick={handlers.finishTransaction}>TUTUP & SELESAI</Button>
            </div>
         </DialogContent>
       </Dialog>

       {/* RECIPE HELP MODAL */}
       <Dialog open={!!state.recipeItem} onOpenChange={(open) => !open && state.setRecipeItem(null)}>
         <DialogContent className="border-8 border-black rounded-[2rem] bg-[#FFD100] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <DialogHeader>
               <DialogTitle className="font-space-grotesk font-black text-2xl uppercase">Resep: {state.recipeItem?.name}</DialogTitle>
            </DialogHeader>
            <div className="bg-white border-4 border-black p-4 rounded-xl mt-4 font-inter font-bold whitespace-pre-wrap">
               {(state.recipeItem as any)?.recipe || "Tidak ada resep"}
            </div>
            <Button className="mt-4 border-white" onClick={() => state.setRecipeItem(null)}>MENGERTI</Button>
         </DialogContent>
       </Dialog>

       {/* BUKU RESEP UTAMA */}
       <Dialog open={state.isRecipeBookOpen} onOpenChange={state.setIsRecipeBookOpen}>
         <DialogContent className="border-8 border-black rounded-[2rem] bg-[#FFFDF7] p-0 overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[85vh] max-w-4xl flex flex-col">
            <div className="p-5 md:p-6 bg-[#FF90E8] border-b-8 border-black shrink-0">
               <DialogTitle className="font-space-grotesk font-black text-2xl md:text-3xl uppercase text-black text-center flex items-center justify-center gap-3">
                  <BookOpen className="w-8 h-8" /> Buku Resep Barista
               </DialogTitle>
            </div>
            <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 bg-gray-50 hide-scrollbar">
              {data.recipes.length === 0 ? (
                <div className="col-span-1 md:col-span-2 text-center text-gray-500 font-bold py-10">Belum ada resep yang dicatat pada menu.</div>
              ) : (
                data.recipes.map((recipe: any) => {
                  const product = data.products.find((p: any) => p.id === recipe.productId);
                  if (!product) return null;
                  const cat = data.categories.find((c: any) => c.id === product.categoryId);
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
               <Button onClick={() => state.setIsRecipeBookOpen(false)} className="px-8 text-lg w-full md:w-auto">TUTUP BUKU RESEP</Button>
            </div>
         </DialogContent>
       </Dialog>

       <ConfirmDialog 
         open={state.confirmPaymentOpen}
         onOpenChange={state.setConfirmPaymentOpen}
         onConfirm={handlers.handleProcessPayment}
         title="Konfirmasi Pembayaran"
         description={`Apakah Anda yakin ingin memproses pembayaran ini? Tagihan: ${formatRupiah(data.total)} menggunakan metode ${state.paymentMethod}.`}
       />

       {/* CUSTOM ITEM MODAL */}
       <Dialog open={state.customItemOpen} onOpenChange={state.setCustomItemOpen}>
         <DialogContent className="border-8 border-black rounded-[2rem] bg-[#FFFDF7] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
           <DialogHeader>
             <DialogTitle className="font-space-grotesk font-black text-2xl uppercase">Tambah Custom Item</DialogTitle>
           </DialogHeader>
           <div className="flex flex-col gap-4 mt-4">
             <div className="flex flex-col gap-2">
               <Label>Nama Item</Label>
               <Input value={state.customName} onChange={e => state.setCustomName(e.target.value)} placeholder="Contoh: Plastik Tambahan" />
             </div>
             <div className="flex flex-col gap-2">
               <Label>Harga</Label>
               <Input 
                 value={state.customPrice ? formatRupiah(parseInt(state.customPrice)) : ''} 
                 onChange={e => state.setCustomPrice(e.target.value.replace(/\D/g, ''))} 
                 inputMode="numeric"
                 placeholder="Rp 0" 
               />
             </div>
             <Button onClick={handlers.handleAddCustomItem} className="mt-4 bg-[#00E5FF] text-black hover:bg-cyan-400 font-bold">TAMBAH KE KERANJANG</Button>
           </div>
         </DialogContent>
       </Dialog>

       {/* SAVE BILL MODAL */}
       <Dialog open={state.saveBillOpen} onOpenChange={state.setSaveBillOpen}>
         <DialogContent className="border-8 border-black rounded-[2rem] bg-[#FFFDF7] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
           <DialogHeader>
             <DialogTitle className="font-space-grotesk font-black text-2xl uppercase">Simpan Open Tab</DialogTitle>
           </DialogHeader>
           <div className="flex flex-col gap-4 mt-4">
             <div className="flex flex-col gap-2">
               <Label>Nama Pemesan / No Meja</Label>
               <Input value={state.billName} onChange={e => state.setBillName(e.target.value)} placeholder="Contoh: Meja 4 / Budi" />
             </div>
             <Button onClick={handlers.handleSaveBill} className="mt-4 bg-[#FFD100] text-black hover:bg-yellow-400 font-bold">SIMPAN TAGIHAN</Button>
           </div>
         </DialogContent>
       </Dialog>

       {/* LOAD BILL MODAL */}
       <Dialog open={state.loadBillOpen} onOpenChange={state.setLoadBillOpen}>
         <DialogContent className="border-8 border-black rounded-[2rem] bg-[#FFFDF7] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[80vh] flex flex-col">
           <DialogHeader className="shrink-0">
             <DialogTitle className="font-space-grotesk font-black text-2xl uppercase">Tagihan Tersimpan ({data.savedBills.length})</DialogTitle>
           </DialogHeader>
           <div className="flex flex-col gap-3 mt-4 overflow-y-auto">
             {data.savedBills.length === 0 ? (
               <div className="text-center py-8 text-gray-500 font-bold">Belum ada tagihan yang disimpan.</div>
             ) : (
               data.savedBills.map((bill: any) => (
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
                         if (data.items.length > 0) {
                           toast.error('Gagal', { description: 'Harap kosongkan keranjang saat ini terlebih dahulu.' });
                           return;
                         }
                         loadBill(bill.id);
                         state.setLoadBillOpen(false);
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

       {/* DISCOUNT MODAL */}
       <Dialog open={state.isDiscountOpen} onOpenChange={(open) => {
         state.setIsDiscountOpen(open);
         if (open) {
           state.setDiscountTypeForm(data.discountType);
           state.setDiscountValueForm(data.discountValue ? data.discountValue.toString() : '');
         }
       }}>
         <DialogContent className="border-8 border-black rounded-[2rem] bg-[#FFFDF7] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
           <DialogHeader>
             <DialogTitle className="font-space-grotesk font-black text-2xl uppercase">Pengaturan Diskon</DialogTitle>
           </DialogHeader>
           <div className="flex flex-col gap-4 mt-4">
             <div className="grid grid-cols-3 gap-2">
               <Button 
                 variant={state.discountTypeForm === null ? 'default' : 'outline'} 
                 onClick={() => { state.setDiscountTypeForm(null); state.setDiscountValueForm(''); }}
                 className={cn(state.discountTypeForm === null && "bg-black text-white hover:bg-gray-800 border-2 border-black")}
               >Tanpa Diskon</Button>
               <Button 
                 variant={state.discountTypeForm === 'PERCENTAGE' ? 'default' : 'outline'} 
                 onClick={() => state.setDiscountTypeForm('PERCENTAGE')}
                 className={cn(state.discountTypeForm === 'PERCENTAGE' && "bg-[#FF90E8] text-black border-2 border-black hover:bg-pink-300")}
               >Persen (%)</Button>
               <Button 
                 variant={state.discountTypeForm === 'NOMINAL' ? 'default' : 'outline'} 
                 onClick={() => state.setDiscountTypeForm('NOMINAL')}
                 className={cn(state.discountTypeForm === 'NOMINAL' && "bg-[#FFD100] text-black border-2 border-black hover:bg-yellow-400")}
               >Nominal (Rp)</Button>
             </div>
             
             {state.discountTypeForm && (
               <div className="flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
                 <Label>Nilai Diskon</Label>
                 <Input 
                   value={state.discountTypeForm === 'NOMINAL' && state.discountValueForm ? formatRupiah(parseInt(state.discountValueForm.replace(/\D/g, ''))) : state.discountValueForm}
                   onChange={e => {
                     const val = e.target.value.replace(/\D/g, '');
                     if (state.discountTypeForm === 'PERCENTAGE' && parseInt(val) > 100) return;
                     state.setDiscountValueForm(val);
                   }}
                   inputMode="numeric"
                   placeholder={state.discountTypeForm === 'PERCENTAGE' ? 'Contoh: 10' : 'Contoh: 15000'} 
                 />
               </div>
             )}
             
             <Button onClick={handlers.handleApplyDiscount} className="mt-4 bg-[#00E5FF] text-black hover:bg-cyan-400 font-bold">TERAPKAN DISKON</Button>
           </div>
         </DialogContent>
       </Dialog>

       <ConfirmDialog 
         open={state.clearConfirmOpen} 
         onOpenChange={state.setClearConfirmOpen}
         title="Kosongkan Keranjang?"
         description="Semua pesanan yang belum dibayar akan dihapus."
         onConfirm={clearCart}
       />
    </>
  );
}
