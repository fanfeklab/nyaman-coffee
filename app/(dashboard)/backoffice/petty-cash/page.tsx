'use client';

import React, { useState } from 'react';
import { useShiftStore } from '@/store/useShiftStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Wallet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PettyCashPage() {
  const { currentShift, pettyCashHistory, addPettyCash } = useShiftStore();
  const { user } = useAuthStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'IN' | 'OUT'>('OUT');
  const [note, setNote] = useState('');

  const handleOpenModal = (trxType: 'IN' | 'OUT') => {
    if (!currentShift || currentShift.status !== 'OPEN') {
      toast.error('Tidak ada shift aktif. Harap buka shift terlebih dahulu di halaman Shift.');
      return;
    }
    setType(trxType);
    setAmount('');
    setNote('');
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Nominal harus lebih besar dari 0');
      return;
    }
    if (!note) {
      toast.error('Keterangan wajib diisi');
      return;
    }

    if (type === 'OUT' && currentShift!.expectedEndingCash < Number(amount)) {
      toast.error('Saldo laci tidak mencukupi untuk penarikan.');
      return;
    }

    addPettyCash(user?.fullName || 'Kasir', Number(amount), type, note);
    toast.success(`Transaksi petty cash (${type === 'IN' ? 'Kas Masuk' : 'Kas Keluar'}) berhasil dicatat.`);
    setIsModalOpen(false);
  };

  // Filter history to current shift
  const currentShiftTransactions = pettyCashHistory.filter(tx => tx.shiftId === currentShift?.id);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 md:p-6 border-4 border-black shadow-[4px_4px_0_0_#000] rounded-xl gap-4">
        <div>
          <h1 className="text-3xl font-space-grotesk font-black uppercase text-black">Kas Laci Darurat</h1>
          <p className="text-gray-600 font-inter font-bold mt-1">Pencatatan uang masuk/keluar di luar transaksi penjualan</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 md:gap-4 w-full md:w-auto">
          <Button onClick={() => handleOpenModal('OUT')} size="lg" className="border-2 border-black bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto">
            KAS KELUAR
          </Button>
          <Button onClick={() => handleOpenModal('IN')} size="lg" className="border-2 border-black bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto">
            KAS MASUK
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white p-6 border-4 border-black shadow-[4px_4px_0_0_#000] rounded-xl">
           <h2 className="text-xl font-space-grotesk font-black uppercase text-black mb-4">Informasi Laci Saat Ini</h2>
           {currentShift && currentShift.status === 'OPEN' ? (
             <div className="space-y-4">
               <div>
                  <p className="font-space-grotesk text-xs uppercase tracking-widest text-gray-500">Saldo Fisik Ekspektasi</p>
                  <p className="font-mono text-3xl font-black text-black">Rp {currentShift.expectedEndingCash.toLocaleString('id-ID')}</p>
               </div>
               <div className="border-t-2 border-dashed border-gray-200 pt-4">
                  <p className="font-space-grotesk text-xs uppercase tracking-widest text-gray-500">Shift ID</p>
                  <p className="font-mono text-sm font-bold text-black">{currentShift.id}</p>
               </div>
             </div>
           ) : (
              <div className="text-center py-6 bg-red-50 border-2 border-dashed border-red-200 rounded-xl">
                <p className="font-inter font-bold text-red-500">SHIFT TUTUP</p>
                <p className="text-sm mt-1 text-red-400">Kas tidak bisa dicatat</p>
              </div>
           )}
        </div>

        <div className="md:col-span-2 bg-white p-6 border-4 border-black shadow-[4px_4px_0_0_#000] rounded-xl">
          <h2 className="text-xl font-space-grotesk font-black uppercase text-black mb-4">Riwayat Kas Laci (Shift Saat Ini)</h2>
          {currentShiftTransactions.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
              <Wallet className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              <p className="font-inter font-bold text-gray-500">Belum ada transaksi petty cash.</p>
            </div>
          ) : (
             <div className="space-y-4">
               {currentShiftTransactions.map(tx => (
                 <div key={tx.id} className="flex items-center justify-between p-4 border-2 border-black rounded-xl hover:bg-gray-50 transition-colors">
                   <div className="flex items-center gap-4">
                      {tx.type === 'IN' ? (
                        <ArrowDownCircle className="w-8 h-8 text-green-500" />
                      ) : (
                        <ArrowUpCircle className="w-8 h-8 text-red-500" />
                      )}
                      <div>
                        <p className="font-space-grotesk font-black text-lg">{tx.note}</p>
                        <p className="font-inter font-bold text-gray-500 text-sm">{new Date(tx.timestamp).toLocaleString('id-ID')} • Oleh: {tx.cashierId}</p>
                      </div>
                   </div>
                   <div className="text-right">
                     <p className={`font-mono text-xl font-black ${tx.type === 'IN' ? 'text-green-500' : 'text-red-500'}`}>
                        {tx.type === 'IN' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                     </p>
                   </div>
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{type === 'IN' ? 'Transaksi Kas Masuk' : 'Transaksi Kas Keluar'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Nominal (Rp)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Contoh: 50000"
                className="font-mono text-lg font-bold"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note">Keterangan / Alasan</Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={type === 'OUT' ? "Contoh: Beli es batu darurat" : "Contoh: Uang kembalian dari bos"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>BATAL</Button>
            <Button onClick={handleSubmit} className="bg-black text-white px-8">SIMPAN TRANSAKSI</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
