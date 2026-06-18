'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [newPin, setNewPin] = useState('');
  
  useEffect(() => {
    if (user) setFullName(user.fullName);
  }, [user]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      toast.error('Nama Lengkap tidak boleh kosong!');
      return;
    }
    
    updateProfile(fullName, newPin || undefined);
    setNewPin(''); // Reset after apply
    toast.success('Profil berhasil diperbaharui!');
  };

  if (!user) return null;

  return (
    <div className="p-6 md:p-12 max-w-xl mx-auto flex flex-col gap-8">
      <div className="bg-white border-4 border-black p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
         <h1 className="font-space-grotesk font-black text-3xl uppercase tracking-widest text-black mb-2">Profil Saya</h1>
         <p className="font-inter font-bold text-gray-600 mb-6 text-sm">Ubah detail akun personal Anda.</p>
         
         <form onSubmit={handleUpdate} className="flex flex-col gap-6">
           <div className="flex flex-col gap-2">
              <Label>Nama Lengkap</Label>
              <Input 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Nama Anda"
              />
           </div>

           <div className="flex flex-col gap-2">
              <Label>Ubah PIN Akses (Opsional)</Label>
              <Input 
                value={newPin}
                onChange={e => setNewPin(e.target.value)}
                placeholder="Kosongkan jika tidak ingin mengubah"
                type="password"
                maxLength={4}
              />
              <small className="font-inter font-bold text-gray-500">Maksimum 4 digit angka.</small>
           </div>
           
           <Button type="submit" className="w-full mt-2">
              SIMPAN PERUBAHAN
           </Button>
         </form>
      </div>
    </div>
  );
}
