# 🚀 Panduan Setup Supabase untuk Project

Panduan lengkap untuk setup project dari Firestore ke Supabase dengan detail menu dan langkah-langkah.

---

## 📋 Table of Contents

1. [PART 1: Dapatkan Credentials Supabase](#part-1-dapatkan-credentials-supabase)
2. [PART 2: Set Environment Variables di Vercel](#part-2-set-environment-variables-di-vercel)
3. [PART 3: Jalankan Migrasi Database](#part-3-jalankan-migrasi-database)
4. [PART 4: Test Koneksi Database](#part-4-test-koneksi-database)
5. [Troubleshooting](#troubleshooting)

---

## PART 1: Dapatkan Credentials Supabase

### Step 1.1: Login ke Supabase

1. Buka https://supabase.com
2. Klik **"Sign In"** di kanan atas
3. Login dengan email/password atau GitHub
4. Anda akan masuk ke Supabase Dashboard

### Step 1.2: Buka/Buat Project

Di halaman dashboard:
- **Jika sudah ada project:** Klik project yang ingin digunakan
- **Jika belum ada:** Klik tombol **"New project"** dan ikuti wizard

### Step 1.3: Ambil PROJECT URL

Setelah masuk ke project:

**Navigasi:**
```
Sidebar Kiri:
├─ Home
├─ SQL Editor
├─ Authentication
├─ Database
├─ Storage
├─ Edge Functions
├─ Vector
├─ Realtime
└─ Settings ← KLIK INI
```

**Di Settings, klik tab "API":**
```
Tabs di halaman Settings:
├─ General
├─ API ← KLIK INI
├─ Database
├─ Auth
└─ ...
```

**Cari "Project URL":**
```
┌─────────────────────────────┐
│ Project URL                 │
├─────────────────────────────┤
│ https://xxxxxxxxxxxx.supabase.co │
│                  [Copy icon] │
└─────────────────────────────┘
```

**COPY URL** → Simpan di notepad atau tempat aman

### Step 1.4: Ambil API KEYS

Masih di halaman Settings → API, scroll ke bawah cari **"Project API Keys"**

```
┌─────────────────────────────────────────────┐
│ Project API Keys                            │
├─────────────────────────────────────────────┤
│                                             │
│ 🔒 anon (public)                            │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...   │
│                              [Copy icon]    │
│                                             │
│ 🔐 service_role (secret)                    │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...   │
│                              [Copy icon]    │
│                                             │
└─────────────────────────────────────────────┘
```

- **COPY "anon" key** → Simpan
- **COPY "service_role" key** → Simpan (JANGAN SHARE!)

### Step 1.5: Ambil DATABASE CONNECTION URL

Masih di Settings, klik tab **"Database"**

```
Tabs di halaman Settings:
├─ General
├─ API
├─ Database ← KLIK INI
├─ Auth
└─ ...
```

Di halaman Database, cari **"Connection Pooler"** atau **"Connection string"**

```
┌──────────────────────────────────────────────────┐
│ Connection Pooler                                │
├──────────────────────────────────────────────────┤
│                                                  │
│ Connection string:                               │
│ postgresql://postgres.xxxx:password@aws-...     │
│                                  [Copy icon]     │
│                                                  │
│ ☑ Session pool (recommended for serverless)      │
│  ○ Transaction pool                              │
│                                                  │
└──────────────────────────────────────────────────┘
```

- **Pastikan "Session pool" tercentang** (recommended untuk Next.js)
- **COPY connection string** → Simpan

---

## PART 2: Set Environment Variables di Vercel

Sekarang Anda punya 4 credentials:
```
✅ PROJECT_URL: https://xxxxxxxxxxxx.supabase.co
✅ ANON_KEY: eyJhbGc...
✅ SERVICE_ROLE_KEY: eyJhbGc...
✅ DATABASE_URL: postgresql://postgres...
```

### Step 2.1: Buka Project di Vercel

1. Pergi ke https://vercel.com/dashboard
2. Cari dan klik project **"ai-studio-applet"**

### Step 2.2: Buka Settings

Di halaman project, lihat navigation bar atas:
```
┌─────────────────────────────────┐
│ [Deployments] [Settings] [...]   │
└─────────────────────────────────┘
```

Klik **"Settings"** (icon roda gigi)

### Step 2.3: Buka Environment Variables

Di sidebar Settings:
```
Sidebar:
├─ General
├─ Git
├─ Environment Variables ← KLIK INI
├─ Domains
├─ Analytics
└─ ...
```

Klik **"Environment Variables"** atau **"Vars"**

### Step 2.4: Tambah Variable #1 - NEXT_PUBLIC_SUPABASE_URL

1. Klik **"Add New"** atau **"+"**

2. Form yang muncul:
```
┌─────────────────────────────────┐
│ Name:         [_________________]│
│ Value:        [_________________]│
│ Environments: ☑ Production       │
│              ☑ Preview          │
│              ☑ Development       │
│              [Save] [Cancel]     │
└─────────────────────────────────┘
```

3. Isi dengan:
   - **Name:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** Paste Project URL dari Step 1.3
   - **Environments:** Centang semuanya (Production, Preview, Development)

4. Klik **"Save"**

### Step 2.5: Tambah Variable #2 - NEXT_PUBLIC_SUPABASE_ANON_KEY

1. Klik **"Add New"** lagi
2. Isi:
   - **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value:** Paste anon key dari Step 1.4
   - **Environments:** Centang semuanya
3. Klik **"Save"**

### Step 2.6: Tambah Variable #3 - SUPABASE_SERVICE_ROLE_KEY

1. Klik **"Add New"** lagi
2. Isi:
   - **Name:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** Paste service_role key dari Step 1.4
   - **Environments:** Centang semuanya
3. Klik **"Save"**

### Step 2.7: Tambah Variable #4 - DATABASE_URL

1. Klik **"Add New"** lagi
2. Isi:
   - **Name:** `DATABASE_URL`
   - **Value:** Paste connection string dari Step 1.5
   - **Environments:** Centang semuanya
3. Klik **"Save"**

✅ Selesai! Semua environment variables sudah tersimpan di Vercel.

---

## PART 3: Jalankan Migrasi Database

### Step 3.1: Generate Migrations

Sebelum jalankan migrasi, saya sudah membuat script untuk generate migrations dari schema Drizzle.

Jalankan command:
```bash
npm run db:generate
```

**Output yang diharapkan:**
```
✓ Generated migration: migrations/0001_initial_schema.sql
✓ Generated migration: migrations/0002_add_indexes.sql
```

### Step 3.2: Jalankan Migrasi ke Supabase

Sekarang jalankan migrasi ke database Supabase:

```bash
npm run db:push
```

**Output yang diharapkan:**
```
✓ Pushing migrations to Supabase...
✓ Applied migration: 0001_initial_schema.sql
✓ Applied migration: 0002_add_indexes.sql
✓ All migrations applied successfully!
```

**Apa yang akan terjadi:**
- ✅ Membuat semua tables (users, products, categories, etc)
- ✅ Membuat enums (user_role, product_type, dll)
- ✅ Membuat relationships (foreign keys)
- ✅ Membuat indexes untuk performance

### Step 3.3: Verifikasi di Supabase

1. Buka https://supabase.com dashboard
2. Klik project Anda
3. Di sidebar, klik **"SQL Editor"** atau **"Database"** → **"Tables"**
4. Anda akan melihat daftar tables yang baru dibuat:
   - users
   - categories
   - products
   - variants
   - transactions
   - etc.

---

## PART 4: Test Koneksi Database

Sekarang test apakah koneksi database benar-benar working:

### Step 4.1: Jalankan Test Script

```bash
npm run db:test
```

**Output yang diharapkan:**
```
🔍 Testing Supabase Connection...

📍 Connecting to Supabase...
   Database URL: postgresql://postgres.xxx...

✓ Running test query...
✅ SUCCESS: Connected to Supabase!
   Current Time: 2026-06-21 12:34:56.789+00
   PostgreSQL Version: PostgreSQL 15.2 on x86_64...

✓ Checking database schema...

✅ Found 13 tables in database:
   1. categories
   2. product_combos
   3. product_variants
   4. products
   5. raw_materials
   6. recipe_items
   7. recipes
   8. transaction_items
   9. transactions
   10. users
   11. variants
   12. variant_options

✓ Checking custom types (enums)...

✅ Found 5 custom enums:
   1. payment_method
   2. product_type
   3. transaction_status
   4. user_role
   5. variant_type

==================================================
✅ All tests passed! Supabase is connected correctly.
==================================================
```

### Step 4.2: Troubleshooting

Jika ada error, ikuti troubleshooting berdasarkan error message:

**Error: "DATABASE_URL environment variable is not set"**
```
Solusi:
1. Pastikan DATABASE_URL sudah ditambahkan di Vercel environment variables
2. Tunggu 1-2 menit agar variables ter-sync
3. Try redeploy atau restart dev server
```

**Error: "ECONNREFUSED"**
```
Solusi:
1. Pastikan DATABASE_URL format benar
2. Copy ulang dari Supabase dashboard
3. Check internet connection
```

**Error: "password authentication failed"**
```
Solusi:
1. Copy DATABASE_URL lagi dari Supabase
2. Pastikan tidak ada typo di password
3. Coba generate new password di Supabase Settings → Database
```

---

## ✅ Checklist Selesai

- [ ] Sudah ambil PROJECT_URL dari Supabase
- [ ] Sudah ambil ANON_KEY dari Supabase
- [ ] Sudah ambil SERVICE_ROLE_KEY dari Supabase
- [ ] Sudah ambil DATABASE_URL dari Supabase
- [ ] Sudah add semua 4 env vars di Vercel
- [ ] Sudah jalankan `npm run db:generate`
- [ ] Sudah jalankan `npm run db:push`
- [ ] Sudah jalankan `npm run db:test` dan berhasil
- [ ] Sudah lihat tables muncul di Supabase dashboard

Jika semua checklist sudah ✅, project Anda sudah siap digunakan dengan Supabase!

---

## Next Steps

Setelah semua setup selesai, Anda bisa:

1. **Jalankan dev server:**
   ```bash
   npm run dev
   ```

2. **Test API routes** yang connect ke Supabase

3. **Mulai migrate data** dari Firestore ke Supabase (jika ada)

4. **Deploy ke Vercel** dan production Supabase

---

**Good luck! 🚀**
