import { db } from '../lib/db';
import { categories, products, rawMaterials } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

const mockCategories = [
  { id: 'cat_paket_murah', name: 'Paket Murah', color: '#FF5722' },
  { id: 'cat_minuman', name: 'Minuman', color: '#00E5FF' },
  { id: 'cat_makanan', name: 'Makanan & Snack', color: '#FFD100' },
];

const mockRawMaterials = [
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

const mockProducts: any[] = [
  // MAKANAN
  { id: 'p_sosis_telor', name: 'Sosis Telor', categoryId: 'cat_makanan', basePrice: 11000, type: 'SINGLE' },
  { id: 'p_mix_platter', name: 'Mix Platter', categoryId: 'cat_makanan', basePrice: 20000, type: 'SINGLE' },
  { id: 'p_risol', name: 'Risol', categoryId: 'cat_makanan', basePrice: 5000, type: 'SINGLE' },
  { id: 'p_pop_mie', name: 'Pop Mie', categoryId: 'cat_makanan', basePrice: 10000, type: 'SINGLE' },
  { id: 'p_makaroni', name: 'Makaroni', categoryId: 'cat_makanan', basePrice: 5000, type: 'SINGLE' },
  { id: 'p_keripik', name: 'Keripik', categoryId: 'cat_makanan', basePrice: 5000, type: 'SINGLE' },
  { id: 'p_snack_tray', name: 'Snack Tray', categoryId: 'cat_makanan', basePrice: 25000, type: 'SINGLE' },
  
  // MINUMAN KEMASAN
  { id: 'p_le_minerale', name: 'Le Minerale', categoryId: 'cat_minuman', basePrice: 5000, type: 'SINGLE' },
  { id: 'p_pocary_sweat', name: 'Pocary Sweat', categoryId: 'cat_minuman', basePrice: 10000, type: 'SINGLE' },

  // MINUMAN (RACIKAN)
  { id: 'p_americano', name: 'Americano', categoryId: 'cat_minuman', basePrice: 13000, type: 'SINGLE' },
  { id: 'p_americano_strawberry', name: 'Americano Strawberry', categoryId: 'cat_minuman', basePrice: 14000, type: 'SINGLE' },
  { id: 'p_kopi_susu_almond', name: 'Kopi Susu Almond', categoryId: 'cat_minuman', basePrice: 14000, type: 'SINGLE' },
  { id: 'p_thai_tea', name: 'Thai Tea', categoryId: 'cat_minuman', basePrice: 10000, type: 'SINGLE' },
  { id: 'p_pink_lava', name: 'Pink Lava', categoryId: 'cat_minuman', basePrice: 15000, type: 'SINGLE' },
  { id: 'p_chocolate', name: 'Chocolate', categoryId: 'cat_minuman', basePrice: 11000, type: 'SINGLE' },
  { id: 'p_choco_almond', name: 'Choco Almond', categoryId: 'cat_minuman', basePrice: 14000, type: 'SINGLE' },
  { id: 'p_taro', name: 'Taro', categoryId: 'cat_minuman', basePrice: 14000, type: 'SINGLE' },

  // PAKET MURAH
  { id: 'p_paket_biasa', name: 'Paket Biasa (Sosis Telor + Le Minerale)', categoryId: 'cat_paket_murah', basePrice: 13000, type: 'COMBO' },
  { id: 'p_paket_spesial', name: 'Paket Spesial (Risol + Ice Pink lava + Makroni)', categoryId: 'cat_paket_murah', basePrice: 16000, type: 'COMBO' },
  { id: 'p_paket_istimewa', name: 'Paket Istimewa (2 Risol + Ice Americano + Ice Taro)', categoryId: 'cat_paket_murah', basePrice: 25000, type: 'COMBO' },
  { id: 'p_paket_lengkap', name: 'Paket Lengkap (2 Snack Tray + Risol)', categoryId: 'cat_paket_murah', basePrice: 40000, type: 'COMBO' },
];

async function main() {
  console.log('Starting seed...');
  
  for (const cat of mockCategories) {
    await db.insert(categories).values(cat).onConflictDoNothing();
  }
  console.log('Categories seeded.');

  for (const rm of mockRawMaterials) {
    await db.insert(rawMaterials).values(rm).onConflictDoNothing();
  }
  console.log('Raw Materials seeded.');

  for (const prod of mockProducts) {
    await db.insert(products).values(prod).onConflictDoNothing();
  }
  console.log('Products seeded.');
  
  console.log('Seeding completed!');
  process.exit(0);
}

main().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
