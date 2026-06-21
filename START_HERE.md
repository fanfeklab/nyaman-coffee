# 🎯 START HERE - Setup Guide

Selamat datang! Saya sudah mempersiapkan semuanya untuk Anda setup Supabase dari 0. Mulai dari sini. ⬇️

---

## 📍 Anda ada di mana?

### ✅ Sudah punya Supabase project?
**→ Lanjut ke [STEP 1](#step-1-ambil-credentials-dari-supabase-5-menit)**

### ❌ Belum punya Supabase project?
**→ Buat dulu di https://supabase.com**
1. Klik "Sign Up" atau "New Project"
2. Isi nama project (misal: "nyaman-coffee")
3. Tunggu project selesai dibuat (~2 menit)
4. Lanjut ke [STEP 1](#step-1-ambil-credentials-dari-supabase-5-menit)

---

## 🚀 SETUP FLOW (Total: 15 menit)

### ⏱️ STEP 1: Ambil Credentials dari Supabase (5 menit)

Pergi ke: https://supabase.com/dashboard

#### 1.1 Ambil PROJECT_URL
1. Klik project Anda
2. Di sidebar kiri: **Settings** → **API**
3. Cari "Project URL"
4. **Copy** nilai-nya
   ```
   Contoh: https://abc123.supabase.co
   ```

#### 1.2 Ambil ANON_KEY
- Masih di Settings → API
- Cari "Project API Keys" → "anon (public)"
- **Copy** nilai-nya

#### 1.3 Ambil SERVICE_ROLE_KEY
- Masih di Settings → API
- Cari "Project API Keys" → "service_role (secret)"
- **Copy** nilai-nya
- ⚠️ Jangan share ke siapapun!

#### 1.4 Ambil DATABASE_URL
1. Di sidebar: **Settings** → **Database**
2. Cari "Connection Pooler"
3. Pastikan **"Session pool"** tercentang
4. **Copy** connection string-nya
   ```
   Contoh: postgresql://postgres.xxxx:password@aws-0-xxxxx.pooler.supabase.com:6543/postgres
   ```

**✅ Simpan 4 credentials di tempat aman (notepad/password manager)**

---

### ⏱️ STEP 2: Add Environment Variables di Vercel (5 menit)

Pergi ke: https://vercel.com/dashboard

#### 2.1 Buka Project Settings
1. Cari project **"ai-studio-applet"**
2. Klik project → **Settings** (icon roda gigi)

#### 2.2 Buka Environment Variables
1. Di sidebar Settings: **Environment Variables** (atau **Vars**)
2. Klik **"Add New"** atau **"+"**

#### 2.3 Add Variable #1: NEXT_PUBLIC_SUPABASE_URL
```
Name:  NEXT_PUBLIC_SUPABASE_URL
Value: [PROJECT_URL dari Step 1.1]

Environments:
☑ Production
☑ Preview  
☑ Development

[Save]
```

#### 2.4 Add Variable #2: NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Name:  NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [ANON_KEY dari Step 1.2]

Environments:
☑ Production
☑ Preview  
☑ Development

[Save]
```

#### 2.5 Add Variable #3: SUPABASE_SERVICE_ROLE_KEY
```
Name:  SUPABASE_SERVICE_ROLE_KEY
Value: [SERVICE_ROLE_KEY dari Step 1.3]

Environments:
☑ Production
☑ Preview  
☑ Development

[Save]
```

#### 2.6 Add Variable #4: DATABASE_URL
```
Name:  DATABASE_URL
Value: [DATABASE_URL dari Step 1.4]

Environments:
☑ Production
☑ Preview  
☑ Development

[Save]
```

**✅ Tunggu 1-2 menit agar variables ter-sync**

---

### ⏱️ STEP 3: Jalankan Migrasi (2 menit)

Buka **Terminal** di project directory dan jalankan:

```bash
# Step 3.1: Generate migrations
npm run db:generate

# Step 3.2: Push ke Supabase
npm run db:push

# Step 3.3: Test koneksi
npm run db:test
```

**Expected output untuk `npm run db:test`:**
```
🔍 Testing Supabase Connection...

📍 Connecting to Supabase...
✅ SUCCESS: Connected to Supabase!

✓ Checking database schema...
✅ Found 13 tables in database
   1. categories
   2. products
   3. users
   ... (other tables)

✓ Checking custom types (enums)...
✅ Found 5 custom enums

==================================================
✅ All tests passed! Supabase is connected correctly.
==================================================
```

**✅ Jika output seperti di atas, SETUP SELESAI!** 🎉

---

## ❓ Ada Error?

### Error: "DATABASE_URL is not set"
```
✅ Solusi:
1. Pastikan DATABASE_URL sudah ditambah di Vercel
2. Tunggu 1-2 menit sync
3. Restart terminal
4. Jalankan npm run db:test lagi
```

### Error: "ECONNREFUSED" atau "getaddrinfo"
```
✅ Solusi:
1. Copy DATABASE_URL lagi dari Supabase
2. Pastikan format benar (Session pool, bukan Transaction)
3. Pastikan internet connection OK
```

### Error: "password authentication failed"
```
✅ Solusi:
1. Copy DATABASE_URL lagi dengan teliti
2. Pastikan tidak ada typo di password
3. Atau generate password baru di Supabase Settings → Database
```

**Masih error? Baca troubleshooting detail di `SUPABASE_SETUP.md`**

---

## ✅ Checklist (Pastikan Semua Sudah ✓)

- [ ] Sudah ambil 4 credentials dari Supabase
- [ ] Sudah add 4 env vars di Vercel
- [ ] Sudah jalankan `npm run db:generate`
- [ ] Sudah jalankan `npm run db:push`
- [ ] Sudah jalankan `npm run db:test` dan berhasil

**Jika semua ✓, lanjut ke next steps di bawah!**

---

## 🎓 Next Steps (Setelah Setup)

### 1. Setup Local Development

```bash
# Create .env.local file
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres...
GEMINI_API_KEY=your_key_here
APP_URL=http://localhost:3000
EOF

# Test koneksi
npm run db:test

# Start dev server
npm run dev
```

**→ Buka browser: http://localhost:3000**

### 2. Baca Documentation

Baca file-file ini untuk detail lebih:

| File | Tujuan |
|------|--------|
| `SUPABASE_SETUP.md` | Panduan lengkap dengan detail |
| `QUICK_START.md` | Quick reference |
| `LOCAL_DEVELOPMENT.md` | Development setup lokal |
| `DOCS_INDEX.md` | Index semua dokumentasi |

### 3. Start Building

Mulai develop features Anda!

**Contoh: Create first API route**
```typescript
// app/api/products/route.ts
import { db } from '@/lib/db/index'
import { products } from '@/lib/db/schema'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const allProducts = await db.select().from(products)
    return NextResponse.json(allProducts)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

→ Lihat lebih banyak examples di `LOCAL_DEVELOPMENT.md`

---

## 📚 Documentation Map

```
START_HERE.md (Anda di sini)
    ↓
    ├─→ QUICK_START.md (Quick reference)
    │
    ├─→ SUPABASE_SETUP.md (Detail lengkap + troubleshooting)
    │   ├─ PART 1: Get credentials
    │   ├─ PART 2: Set env vars
    │   ├─ PART 3: Run migration
    │   ├─ PART 4: Test connection
    │   └─ Troubleshooting
    │
    ├─→ SETUP_FLOW.txt (Visual diagram)
    │
    ├─→ LOCAL_DEVELOPMENT.md (Local dev setup)
    │   ├─ Setup environment
    │   ├─ Database operations
    │   ├─ Create API routes
    │   ├─ Best practices
    │   └─ Debugging tips
    │
    └─→ DOCS_INDEX.md (All documentation index)
```

---

## 💡 Tips & Tricks

**Tip 1: Save Credentials**
```
Simpan 4 credentials ini di password manager atau vault:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- DATABASE_URL

⚠️ Jangan share atau commit ke Git!
```

**Tip 2: Test Regularly**
```bash
# Jalankan sebelum deploy atau push
npm run db:test
```

**Tip 3: Check Logs**
```
Supabase Dashboard → Settings → Logs → Query Performance
(untuk debugging database issues)
```

---

## 🚀 Ready?

**Anda sudah siap!** Ikuti 3 steps di atas (15 menit total) dan project akan terkoneksi ke Supabase.

---

**Questions?**
- Baca detail di `SUPABASE_SETUP.md`
- Cek `DOCS_INDEX.md` untuk index lengkap
- Lihat troubleshooting di dokumentasi

**Good luck! 🎉**

---

*Next: Jalankan STEP 1 (ambil credentials dari Supabase)*
