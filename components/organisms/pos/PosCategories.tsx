import React from "react";
import { cn } from "@/lib/utils";
import { Category } from "@/store/useInventoryStore";
import { Button } from "@/components/ui/button";

interface PosCategoriesProps {
  categories: Category[];
  activeCategory: string;
  setActiveCategory: (val: string) => void;
}

export function PosCategories({ categories, activeCategory, setActiveCategory }: PosCategoriesProps) {
  return (
    <div className="flex gap-3 mb-4 md:mb-6 overflow-x-auto pb-2 shrink-0 hide-scrollbar pt-1 pl-1">
       <Button 
         onClick={() => setActiveCategory("all")}
         variant={activeCategory === "all" ? "default" : "outline"}
         className={cn(
           activeCategory === "all" ? "bg-black text-white hover:bg-gray-800" : ""
         )}
       >
         Semua
       </Button>
       {categories.map(c => (
         <Button 
           key={c.id}
           onClick={() => setActiveCategory(c.id)}
           variant={activeCategory === c.id ? "default" : "outline"}
           style={{ backgroundColor: activeCategory === c.id ? c.color : "white" }}
         >
           {c.name}
         </Button>
       ))}
    </div>
  );
}
