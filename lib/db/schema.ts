import { pgTable, text, timestamp, integer, boolean, pgEnum, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userRoleEnum = pgEnum('user_role', ['SUPER_ADMIN', 'MANAGER', 'CASHIER']);
export const productTypeEnum = pgEnum('product_type', ['SINGLE', 'COMBO']);
export const variantTypeEnum = pgEnum('variant_type', ['SINGLE_CHOICE', 'MULTIPLE_CHOICE']);

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  fullName: text('full_name').notNull(),
  role: userRoleEnum('role').notNull(),
  pin: text('pin').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull(),
});

export const rawMaterials = pgTable('raw_materials', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  unit: text('unit').notNull(),
  currentStock: integer('current_stock').notNull().default(0),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  categoryId: text('category_id').references(() => categories.id).notNull(),
  basePrice: integer('base_price').notNull(),
  image: text('image'),
  type: productTypeEnum('type').notNull(),
});

export const variants = pgTable('variants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  isRequired: boolean('is_required').notNull().default(false),
  type: variantTypeEnum('type').notNull(),
});

export const variantOptions = pgTable('variant_options', {
  id: uuid('id').defaultRandom().primaryKey(),
  variantId: text('variant_id').references(() => variants.id).notNull(),
  name: text('name').notNull(),
  priceAdjustment: integer('price_adjustment').notNull().default(0),
});

export const productVariants = pgTable('product_variants', {
  productId: text('product_id').references(() => products.id).notNull(),
  variantId: text('variant_id').references(() => variants.id).notNull(),
});

export const productCombos = pgTable('product_combos', {
  productId: text('product_id').references(() => products.id).notNull(),
  comboItemId: text('combo_item_id').references(() => products.id).notNull(),
});

export const recipes = pgTable('recipes', {
  id: text('id').primaryKey(),
  productId: text('product_id').references(() => products.id).notNull(),
  instructions: text('instructions'),
});

export const recipeItems = pgTable('recipe_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  recipeId: text('recipe_id').references(() => recipes.id).notNull(),
  rawMaterialId: text('raw_material_id').references(() => rawMaterials.id).notNull(),
  qty: integer('qty').notNull(),
});

export const paymentMethodEnum = pgEnum('payment_method', ['TUNAI', 'QRIS']);
export const transactionStatusEnum = pgEnum('transaction_status', ['PENDING', 'COMPLETED', 'CANCELLED']);

export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  shiftId: text('shift_id').notNull(),
  cashierId: text('cashier_id').references(() => users.id).notNull(),
  customerId: text('customer_id'),
  customerName: text('customer_name'),
  total: integer('total').notNull(),
  paymentMethod: paymentMethodEnum('payment_method'),
  cashGiven: integer('cash_given'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  status: transactionStatusEnum('status').notNull(),
});

export const transactionItems = pgTable('transaction_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  transactionId: text('transaction_id').references(() => transactions.id).notNull(),
  productId: text('product_id').references(() => products.id).notNull(),
  qty: integer('qty').notNull(),
  priceAtTime: integer('price_at_time').notNull(),
  note: text('note'),
});
