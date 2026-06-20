import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const formatRupiah = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

interface PaymentModalProps {
  isPaymentOpen: boolean;
  setIsPaymentOpen: (val: boolean) => void;
  paymentMethod: 'TUNAI' | 'QRIS' | null;
  setPaymentMethod: (val: 'TUNAI' | 'QRIS' | null) => void;
  cashGiven: string;
  setCashGiven: (val: string) => void;
  qrisRef: string;
  setQrisRef: (val: string) => void;
  handleOpenPaymentConfirm: () => void;
  total: number;
}

export function PaymentModal({
  isPaymentOpen,
  setIsPaymentOpen,
  paymentMethod,
  setPaymentMethod,
  cashGiven,
  setCashGiven,
  qrisRef,
  setQrisRef,
  handleOpenPaymentConfirm,
  total
}: PaymentModalProps) {
  return (
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
  );
}
