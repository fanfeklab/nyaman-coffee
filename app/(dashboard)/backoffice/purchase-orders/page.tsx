'use client';

import React, { useState } from 'react';
import { useInventoryStore, Supplier, PurchaseOrder } from '@/store/useInventoryStore';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Warehouse, Plus, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function PurchaseOrdersPage() {
  const { rawMaterials, purchaseOrders, addPurchaseOrder, updatePurchaseOrderStatus, suppliers, addSupplier } = useInventoryStore();
  const { user } = useAuthStore();
  
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  
  // PO Form State
  const [targetSupplierId, setTargetSupplierId] = useState('');
  const [poItems, setPoItems] = useState<{ rawMaterialId: string; qty: number; price: number }[]>([]);

  // Supplier Form State
  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');

  const handleOpenPOModal = () => {
    if (suppliers.length === 0) {
      toast.error('Harap tambahkan data supplier terlebih dahulu.');
      return;
    }
    setTargetSupplierId(suppliers[0].id);
    setPoItems([]);
    setIsPOModalOpen(true);
  };

  const handleAddItemToPO = () => {
    if (rawMaterials.length === 0) return;
    setPoItems([...poItems, { rawMaterialId: rawMaterials[0].id, qty: 1, price: 0 }]);
  };

  const handleRemovePOItem = (index: number) => {
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  const handlePOItemChange = (index: number, field: 'rawMaterialId' | 'qty' | 'price', value: any) => {
    const newItems = [...poItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setPoItems(newItems);
  };

  const handleSubmitPO = () => {
    if (poItems.length === 0) {
      toast.error('PO harus memiliki minimal 1 barang.');
      return;
    }
    for (const item of poItems) {
      if (item.qty <= 0) {
        toast.error('Kuantitas barang harus lebih dari 0.');
        return;
      }
    }

    const totalAmount = poItems.reduce((acc, item) => acc + (item.qty * item.price), 0);

    addPurchaseOrder({
      id: 'po_' + Date.now().toString(36).toUpperCase(),
      date: new Date().toISOString(),
      supplierId: targetSupplierId,
      items: poItems,
      totalAmount,
      status: 'PENDING',
      createdBy: user?.fullName || 'Admin'
    });

    toast.success('Purchase Order berhasil dibuat.');
    setIsPOModalOpen(false);
  };

  const handleSubmitSupplier = () => {
    if (!supplierName) {
      toast.error('Nama supplier wajib diisi');
      return;
    }
    addSupplier({
      id: 'sup_' + Date.now().toString(36),
      name: supplierName,
      contact: supplierContact,
      address: ''
    });
    toast.success('Supplier baru berhasil ditambahkan.');
    setSupplierName('');
    setSupplierContact('');
    setIsSupplierModalOpen(false);
  };

  const handleCompletePO = (poId: string) => {
    updatePurchaseOrderStatus(poId, 'COMPLETED');
    toast.success('Purchase Order selesai! Stok bahan baku telah ditambahkan.');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 md:p-6 border-4 border-black shadow-[4px_4px_0_0_#000] rounded-xl gap-4">
        <div>
          <h1 className="text-3xl font-space-grotesk font-black uppercase text-black">Purchase Orders</h1>
          <p className="text-gray-600 font-inter font-bold mt-1">Manajemen PO & Supplier</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 md:gap-4 w-full md:w-auto">
          <Button onClick={() => setIsSupplierModalOpen(true)} variant="outline" size="lg" className="border-2 border-black w-full sm:w-auto">
            + SUPPLIER BARU
          </Button>
          <Button onClick={handleOpenPOModal} size="lg" className="border-2 border-black bg-[#FFD100] text-black hover:bg-[#FFD100]/80 w-full sm:w-auto">
            BUAT PO BARU
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 border-4 border-black shadow-[4px_4px_0_0_#000] rounded-xl overflow-x-auto">
          <h2 className="text-xl font-space-grotesk font-black uppercase text-black mb-4">Daftar Purchase Order</h2>
          {purchaseOrders.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
              <Warehouse className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              <p className="font-inter font-bold text-gray-500">Belum ada Purchase Order.</p>
            </div>
          ) : (
             <div className="space-y-4">
               {purchaseOrders.map(po => {
                 const supplier = suppliers.find(s => s.id === po.supplierId);
                 return (
                   <div key={po.id} className="p-4 border-2 border-black rounded-xl">
                     <div className="flex justify-between items-start mb-4 border-b-2 border-dashed border-gray-200 pb-2">
                       <div>
                         <p className="font-space-grotesk font-black text-xl">{po.id}</p>
                         <p className="font-inter font-bold text-gray-500 text-sm">Supplier: {supplier?.name || 'Unknown'} • Tanggal: {new Date(po.date).toLocaleDateString()}</p>
                       </div>
                       <div className="text-right">
                         <div className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase border-2 border-black ${po.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : po.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                           {po.status}
                         </div>
                         <p className="font-mono font-black text-lg mt-1">Rp {po.totalAmount.toLocaleString('id-ID')}</p>
                       </div>
                     </div>
                     <Table className="w-full text-left font-inter text-sm mb-4">
                       <TableHeader>
                         <TableRow className="border-b border-gray-200">
                           <TableHead className="py-2 text-gray-500">Item</TableHead>
                           <TableHead className="py-2 text-gray-500 text-right">Qty</TableHead>
                           <TableHead className="py-2 text-gray-500 text-right">Harga Unit</TableHead>
                           <TableHead className="py-2 text-gray-500 text-right">Total</TableHead>
                         </TableRow>
                       </TableHeader>
                       <TableBody>
                         {po.items.map((item, idx) => {
                           const rm = rawMaterials.find(r => r.id === item.rawMaterialId);
                           return (
                             <TableRow key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                               <TableCell className="py-2 font-bold">{rm?.name || 'Unknown'}</TableCell>
                               <TableCell className="py-2 text-right">{item.qty} {rm?.unit}</TableCell>
                               <TableCell className="py-2 text-right">Rp {item.price.toLocaleString()}</TableCell>
                               <TableCell className="py-2 text-right font-black">Rp {(item.qty * item.price).toLocaleString()}</TableCell>
                             </TableRow>
                           );
                         })}
                       </TableBody>
                     </Table>
                     
                     {po.status === 'PENDING' && (
                       <div className="flex justify-end gap-2 border-t-2 border-dashed border-gray-200 pt-4">
                         <Button variant="outline" onClick={() => updatePurchaseOrderStatus(po.id, 'CANCELLED')} className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">Batalkan PO</Button>
                         <Button onClick={() => handleCompletePO(po.id)} className="bg-black text-white">Terima Barang (Selesai)</Button>
                       </div>
                     )}
                   </div>
                 );
               })}
             </div>
          )}
        </div>
      </div>

      {/* PO Modal */}
      <Dialog open={isPOModalOpen} onOpenChange={setIsPOModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buat Purchase Order Baru</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Supplier</Label>
              <Select value={targetSupplierId} onValueChange={(val) => setTargetSupplierId(val || '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} - {s.contact}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="border-t-2 border-dashed border-gray-200 pt-4 mt-2">
              <div className="flex justify-between items-center mb-4">
                <Label className="text-lg">Daftar Barang (Bahan Baku)</Label>
                <Button onClick={handleAddItemToPO} variant="outline" size="sm" className="border-2 border-black">
                  <Plus className="w-4 h-4 mr-1" /> Tambah Item
                </Button>
              </div>
              
              {poItems.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
                  <p className="font-inter text-gray-500 text-sm">Belum ada barang di PO ini.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {poItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end border-2 border-gray-100 p-3 rounded-lg bg-gray-50">
                      <div className="grid gap-1 flex-1">
                        <Label className="text-xs">Bahan Baku</Label>
                        <Select value={item.rawMaterialId} onValueChange={(val) => handlePOItemChange(index, 'rawMaterialId', val)}>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Pilih Bahan" />
                          </SelectTrigger>
                          <SelectContent>
                            {rawMaterials.map(rm => (
                              <SelectItem key={rm.id} value={rm.id}>{rm.name} ({rm.unit})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-1 w-24">
                        <Label className="text-xs">Qty</Label>
                        <Input 
                          type="number" min="1" 
                          value={item.qty || ''} 
                          onChange={(e) => handlePOItemChange(index, 'qty', Number(e.target.value))}
                          className="bg-white"
                        />
                      </div>
                      <div className="grid gap-1 w-32">
                        <Label className="text-xs">Harga / Unit</Label>
                        <Input 
                          type="number" min="0" 
                          value={item.price === 0 ? '' : item.price} 
                          onChange={(e) => handlePOItemChange(index, 'price', Number(e.target.value))}
                          className="bg-white"
                        />
                      </div>
                      <Button onClick={() => handleRemovePOItem(index)} variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 mb-0.5">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}
                  <div className="text-right font-space-grotesk font-black text-xl pt-2">
                    Total: Rp {poItems.reduce((acc, item) => acc + (item.qty * item.price), 0).toLocaleString('id-ID')}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPOModalOpen(false)}>BATAL</Button>
            <Button onClick={handleSubmitPO} className="bg-black text-white px-8">SIMPAN PO</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supplier Modal */}
      <Dialog open={isSupplierModalOpen} onOpenChange={setIsSupplierModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Supplier Baru</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nama Supplier</Label>
              <Input
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Contoh: PT. Biji Kopi Nusantara"
              />
            </div>
            <div className="grid gap-2">
              <Label>Kontak (No. HP / Email)</Label>
              <Input
                value={supplierContact}
                onChange={(e) => setSupplierContact(e.target.value)}
                placeholder="Contoh: 081234567890"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSupplierModalOpen(false)}>BATAL</Button>
            <Button onClick={handleSubmitSupplier} className="bg-black text-white px-8">SIMPAN</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
