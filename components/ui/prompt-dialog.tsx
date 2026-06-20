import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';

interface PromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  placeholder?: string;
  type?: string;
  onConfirm: (value: string) => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function PromptDialog({
  open,
  onOpenChange,
  title,
  description,
  placeholder = '',
  type = 'text',
  onConfirm,
  confirmLabel = 'Oke',
  cancelLabel = 'Batal',
}: PromptDialogProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (open) {
      setValue('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-8 border-black rounded-[2rem] bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm">
        <DialogHeader className="flex flex-col items-center pt-4">
          <AlertCircle className="w-16 h-16 text-[#FFD100] mb-2" strokeWidth={2.5} />
          <DialogTitle className="font-space-grotesk font-black text-2xl uppercase text-center mt-2">
            {title}
          </DialogTitle>
        </DialogHeader>
        {description && (
          <div className="py-2 text-center text-gray-600 font-inter font-bold text-sm">
            {description}
          </div>
        )}
        <div className="py-2 w-full">
          <Input 
            type={type}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full text-center border-4 border-black font-bold h-12"
            autoFocus
          />
        </div>
        <div className="mt-4 flex flex-col gap-3 w-full">
          <Button 
            className="w-full h-12 font-space-grotesk font-black text-lg bg-black hover:bg-gray-800 text-white border-4 border-black shadow-[4px_4px_0_0_#000] uppercase" 
            onClick={() => { onConfirm(value); onOpenChange(false); }}
          >
            {confirmLabel}
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-12 font-space-grotesk font-black text-lg bg-white hover:bg-gray-50 border-4 border-black shadow-[4px_4px_0_0_#000] uppercase" 
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
