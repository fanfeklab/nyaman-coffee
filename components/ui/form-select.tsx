import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface FormSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
}

/**
 * A higher-level wrapper around the Base UI / Shadcn Select components.
 * This guarantees consistent styling (Neobrutalism), correct label rendering 
 * (automatically fixing the raw ID render bug), and a much simpler API.
 */
export function FormSelect({ value, onValueChange, options, placeholder, className }: FormSelectProps) {
  // Find the selected option to force the correct label text in SelectValue
  const selectedOption = options.find(o => o.value === value);

  return (
    <Select value={value} onValueChange={(val) => onValueChange(val || "")}>
      <SelectTrigger className={cn("flex h-12 w-full rounded-md border-2 border-black bg-white px-3 py-2 text-sm focus:outline-none focus:ring-0 truncate font-bold text-left overflow-hidden", className)}>
        <SelectValue placeholder={placeholder}>
          {selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              {selectedOption.icon}
              <span className="truncate">{selectedOption.label}</span>
            </div>
          ) : undefined}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="border-4 border-black rounded-xl shadow-[4px_4px_0_0_#000] font-inter font-bold z-[100]">
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            <div className="flex items-center gap-2 truncate">
              {opt.icon}
              <span className="truncate">{opt.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
