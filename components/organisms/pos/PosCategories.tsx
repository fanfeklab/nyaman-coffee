import React from "react";
import { cn } from "@/lib/utils";
import { Category } from "@/store/useInventoryStore";

interface PosCategoriesProps {
  categories: Category[];
  activeCategory: string;
  setActiveCategory: (val: string) => void;
}

export function PosCategories({ categories, activeCategory, setActiveCategory }: PosCategoriesProps) {
  return (
    <div className="flex gap-3 mb-4 md:mb-6 overflow-x-auto pb-2 shrink-0 hide-scrollbar pt-1 pl-1">
       <button 
         onClick={() => setActiveCategory("all")}
         className={cn(
           "whitespace-nowrap px-6 py-3 border-4 border-black rounded-xl font-space-grotesk font-black uppercase text-sm active:translate-y-1 transition-all",
           activeCategory === "all" ? "bg-black text-white shadow-none translate-y-1" : "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1"
         )}
       >
         Semua
       </button>
       {categories.map(c => (
         <button 
           key={c.id}
           onClick={() => setActiveCategory(c.id)}
           style={{ backgroundColor: activeCategory === c.id ? c.color : "white" }}
           className={cn(
             "whitespace-nowrap px-6 py-3 border-4 border-black rounded-xl font-space-grotesk font-black uppercase text-sm transition-all",
             activeCategory === c.id ? "text-black shadow-none translate-y-1" : "text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1 active:translate-y-1"
           )}
         >
           {c.name}
         </button>
       ))}
    </div>
  );
}
