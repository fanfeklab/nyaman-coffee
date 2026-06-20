import React from "react";
import { Plus, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";
import { Category, Product } from "@/store/useInventoryStore";
import { Button } from "@/components/ui/button";
import { ViewOption } from "./PosHeader";

const formatRupiah = (val: number) => 
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(val);

interface PosProductGridProps {
  filteredProducts: Product[];
  categories: Category[];
  viewOption: ViewOption;
  handleProductClick: (p: Product) => void;
}

export function PosProductGrid({ filteredProducts, categories, viewOption, handleProductClick }: PosProductGridProps) {
  return (
    <div className="flex-1 overflow-y-auto pr-2 pb-32">
       <div className={cn("grid gap-4 md:gap-6 pt-1 pl-1", viewOption === "Grid" ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-5" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3")}>
          {filteredProducts.map(p => {
            const cat = categories.find(c => c.id === p.categoryId);
            
            if (viewOption === "Compact") {
              return (
                <div 
                  key={p.id}
                  onClick={() => handleProductClick(p)}
                  className="bg-white border-4 border-black rounded-2xl p-4 flex justify-between items-center cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-2 active:translate-x-2 transition-all select-none group"
                >
                   <div className="flex flex-col">
                     <span className="font-space-grotesk font-black uppercase text-black line-clamp-1 text-lg mb-1">{p.name}</span>
                     <div className="flex items-center gap-2">
                       <span className="font-inter font-black text-[#FF6321]">{formatRupiah(p.basePrice)}</span>
                       {cat && (
                         <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-2 border-black rounded-md" style={{ backgroundColor: cat.color }}>
                            {cat.name}
                         </span>
                       )}
                     </div>
                   </div>
                   <Button variant="outline" className="h-10 w-10 p-0 border-2 border-black bg-[#FFD100] group-hover:bg-[#FFD100]">
                     <Plus className="w-5 h-5 text-black" />
                   </Button>
                </div>
              );
            }

            // Grid View (Default)
            return (
              <div 
                key={p.id}
                onClick={() => handleProductClick(p)}
                className="bg-white border-4 border-black rounded-2xl p-4 flex flex-col cursor-pointer shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-2 active:translate-x-2 transition-all select-none group"
              >
                 <div className="w-full aspect-square bg-gray-100 border-4 border-black rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                    {p.image ? (
                       <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    ) : (
                       <Coffee className="w-12 h-12 text-gray-300" />
                    )}
                 </div>
                 <span className="font-space-grotesk font-black uppercase text-black line-clamp-2 flex-grow mb-1">{p.name}</span>
                 <span className="font-inter font-black text-[#FF6321]">{formatRupiah(p.basePrice)}</span>
                 {cat && (
                   <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 border-2 border-black rounded-md w-max mt-2" style={{ backgroundColor: cat.color }}>
                      {cat.name}
                   </span>
                 )}
              </div>
            )
          })}
       </div>
    </div>
  );
}
