import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: string; // e.g. gram, ml, pcs
  currentStock: number;
}

export interface ProductRecipeIngredient {
  rawMaterialId: string;
  amount: number;
}

export interface VariantOption {
  name: string;
  priceAdjustment: number;
}

export interface Variant {
  id: string;
  name: string;
  options: VariantOption[];
  isRequired: boolean;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
}

export interface RecipeItem {
  rawMaterialId: string;
  qty: number;
}

export interface Recipe {
  id: string;
  productId: string;
  instructions: string;
  ingredients: RecipeItem[];
}

export interface StockOpname {
  id: string;
  date: string;
  items: {
    rawMaterialId: string;
    systemStock: number;
    actualStock: number;
    difference: number;
    reason: string;
  }[];
  createdBy: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  address: string;
}

export interface PurchaseOrder {
  id: string;
  date: string;
  supplierId: string;
  items: {
    rawMaterialId: string;
    qty: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdBy: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  basePrice: number;
  image?: string;
  type: 'SINGLE' | 'COMBO';
  variantIds?: string[]; // References to Variant.id
  comboItems?: string[]; // For COMBO: Array of Product IDs
  
  // Legacy / Fallback properties
  ingredients?: ProductRecipeIngredient[]; 
  recipe?: string; 
}

interface InventoryState {
  categories: Category[];
  products: Product[];
  rawMaterials: RawMaterial[];
  variants: Variant[];
  recipes: Recipe[];
  inventoryMode: 'LOOSE' | 'STRICT' | 'OFF';
  
  addCategory: (cat: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  addRawMaterial: (material: RawMaterial) => void;
  updateRawMaterial: (id: string, material: Partial<RawMaterial>) => void;
  deleteRawMaterial: (id: string) => void;
  
  addVariant: (variant: Variant) => void;
  updateVariant: (id: string, variant: Partial<Variant>) => void;
  deleteVariant: (id: string) => void;

  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;

  setInventoryMode: (mode: 'LOOSE' | 'STRICT' | 'OFF') => void;
  clearInventory: () => void;
  
  // Stock Opname
  stockOpnames: StockOpname[];
  addStockOpname: (opname: StockOpname) => void;
  
  // Suppliers
  suppliers: Supplier[];
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  
  // Purchase Orders
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (po: PurchaseOrder) => void;
  updatePurchaseOrderStatus: (id: string, status: 'PENDING' | 'COMPLETED' | 'CANCELLED') => void;

  processCheckoutInventory: (cartItems: { productId: string; qty: number; note?: string }[]) => { success: boolean; reason?: string };
  revertCheckoutInventory: (cartItems: { productId: string; qty: number; note?: string }[]) => void;
}

const mockCategories: Category[] = [
  { id: 'cat_paket_murah', name: 'Paket Murah', color: '#FF5722' },
  { id: 'cat_minuman', name: 'Minuman', color: '#00E5FF' },
  { id: 'cat_makanan', name: 'Makanan & Snack', color: '#FFD100' },
];

const mockRawMaterials: RawMaterial[] = [
  { id: 'rm_espresso', name: 'Espresso', unit: 'ml', currentStock: 5000 },
  { id: 'rm_air', name: 'Air Putih', unit: 'ml', currentStock: 20000 },
  { id: 'rm_susu', name: 'Susu UHT / Fresh Milk', unit: 'ml', currentStock: 10000 },
  { id: 'rm_es_batu', name: 'Es Batu', unit: 'gram', currentStock: 20000 },
  { id: 'rm_syrup_strawberry', name: 'Syrup Strawberry', unit: 'ml', currentStock: 2000 },
  { id: 'rm_syrup_pandan', name: 'Syrup Pandan', unit: 'ml', currentStock: 2000 },
  { id: 'rm_syrup_almond', name: 'Syrup Almond', unit: 'ml', currentStock: 2000 },
  { id: 'rm_syrup_orange', name: 'Syrup Orange', unit: 'ml', currentStock: 2000 },
  { id: 'rm_syrup_cocopandan', name: 'Syrup Cocopandan', unit: 'ml', currentStock: 2000 },
  { id: 'rm_powder_tea', name: 'Powder Tea', unit: 'gram', currentStock: 2000 },
  { id: 'rm_powder_thai_tea', name: 'Powder Thai Tea', unit: 'gram', currentStock: 2000 },
  { id: 'rm_powder_coklat', name: 'Powder Coklat', unit: 'gram', currentStock: 2000 },
  { id: 'rm_powder_taro', name: 'Powder Taro', unit: 'gram', currentStock: 2000 },
  { id: 'rm_sosis_telor', name: 'Sosis Telor', unit: 'pcs', currentStock: 100 },
  { id: 'rm_risol', name: 'Risol', unit: 'pcs', currentStock: 100 },
  { id: 'rm_makaroni', name: 'Makaroni', unit: 'pcs', currentStock: 100 },
  { id: 'rm_keripik', name: 'Keripik', unit: 'pcs', currentStock: 100 },
  { id: 'rm_le_minerale', name: 'Le Minerale', unit: 'pcs', currentStock: 100 },
  { id: 'rm_pocary_sweat', name: 'Pocary Sweat', unit: 'pcs', currentStock: 100 },
  { id: 'rm_pop_mie', name: 'Pop Mie', unit: 'pcs', currentStock: 100 },
  { id: 'rm_mix_platter', name: 'Mix Platter', unit: 'pcs', currentStock: 50 },
  { id: 'rm_snack_tray', name: 'Snack Tray', unit: 'pcs', currentStock: 50 },
];

const mockProducts: Product[] = [
  // MAKANAN
  { id: 'p_sosis_telor', name: 'Sosis Telor', categoryId: 'cat_makanan', basePrice: 11000, type: 'SINGLE', ingredients: [{ rawMaterialId: 'rm_sosis_telor', amount: 1 }] },
  { id: 'p_mix_platter', name: 'Mix Platter', categoryId: 'cat_makanan', basePrice: 20000, type: 'SINGLE', ingredients: [{ rawMaterialId: 'rm_mix_platter', amount: 1 }] },
  { id: 'p_risol', name: 'Risol', categoryId: 'cat_makanan', basePrice: 5000, type: 'SINGLE', ingredients: [{ rawMaterialId: 'rm_risol', amount: 1 }] },
  { id: 'p_pop_mie', name: 'Pop Mie', categoryId: 'cat_makanan', basePrice: 10000, type: 'SINGLE', ingredients: [{ rawMaterialId: 'rm_pop_mie', amount: 1 }] },
  { id: 'p_makaroni', name: 'Makaroni', categoryId: 'cat_makanan', basePrice: 5000, type: 'SINGLE', ingredients: [{ rawMaterialId: 'rm_makaroni', amount: 1 }] },
  { id: 'p_keripik', name: 'Keripik', categoryId: 'cat_makanan', basePrice: 5000, type: 'SINGLE', ingredients: [{ rawMaterialId: 'rm_keripik', amount: 1 }] },
  { id: 'p_snack_tray', name: 'Snack Tray', categoryId: 'cat_makanan', basePrice: 25000, type: 'SINGLE', ingredients: [{ rawMaterialId: 'rm_snack_tray', amount: 1 }] },
  
  // MINUMAN KEMASAN
  { id: 'p_le_minerale', name: 'Le Minerale', categoryId: 'cat_minuman', basePrice: 5000, type: 'SINGLE', ingredients: [{ rawMaterialId: 'rm_le_minerale', amount: 1 }] },
  { id: 'p_pocary_sweat', name: 'Pocary Sweat', categoryId: 'cat_minuman', basePrice: 10000, type: 'SINGLE', ingredients: [{ rawMaterialId: 'rm_pocary_sweat', amount: 1 }] },

  // MINUMAN (RACIKAN)
  { 
    id: 'p_americano', name: 'Americano', categoryId: 'cat_minuman', basePrice: 13000, type: 'SINGLE',
    recipe: '1. Masukkan espresso 30ml ke dalam cup 14 Oz\n2. Tuang air 150ml',
    ingredients: [{ rawMaterialId: 'rm_espresso', amount: 30 }, { rawMaterialId: 'rm_air', amount: 150 }]
  },
  { 
    id: 'p_americano_strawberry', name: 'Americano Strawberry', categoryId: 'cat_minuman', basePrice: 14000, type: 'SINGLE',
    recipe: '1. Masukkan espresso 20ml ke dalam cup 14 Oz\n2. Tuang syrup strawberry 20ml\n3. Tuang air 170ml',
    ingredients: [{ rawMaterialId: 'rm_espresso', amount: 20 }, { rawMaterialId: 'rm_syrup_strawberry', amount: 20 }, { rawMaterialId: 'rm_air', amount: 170 }]
  },
  { 
    id: 'p_kopi_susu_almond', name: 'Kopi Susu Almond', categoryId: 'cat_minuman', basePrice: 14000, type: 'SINGLE',
    recipe: '1. Tuang syrup almond 20ml ke dalam gelas HI BALL 14 OZ\n2. Tuang susu UHT 100ml lalu stir dengan mixer\n3. Masukkan es batu 150g\n4. Tuang espresso 20ml\n5. Tambahkan air 60ml',
    ingredients: [{ rawMaterialId: 'rm_syrup_almond', amount: 20 }, { rawMaterialId: 'rm_susu', amount: 100 }, { rawMaterialId: 'rm_es_batu', amount: 150 }, { rawMaterialId: 'rm_espresso', amount: 20 }, { rawMaterialId: 'rm_air', amount: 60 }]
  },
  { 
    id: 'p_thai_tea', name: 'Thai Tea', categoryId: 'cat_minuman', basePrice: 10000, type: 'SINGLE',
    recipe: '1. Tuang powder thai tea 20g\n2. Tuang susu 100ml dan air putih 100ml\n3. Isi gelas dengan es batu 150g',
    ingredients: [{ rawMaterialId: 'rm_powder_thai_tea', amount: 20 }, { rawMaterialId: 'rm_susu', amount: 100 }, { rawMaterialId: 'rm_air', amount: 100 }, { rawMaterialId: 'rm_es_batu', amount: 150 }]
  },
  { 
    id: 'p_pink_lava', name: 'Pink Lava', categoryId: 'cat_minuman', basePrice: 15000, type: 'SINGLE',
    recipe: '1. Masukkan syrup cocopandan 40ml dan susu 100ml\n2. Mixer adonan\n3. Isi dengan air 100ml\n4. Tambahkan es batu 150g',
    ingredients: [{ rawMaterialId: 'rm_syrup_cocopandan', amount: 40 }, { rawMaterialId: 'rm_susu', amount: 100 }, { rawMaterialId: 'rm_air', amount: 100 }, { rawMaterialId: 'rm_es_batu', amount: 150 }]
  },
  { 
    id: 'p_chocolate', name: 'Chocolate', categoryId: 'cat_minuman', basePrice: 11000, type: 'SINGLE',
    recipe: '1. Tuang powder coklat 20g ke dalam gelas HI BALL 14 OZ\n2. Tuang susu UHT 100ml lalu stir dengan mixer\n3. Isi gelas dengan es batu 200g',
    ingredients: [{ rawMaterialId: 'rm_powder_coklat', amount: 20 }, { rawMaterialId: 'rm_susu', amount: 100 }, { rawMaterialId: 'rm_es_batu', amount: 200 }]
  },
  { 
    id: 'p_choco_almond', name: 'Choco Almond', categoryId: 'cat_minuman', basePrice: 14000, type: 'SINGLE',
    recipe: '1. Tuang Coklat bubuk 20g dan syrup almond 20ml ke dalm gelas CUP 7 OZ\n2. Masukkan susu 100ml dan es batu secukupnya',
    ingredients: [{ rawMaterialId: 'rm_powder_coklat', amount: 20 }, { rawMaterialId: 'rm_syrup_almond', amount: 20 }, { rawMaterialId: 'rm_susu', amount: 100 }]
  },
  { 
    id: 'p_taro', name: 'Taro', categoryId: 'cat_minuman', basePrice: 14000, type: 'SINGLE',
    recipe: '1. Tuang powder taro 20g\n2. Tuang susu 100ml dan air putih 100ml\n3. Isi gelas dengan es batu 150g',
    ingredients: [{ rawMaterialId: 'rm_powder_taro', amount: 20 }, { rawMaterialId: 'rm_susu', amount: 100 }, { rawMaterialId: 'rm_air', amount: 100 }, { rawMaterialId: 'rm_es_batu', amount: 150 }]
  },

  // PAKET MURAH
  { id: 'p_paket_biasa', name: 'Paket Biasa (Sosis Telor + Le Minerale)', categoryId: 'cat_paket_murah', basePrice: 13000, type: 'COMBO', comboItems: ['p_sosis_telor', 'p_le_minerale'] },
  { id: 'p_paket_spesial', name: 'Paket Spesial (Risol + Ice Pink lava + Makroni)', categoryId: 'cat_paket_murah', basePrice: 16000, type: 'COMBO', comboItems: ['p_risol', 'p_pink_lava', 'p_makaroni'] },
  { id: 'p_paket_istimewa', name: 'Paket Istimewa (2 Risol + Ice Americano + Ice Taro)', categoryId: 'cat_paket_murah', basePrice: 25000, type: 'COMBO', comboItems: ['p_risol', 'p_risol', 'p_americano', 'p_taro'] },
  { id: 'p_paket_lengkap', name: 'Paket Lengkap (2 Snack Tray + Risol)', categoryId: 'cat_paket_murah', basePrice: 40000, type: 'COMBO', comboItems: ['p_snack_tray', 'p_snack_tray', 'p_risol'] },
];

import { upsertFirebaseCategory, deleteFirebaseCategory, upsertFirebaseProduct, deleteFirebaseProduct, upsertFirebaseRawMaterial, deleteFirebaseRawMaterial, upsertFirebaseVariant, deleteFirebaseVariant, upsertFirebaseRecipe, deleteFirebaseRecipe } from '@/lib/firebase/services';

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set) => ({
      categories: mockCategories,
      products: mockProducts,
      rawMaterials: mockRawMaterials,
      variants: [],
      recipes: [],
      inventoryMode: 'LOOSE',
      stockOpnames: [],
      suppliers: [],
      purchaseOrders: [],
      
      addCategory: (cat) => {
        upsertFirebaseCategory(cat);
        set(state => ({ categories: [...state.categories, cat] }));
      },
      updateCategory: (id, updates) => {
        set(state => {
          const newCats = state.categories.map(c => c.id === id ? { ...c, ...updates } : c);
          const updated = newCats.find(c => c.id === id);
          if (updated) upsertFirebaseCategory(updated);
          return { categories: newCats };
        });
      },
      deleteCategory: (id) => {
        deleteFirebaseCategory(id);
        set(state => ({ categories: state.categories.filter(c => c.id !== id) }));
      },
      
      addProduct: (product) => {
        upsertFirebaseProduct(product);
        set(state => ({ products: [...state.products, product] }));
      },
      updateProduct: (id, product) => {
        set(state => {
          const newProds = state.products.map(p => p.id === id ? { ...p, ...product } : p);
          const updated = newProds.find(p => p.id === id);
          if (updated) upsertFirebaseProduct(updated);
          return { products: newProds };
        });
      },
      deleteProduct: (id) => {
        deleteFirebaseProduct(id);
        set(state => ({ products: state.products.filter(p => p.id !== id) }));
      },
      
      addRawMaterial: (material) => {
        upsertFirebaseRawMaterial(material);
        set(state => ({ rawMaterials: [...state.rawMaterials, material] }));
      },
      updateRawMaterial: (id, material) => {
        set(state => {
          const newRm = state.rawMaterials.map(rm => rm.id === id ? { ...rm, ...material } : rm);
          const updated = newRm.find(rm => rm.id === id);
          if (updated) upsertFirebaseRawMaterial(updated);
          return { rawMaterials: newRm };
        });
      },
      deleteRawMaterial: (id) => {
        deleteFirebaseRawMaterial(id);
        set(state => ({ rawMaterials: state.rawMaterials.filter(rm => rm.id !== id) }));
      },
      
      addVariant: (variant) => {
        upsertFirebaseVariant(variant);
        set(state => ({ variants: [...state.variants, variant] }));
      },
      updateVariant: (id, variant) => {
        set(state => {
          const newVars = state.variants.map(v => v.id === id ? { ...v, ...variant } : v);
          const updated = newVars.find(v => v.id === id);
          if (updated) upsertFirebaseVariant(updated);
          return { variants: newVars };
        });
      },
      deleteVariant: (id) => {
        deleteFirebaseVariant(id);
        set(state => ({ variants: state.variants.filter(v => v.id !== id) }));
      },

      addRecipe: (recipe) => {
        upsertFirebaseRecipe(recipe);
        set(state => ({ recipes: [...state.recipes, recipe] }));
      },
      updateRecipe: (id, recipe) => {
        set(state => {
          const newRecs = state.recipes.map(r => r.id === id ? { ...r, ...recipe } : r);
          const updated = newRecs.find(r => r.id === id);
          if (updated) upsertFirebaseRecipe(updated);
          return { recipes: newRecs };
        });
      },
      deleteRecipe: (id) => {
        deleteFirebaseRecipe(id);
        set(state => ({ recipes: state.recipes.filter(r => r.id !== id) }));
      },
      
      setInventoryMode: (mode) => set({ inventoryMode: mode }),
      clearInventory: () => set({ products: [], categories: [], rawMaterials: [], stockOpnames: [], suppliers: [], purchaseOrders: [] }),
      
      addStockOpname: (opname) => set(state => {
        const nextMaterials = state.rawMaterials.map(rm => ({ ...rm }));
        for (const item of opname.items) {
          const rmIdx = nextMaterials.findIndex(rm => rm.id === item.rawMaterialId);
          if (rmIdx >= 0) {
            nextMaterials[rmIdx].currentStock = item.actualStock;
          }
        }
        return {
          stockOpnames: [opname, ...state.stockOpnames],
          rawMaterials: nextMaterials
        };
      }),

      addSupplier: (supplier) => set(state => ({ suppliers: [...state.suppliers, supplier] })),
      updateSupplier: (id, updates) => set(state => ({
        suppliers: state.suppliers.map(s => s.id === id ? { ...s, ...updates } : s)
      })),
      deleteSupplier: (id) => set(state => ({ suppliers: state.suppliers.filter(s => s.id !== id) })),

      addPurchaseOrder: (po) => set(state => ({ purchaseOrders: [po, ...state.purchaseOrders] })),
      updatePurchaseOrderStatus: (id, status) => set(state => {
        const po = state.purchaseOrders.find(p => p.id === id);
        if (!po || po.status === status) return state;

        const nextMaterials = state.rawMaterials.map(rm => ({ ...rm }));
        
        // If changing to COMPLETED, add stock
        if (status === 'COMPLETED' && po.status !== 'COMPLETED') {
          for (const item of po.items) {
            const rmIdx = nextMaterials.findIndex(rm => rm.id === item.rawMaterialId);
            if (rmIdx >= 0) {
              nextMaterials[rmIdx].currentStock += item.qty;
            }
          }
        } 
        // If changing from COMPLETED to something else, remove stock
        else if (po.status === 'COMPLETED' && status !== 'COMPLETED') {
          for (const item of po.items) {
            const rmIdx = nextMaterials.findIndex(rm => rm.id === item.rawMaterialId);
            if (rmIdx >= 0) {
              nextMaterials[rmIdx].currentStock -= item.qty;
            }
          }
        }

        return {
          rawMaterials: nextMaterials,
          purchaseOrders: state.purchaseOrders.map(p => p.id === id ? { ...p, status } : p)
        };
      }),

      processCheckoutInventory: (cartItems) => {
        let success = true;
        let reason = '';
        
        set(state => {
          if (state.inventoryMode === 'OFF') return state;
          
          const nextMaterials = state.rawMaterials.map(rm => ({ ...rm }));
          
          for (const item of cartItems) {
            const product = state.products.find(p => p.id === item.productId);
            if (!product) continue;
            
            const processProduct = (prod: Product, multiplier: number) => {
              if (prod.type === 'COMBO' && prod.comboItems) {
                for (const subId of prod.comboItems) {
                  const subP = state.products.find(p => p.id === subId);
                  if (subP) processProduct(subP, multiplier);
                }
              } else {
                // Check if there is a separate Recipe object linked
                const recipe = state.recipes.find(r => r.productId === prod.id);
                // Unified ingredients array to process
                let ingredientsToProcess: { rawMaterialId: string, qty: number }[] = [];
                
                if (recipe && recipe.ingredients) {
                  ingredientsToProcess = recipe.ingredients;
                } else if (prod.ingredients) {
                  // Fallback for legacy
                  ingredientsToProcess = prod.ingredients.map(ing => ({ rawMaterialId: ing.rawMaterialId, qty: ing.amount }));
                }

                for (const ing of ingredientsToProcess) {
                  const rmIdx = nextMaterials.findIndex(rm => rm.id === ing.rawMaterialId);
                  if (rmIdx >= 0) {
                    if (state.inventoryMode === 'STRICT' && nextMaterials[rmIdx].currentStock < ing.qty * multiplier) {
                      success = false;
                      reason = `Stok bahan baku ${nextMaterials[rmIdx].name} tidak mencukupi untuk menu ${prod.name}`;
                    }
                    nextMaterials[rmIdx].currentStock -= ing.qty * multiplier;
                  }
                }
              }
            };
            
            processProduct(product, item.qty);
            if (!success) break;
          }
          
          if (!success && state.inventoryMode === 'STRICT') {
            return state; // Revert state (do not apply changes)
          }
          
          // Sync new raw materials to Firebase
          nextMaterials.forEach(rm => upsertFirebaseRawMaterial(rm));

          return { rawMaterials: nextMaterials };
        });
        
        return { success, reason };
      },
      
      revertCheckoutInventory: (cartItems) => {
        set(state => {
          if (state.inventoryMode === 'OFF') return state;
          
          const nextMaterials = state.rawMaterials.map(rm => ({ ...rm }));
          
          for (const item of cartItems) {
            const product = state.products.find(p => p.id === item.productId);
            if (!product) continue;
            
            const revertProduct = (prod: Product, multiplier: number) => {
              if (prod.type === 'COMBO' && prod.comboItems) {
                for (const subId of prod.comboItems) {
                  const subP = state.products.find(p => p.id === subId);
                  if (subP) revertProduct(subP, multiplier);
                }
              } else {
                const recipe = state.recipes.find(r => r.productId === prod.id);
                let ingredientsToProcess: { rawMaterialId: string, qty: number }[] = [];
                
                if (recipe && recipe.ingredients) {
                  ingredientsToProcess = recipe.ingredients;
                } else if (prod.ingredients) {
                  ingredientsToProcess = prod.ingredients.map(ing => ({ rawMaterialId: ing.rawMaterialId, qty: ing.amount }));
                }

                for (const ing of ingredientsToProcess) {
                  const rmIdx = nextMaterials.findIndex(rm => rm.id === ing.rawMaterialId);
                  if (rmIdx >= 0) {
                    nextMaterials[rmIdx].currentStock += ing.qty * multiplier;
                  }
                }
              }
            };
            
            revertProduct(product, item.qty);
          }
          
          // Sync reverted raw materials to Firebase
          nextMaterials.forEach(rm => upsertFirebaseRawMaterial(rm));

          return { rawMaterials: nextMaterials };
        });
      }
    }),
    {
      name: 'pos-inventory-storage'
    }
  )
);
