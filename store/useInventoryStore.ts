import { create } from 'zustand';

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

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  basePrice: number;
  image?: string;
  recipe?: string; // Markdown or plain text instructions
  type: 'SINGLE' | 'COMBO';
  ingredients?: ProductRecipeIngredient[]; // for SINGLE
  comboItems?: string[]; // Array of Product IDs for COMBO
}

interface InventoryState {
  categories: Category[];
  products: Product[];
  rawMaterials: RawMaterial[];
  inventoryMode: 'LOOSE' | 'STRICT' | 'OFF';
  
  addCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;
  
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  addRawMaterial: (material: RawMaterial) => void;
  updateRawMaterial: (id: string, material: Partial<RawMaterial>) => void;
  deleteRawMaterial: (id: string) => void;
  
  setInventoryMode: (mode: 'LOOSE' | 'STRICT' | 'OFF') => void;
}

const mockCategories: Category[] = [
  { id: 'cat_coffee', name: 'Coffee', color: '#00E5FF' },
  { id: 'cat_noncoffee', name: 'Non-Coffee', color: '#FF90E8' },
  { id: 'cat_snack', name: 'Snack & Food', color: '#FFD100' },
];

const mockRawMaterials: RawMaterial[] = [
  { id: 'rm_espresso', name: 'Beans (Espresso)', unit: 'gram', currentStock: 1000 },
  { id: 'rm_milk', name: 'Fresh Milk', unit: 'ml', currentStock: 5000 },
  { id: 'rm_aren', name: 'Gula Aren', unit: 'ml', currentStock: 2000 },
  { id: 'rm_matcha', name: 'Matcha Powder', unit: 'gram', currentStock: 500 },
  { id: 'rm_croissant', name: 'Frozen Croissant', unit: 'pcs', currentStock: 20 },
];

const mockProducts: Product[] = [
  { 
    id: 'p1', name: 'Ice Americano', categoryId: 'cat_coffee', basePrice: 18000, type: 'SINGLE', 
    recipe: '1. 1 shot espresso\n2. 180ml air dingin\n3. Es batu secukupnya',
    ingredients: [{ rawMaterialId: 'rm_espresso', amount: 18 }]
  },
  { 
    id: 'p2', name: 'Aren Latte', categoryId: 'cat_coffee', basePrice: 22000, type: 'SINGLE',
    recipe: '1. 1 shot espresso\n2. 15ml gula aren\n3. 120ml susu fresh milk\n4. Es batu',
    ingredients: [
      { rawMaterialId: 'rm_espresso', amount: 18 },
      { rawMaterialId: 'rm_milk', amount: 120 },
      { rawMaterialId: 'rm_aren', amount: 15 }
    ]
  },
  { id: 'p3', name: 'Matcha Latte', categoryId: 'cat_noncoffee', basePrice: 25000, type: 'SINGLE', recipe: '1. 10g matcha powder\n2. 30ml air hangat\n3. 120ml fresh milk\n4. Es batu' },
  { id: 'p4', name: 'Red Velvet', categoryId: 'cat_noncoffee', basePrice: 25000, type: 'SINGLE' },
  { id: 'p5', name: 'Croissant Butter', categoryId: 'cat_snack', basePrice: 20000, type: 'SINGLE', recipe: '1. Panaskan di oven 180C selama 3 menit.' },
  { id: 'p6', name: 'Dimsum Mentai', categoryId: 'cat_snack', basePrice: 22000, type: 'SINGLE', recipe: '1. Kukus dimsum 10 menit.\n2. Beri saus mentai\n3. Torch sampai wangi.' },
  { id: 'p7', name: 'Paket Sarapan', categoryId: 'cat_snack', basePrice: 35000, type: 'COMBO', comboItems: ['p1', 'p5'] },
];

export const useInventoryStore = create<InventoryState>((set) => ({
  categories: mockCategories,
  products: mockProducts,
  rawMaterials: mockRawMaterials,
  inventoryMode: 'LOOSE',
  
  addCategory: (cat) => set(state => ({ categories: [...state.categories, cat] })),
  deleteCategory: (id) => set(state => ({ categories: state.categories.filter(c => c.id !== id) })),
  
  addProduct: (product) => set(state => ({ products: [...state.products, product] })),
  updateProduct: (id, product) => set(state => ({
    products: state.products.map(p => p.id === id ? { ...p, ...product } : p)
  })),
  deleteProduct: (id) => set(state => ({ products: state.products.filter(p => p.id !== id) })),
  
  addRawMaterial: (material) => set(state => ({ rawMaterials: [...state.rawMaterials, material] })),
  updateRawMaterial: (id, material) => set(state => ({
    rawMaterials: state.rawMaterials.map(rm => rm.id === id ? { ...rm, ...material } : rm)
  })),
  deleteRawMaterial: (id) => set(state => ({ rawMaterials: state.rawMaterials.filter(rm => rm.id !== id) })),
  
  setInventoryMode: (mode) => set({ inventoryMode: mode }),
}));
