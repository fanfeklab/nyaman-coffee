import React from "react";
import { Search, Plus, BookOpen, Check, Filter, Grid3X3, AlignJustify, ArrowDownAZ, ArrowUpZA, ArrowDown10, ArrowUp01 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type SortOption = "A-Z" | "Z-A" | "Highest" | "Lowest";
export type ViewOption = "Grid" | "Compact";

interface PosHeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  sortOption: SortOption;
  handleSortChange: (opt: SortOption) => void;
  viewOption: ViewOption;
  handleViewChange: (opt: ViewOption) => void;
  setCustomItemOpen: (val: boolean) => void;
  setIsRecipeBookOpen: (val: boolean) => void;
}

export function PosHeader({
  searchQuery,
  setSearchQuery,
  sortOption,
  handleSortChange,
  viewOption,
  handleViewChange,
  setCustomItemOpen,
  setIsRecipeBookOpen
}: PosHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4 md:mb-6 shrink-0 z-10 relative">
       <div className="relative flex-grow">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
         <Input 
           placeholder="Cari Menu..." 
           className="pl-10 h-12 border-4 border-black text-lg bg-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
         />
       </div>
       
       <div className="flex items-center gap-2 md:gap-3 flex-wrap">
           <Popover>
             <PopoverTrigger className="h-12 w-12 border-4 border-black shadow-[4px_4px_0_0_#000] p-0 flex items-center justify-center rounded-xl bg-white hover:bg-gray-100 transition-colors" title="Urutkan" type="button">
               <Filter className="w-5 h-5"/>
             </PopoverTrigger>
             <PopoverContent align="end" className="w-56 p-2 border-4 border-black shadow-[4px_4px_0_0_#000] rounded-2xl bg-white">
                <div className="flex flex-col gap-1">
                  <span className="font-space-grotesk font-black uppercase text-xs tracking-widest text-gray-500 mb-2 px-2">Urutkan Berdasarkan</span>
                  {[
                    { id: "A-Z", label: "Nama A - Z", icon: ArrowDownAZ },
                    { id: "Z-A", label: "Nama Z - A", icon: ArrowUpZA },
                    { id: "Highest", label: "Harga Tertinggi", icon: ArrowDown10 },
                    { id: "Lowest", label: "Harga Terendah", icon: ArrowUp01 },
                  ].map(opt => (
                     <Button 
                       key={opt.id}
                       variant="ghost"
                       onClick={() => handleSortChange(opt.id as SortOption)}
                       className={cn("flex justify-start h-auto items-center gap-2 px-3 py-2 text-sm font-inter font-bold rounded-xl text-left transition-colors", sortOption === opt.id ? "bg-[#00E5FF] border-2 border-black hover:bg-[#00E5FF]/80 text-black hover:text-black" : "hover:bg-gray-100 border-2 border-transparent text-black")}
                     >
                       <opt.icon className="w-4 h-4"/>
                       {opt.label}
                       {sortOption === opt.id && <Check className="w-4 h-4 ml-auto"/>}
                     </Button>
                  ))}
                </div>
             </PopoverContent>
           </Popover>

           <div className="flex items-center bg-white border-4 border-black rounded-xl p-1 shadow-[4px_4px_0_0_#000]">
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => handleViewChange("Grid")}
                className={cn("p-2 rounded-lg transition-colors h-10 w-10", viewOption === "Grid" ? "bg-black text-white hover:bg-black/90 hover:text-white" : "text-gray-500 hover:text-black")}
                title="Tampilan Grid (Gambar)"
              >
                <Grid3X3 className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => handleViewChange("Compact")}
                className={cn("p-2 rounded-lg transition-colors h-10 w-10", viewOption === "Compact" ? "bg-black text-white hover:bg-black/90 hover:text-white" : "text-gray-500 hover:text-black")}
                title="Tampilan Kompak (Tanpa Gambar)"
              >
                <AlignJustify className="w-5 h-5" />
              </Button>
           </div>

           <Button 
             onClick={() => setCustomItemOpen(true)}
             className="h-12 bg-black text-white hover:bg-gray-800 border-4 border-black font-space-grotesk font-black uppercase tracking-wider rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 active:shadow-none active:translate-y-2 transition-all"
           >
             <Plus className="w-5 h-5 mr-0 lg:mr-2" />
             <span className="hidden lg:inline">Custom</span>
           </Button>

           <Button 
             onClick={() => setIsRecipeBookOpen(true)}
             variant="secondary"
             className="h-12 bg-[#FF90E8] border-4 border-black font-space-grotesk font-black uppercase tracking-wider rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 active:shadow-none active:translate-y-2 transition-all"
           >
             <BookOpen className="w-5 h-5 mr-0 md:mr-2 text-black" />
             <span className="hidden md:inline">Resep</span>
           </Button>
       </div>
    </div>
  );
}
