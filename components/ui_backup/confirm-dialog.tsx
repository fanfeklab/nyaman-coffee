import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-8 border-black rounded-[2rem] bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm">
        <DialogHeader className="flex flex-col items-center flex-grow pt-4">
          <AlertCircle className="w-16 h-16 text-red-500 mb-2" strokeWidth={2.5} />
          <DialogTitle className="font-space-grotesk font-black text-2xl uppercase text-center mt-2">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-2 text-center text-gray-600 font-inter font-bold text-sm">
          {description}
        </div>
        <div className="mt-6 flex flex-col gap-3 w-full">
          <Button 
            className="w-full h-14 font-space-grotesk font-black text-lg bg-[#FF6321] hover:bg-[#ff7a40] text-white border-4 border-black shadow-[4px_4px_0_0_#000] uppercase" 
            onClick={() => { onConfirm(); onOpenChange(false); }}
          >
            {confirmLabel}
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-14 font-space-grotesk font-black text-lg bg-white hover:bg-gray-50 border-4 border-black shadow-[4px_4px_0_0_#000] uppercase" 
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
