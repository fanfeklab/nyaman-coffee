# 📦 Setup Summary - Apa yang Sudah Disiapkan

Saya sudah mempersiapkan semua yang diperlukan untuk migrasi dari Firestore ke Supabase. Berikut ringkasannya:

---

## 📁 File yang Sudah Dibuat

### 1. **SUPABASE_SETUP.md** (Panduan Lengkap)
- Panduan step-by-step dengan screenshot menu
- Cara ambil credentials dari Supabase
- Cara set env vars di Vercel
- Cara jalankan migrasi
- Cara test koneksi
- Troubleshooting lengkap

### 2. **QUICK_START.md** (Quick Reference)
- Ringkasan 3 langkah setup (5 menit)
- Tabel env vars yang diperlukan
- Menu references
- Troubleshooting cepat

### 3. **.env.example** (Template Environment Variables)
- Template lengkap semua env vars yang diperlukan
- Penjelasan untuk setiap variable
- Warning untuk sensitive data

### 4. **scripts/test-db-connection.js** (Test Script)
- Script untuk test koneksi ke Supabase
- Menunjukkan current time, PostgreSQL version
- List semua tables
- List semua custom enums
- Troubleshooting otomatis

### 5. **package.json** (Scripts Baru)
Sudah ditambah 4 scripts baru:
```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:push": "drizzle-kit push",
"db:test": "node scripts/test-db-connection.js"
```

---

## 🎯 Langkah-Langkah Setup (Step by Step)

### **STEP 1: Ambil Credentials dari Supabase** (5 menit)

Pergi ke https://supabase.com/dashboard

#### 1.1 Ambil PROJECT_URL
- Settings → API
- Cari "Project URL"
- Copy: `https://xxxxxxxxxxxx.supabase.co`

#### 1.2 Ambil API KEYS
- Settings → API
- Cari "Project API Keys"
- Copy "anon" key: `eyJhbGc...`
- Copy "service_role" key: `eyJhbGc...`

#### 1.3 Ambil DATABASE_URL
- Settings → Database
- Cari "Connection Pooler"
- Pastikan "Session pool" tercentang
- Copy: `postgresql://postgres...`

### **STEP 2: Set Environment Variables di Vercel** (5 menit)

Pergi ke https://vercel.com/dashboard → ai-studio-applet → Settings → Environment Variables

Tambah 4 variables:
```
1. Name: NEXT_PUBLIC_SUPABASE_URL
   Value: [PROJECT_URL dari step 1.1]

2. Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: [anon key dari step 1.2]

3. Name: SUPABASE_SERVICE_ROLE_KEY
   Value: [service_role key dari step 1.2]

4. Name: DATABASE_URL
   Value: [DATABASE_URL dari step 1.3]
```

Klik "Save" untuk setiap variable.

### **STEP 3: Jalankan Migrasi** (2 menit)

Di terminal, jalankan commands berikut:

```bash
# 1. Generate migrations dari schema Drizzle
npm run db:generate

# 2. Push ke Supabase
npm run db:push

# 3. Test koneksi
npm run db:test
```

Expected output untuk `npm run db:test`:
```
✅ SUCCESS: Connected to Supabase!
✅ Found 13 tables in database
✅ All tests passed!
```

---

## 📋 Credentials yang Dibutuhkan

Anda perlu 4 credentials dari Supabase:

| No | Nama | Dari Mana | Contoh |
|----|------|----------|---------|
| 1 | PROJECT_URL | Settings → API → Project URL | `https://abc123.supabase.co` |
| 2 | ANON_KEY | Settings → API → Project API Keys → anon | `eyJhbGc...` |
| 3 | SERVICE_ROLE_KEY | Settings → API → Project API Keys → service_role | `eyJhbGc...` |
| 4 | DATABASE_URL | Settings → Database → Connection Pooler → Session pool | `postgresql://postgres...` |

---

## ✅ Checklist Sebelum Jalankan Migrasi

Pastikan sudah:
- [ ] Buat project di Supabase (atau gunakan yang existing)
- [ ] Sudah copy 4 credentials di atas
- [ ] Sudah add semua 4 env vars di Vercel
- [ ] Sudah tunggu 1-2 menit agar variables ter-sync ke deployment

---

## 🚀 Command Reference

```bash
# Generate migrations dari schema
npm run db:generate

# Migrate ke database
npm run db:push

# Test database connection
npm run db:test

# Development server
npm run dev

# Build production
npm run build
```

---

## 🆘 Common Issues & Solutions

### Issue: `DATABASE_URL is not set`
**Solution:**
1. Pastikan sudah add DATABASE_URL di Vercel env vars
2. Tunggu 1-2 menit sync
3. Restart dev server (`npm run dev`)

### Issue: `ECONNREFUSED`
**Solution:**
1. Copy DATABASE_URL lagi dari Supabase
2. Pastikan format benar (Session pool, bukan Transaction pool)
3. Check internet connection

### Issue: `password authentication failed`
**Solution:**
1. Copy DATABASE_URL lagi dengan teliti
2. Pastikan password di URL tidak ada typo
3. Atau generate password baru di Supabase

### Issue: Migrasi tidak running
**Solution:**
1. Pastikan semua 4 env vars sudah ter-set
2. Jalankan: `npm run db:generate` dulu
3. Baru jalankan: `npm run db:push`

---

## 📚 File Documentation

| File | Tujuan |
|------|--------|
| `SUPABASE_SETUP.md` | Panduan detail dengan menu references |
| `QUICK_START.md` | Quick reference (tldr version) |
| `.env.example` | Template env vars |
| `scripts/test-db-connection.js` | Test koneksi ke database |

---

## 🎓 Next Steps Setelah Setup

1. **Verify database sudah ter-setup:**
   ```bash
   npm run db:test
   ```

2. **Jalankan dev server:**
   ```bash
   npm run dev
   ```

3. **Update API routes** yang sebelumnya use Firestore menjadi use Supabase

4. **Migrate data** dari Firestore ke Supabase (jika ada data lama)

5. **Test aplikasi** di browser

6. **Deploy ke Vercel production** saat ready

---

## 💡 Tips

- **Backup credentials:** Simpan 4 credentials di tempat aman (password manager, vault)
- **Don't commit secrets:** `.env.local` dan Vercel env vars jangan di-commit ke Git
- **Use connection pooling:** Pakai "Session pool" bukan "Transaction pool" untuk Next.js
- **Test regularly:** Jalankan `npm run db:test` sebelum deploy

---

**Good luck! 🚀 Jika ada pertanyaan, refer ke SUPABASE_SETUP.md untuk detail lengkap.**
