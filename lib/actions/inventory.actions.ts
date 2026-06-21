'use server';

import { db } from '@/lib/db';
import { products, categories, variants, variantOptions, productVariants, productCombos, recipes, recipeItems, rawMaterials } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getInventoryData() {
  try {
    const allCategories = await db.select().from(categories);
    const allProducts = await db.select().from(products);
    const allVariants = await db.select().from(variants);
    const allRawMaterials = await db.select().from(rawMaterials);
    const allRecipes = await db.select().from(recipes);
    
    // In a real app we'd join and map these appropriately.
    return {
      success: true,
      categories: allCategories,
      products: allProducts,
      variants: allVariants,
      rawMaterials: allRawMaterials,
      recipes: allRecipes
    };
  } catch (error: any) {
    console.error('Error fetching inventory data:', error);
    return { success: false, error: error.message };
  }
}
