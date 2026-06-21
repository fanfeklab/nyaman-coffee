'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function DeviceLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Device registered successfully.');
        router.push('/login'); // Proceed to Cashier PIN login
      }
    } catch (err: any) {
      toast.error('Login Failed', { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white p-8 border-4 border-black shadow-[8px_8px_0_0_#000] rounded-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-space-grotesk tracking-tight">Nyaman POS</h1>
          <p className="text-gray-600 mt-2">Device Registration / Manager Login</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Manager Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 border-black"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-2 border-black"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 text-lg border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register Device'}
          </Button>
        </form>
      </div>
    </div>
  );
}
