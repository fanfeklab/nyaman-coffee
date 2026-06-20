-- Enable Row Level Security
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "raw_materials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "variants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "variant_options" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_variants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_combos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "recipes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "recipe_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transaction_items" ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role from JWT
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'user_role';
$$;

-- USERS TABLE POLICIES
-- Only SUPER_ADMIN and MANAGER can manage users. All authenticated users can read (for cashier selection).
CREATE POLICY "Users are viewable by all authenticated users"
ON "users" FOR SELECT
USING (true);

CREATE POLICY "Users are manageable by SUPER_ADMIN and MANAGER"
ON "users" FOR ALL
USING (public.get_user_role() IN ('SUPER_ADMIN', 'MANAGER'));

-- PRODUCT & MENU POLICIES
-- Everyone can read menu, but only SUPER_ADMIN and MANAGER can edit.
CREATE POLICY "Menu is viewable by everyone"
ON "products" FOR SELECT USING (true);
CREATE POLICY "Menu is manageable by admins"
ON "products" FOR ALL USING (public.get_user_role() IN ('SUPER_ADMIN', 'MANAGER'));

CREATE POLICY "Categories is viewable by everyone"
ON "categories" FOR SELECT USING (true);
CREATE POLICY "Categories is manageable by admins"
ON "categories" FOR ALL USING (public.get_user_role() IN ('SUPER_ADMIN', 'MANAGER'));

-- Variants & Options
CREATE POLICY "Variants viewable by everyone" ON "variants" FOR SELECT USING (true);
CREATE POLICY "Variants manageable by admins" ON "variants" FOR ALL USING (public.get_user_role() IN ('SUPER_ADMIN', 'MANAGER'));

CREATE POLICY "Variant options viewable by everyone" ON "variant_options" FOR SELECT USING (true);
CREATE POLICY "Variant options manageable by admins" ON "variant_options" FOR ALL USING (public.get_user_role() IN ('SUPER_ADMIN', 'MANAGER'));

CREATE POLICY "Product variants viewable by everyone" ON "product_variants" FOR SELECT USING (true);
CREATE POLICY "Product variants manageable by admins" ON "product_variants" FOR ALL USING (public.get_user_role() IN ('SUPER_ADMIN', 'MANAGER'));

CREATE POLICY "Product combos viewable by everyone" ON "product_combos" FOR SELECT USING (true);
CREATE POLICY "Product combos manageable by admins" ON "product_combos" FOR ALL USING (public.get_user_role() IN ('SUPER_ADMIN', 'MANAGER'));

-- RECIPE & INVENTORY POLICIES
CREATE POLICY "Recipes viewable by everyone" ON "recipes" FOR SELECT USING (true);
CREATE POLICY "Recipes manageable by admins" ON "recipes" FOR ALL USING (public.get_user_role() IN ('SUPER_ADMIN', 'MANAGER'));

CREATE POLICY "Recipe items viewable by everyone" ON "recipe_items" FOR SELECT USING (true);
CREATE POLICY "Recipe items manageable by admins" ON "recipe_items" FOR ALL USING (public.get_user_role() IN ('SUPER_ADMIN', 'MANAGER'));

CREATE POLICY "Raw materials viewable by everyone" ON "raw_materials" FOR SELECT USING (true);
CREATE POLICY "Raw materials manageable by admins" ON "raw_materials" FOR ALL USING (public.get_user_role() IN ('SUPER_ADMIN', 'MANAGER'));

-- TRANSACTIONS POLICIES
-- Everyone can create and read transactions. Only SUPER_ADMIN can delete/modify past transactions.
CREATE POLICY "Transactions viewable by everyone"
ON "transactions" FOR SELECT USING (true);

CREATE POLICY "Transactions insertable by everyone"
ON "transactions" FOR INSERT WITH CHECK (true);

CREATE POLICY "Transactions manageable by SUPER_ADMIN"
ON "transactions" FOR ALL USING (public.get_user_role() = 'SUPER_ADMIN');

CREATE POLICY "Transaction items viewable by everyone"
ON "transaction_items" FOR SELECT USING (true);

CREATE POLICY "Transaction items insertable by everyone"
ON "transaction_items" FOR INSERT WITH CHECK (true);

CREATE POLICY "Transaction items manageable by SUPER_ADMIN"
ON "transaction_items" FOR ALL USING (public.get_user_role() = 'SUPER_ADMIN');
