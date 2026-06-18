import { create } from 'zustand';

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  basePrice: number;
  image?: string;
  recipe?: string; // Markdown or plain text recipe
}

interface InventoryState {
  categories: Category[];
  products: Product[];
  addCategory: (cat: Category) => void;
  addProduct: (product: Product) => void;
}

const mockCategories: Category[] = [
  { id: 'cat_coffee', name: 'Coffee', color: '#00E5FF' },
  { id: 'cat_noncoffee', name: 'Non-Coffee', color: '#FF90E8' },
  { id: 'cat_snack', name: 'Snack & Food', color: '#FFD100' },
];

const mockProducts: Product[] = [
  { id: 'p1', name: 'Ice Americano', categoryId: 'cat_coffee', basePrice: 18000, recipe: '1. 1 shot espresso\n2. 180ml air dingin\n3. Es batu secukupnya' },
  { id: 'p2', name: 'Aren Latte', categoryId: 'cat_coffee', basePrice: 22000, recipe: '1. 1 shot espresso\n2. 15ml gula aren\n3. 120ml susu fresh milk\n4. Es batu' },
  { id: 'p3', name: 'Matcha Latte', categoryId: 'cat_noncoffee', basePrice: 25000, recipe: '1. 10g matcha powder\n2. 30ml air hangat\n3. 120ml fresh milk\n4. Es batu' },
  { id: 'p4', name: 'Red Velvet', categoryId: 'cat_noncoffee', basePrice: 25000 },
  { id: 'p5', name: 'Croissant Butter', categoryId: 'cat_snack', basePrice: 20000, recipe: '1. Panaskan di oven 180C selama 3 menit.' },
  { id: 'p6', name: 'Dimsum Mentai', categoryId: 'cat_snack', basePrice: 22000, recipe: '1. Kukus dimsum 10 menit.\n2. Beri saus mentai\n3. Torch sampai wangi.' },
];

export const useInventoryStore = create<InventoryState>((set) => ({
  categories: mockCategories,
  products: mockProducts,
  addCategory: (cat) => set(state => ({ categories: [...state.categories, cat] })),
  addProduct: (product) => set(state => ({ products: [...state.products, product] })),
}));
