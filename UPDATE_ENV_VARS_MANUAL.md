# 📝 PANDUAN MANUAL: UPDATE ENV VARS DI VERCEL UI

Karena env vars hanya di-set untuk Preview/Production, kita perlu update manual di Vercel dashboard.

## 🎯 Tujuan
Tambahkan **Development** scope ke semua 13 env vars sehingga bisa di-pull ke `.env.local` untuk local development.

---

## 📍 LANGKAH DEMI LANGKAH

### **STEP 1: Buka Vercel Dashboard**

1. Pergi ke: https://vercel.com/dashboard
2. Masuk dengan akun Anda (jika belum login)
3. Cari project **"nyaman-coffee"** atau **"ai-studio-applet"**
4. **KLIK project** untuk membukanya

### **STEP 2: Buka Settings → Environment Variables**

Setelah project terbuka:

```
Dashboard Project View:
┌─────────────────────────────────────────┐
│  Deployments  Settings  ...             │  ← Di atas
│                                         │
│  [Project Name: nyaman-coffee]          │
│                                         │
└─────────────────────────────────────────┘
```

1. Klik **"Settings"** (di navbar atas, sebelah Deployments)
2. Di sidebar kiri, scroll dan cari **"Environment Variables"**
   ```
   Sidebar:
   ├─ General
   ├─ Git
   ├─ Environment Variables ← KLIK INI
   ├─ Domains
   ├─ Analytics
   └─ ...
   ```
3. Klik **"Environment Variables"**

### **STEP 3: Lihat Daftar Env Vars**

Anda akan melihat tabel dengan kolom:
```
┌──────────────────────┬────────────────┬──────────────────────┐
│ Name                 │ Environment    │ Value (encrypted)    │
├──────────────────────┼────────────────┼──────────────────────┤
│ NEXT_POSTGRES_HOST   │ Preview+       │ [dots/asterisks]     │
│ NEXT_POSTGRES_URL    │ Production     │ [dots/asterisks]     │
│ NEXT_SUPABASE_URL    │ Production     │ [dots/asterisks]     │
│ ...                  │ ...            │ ...                  │
└──────────────────────┴────────────────┴──────────────────────┘
```

### **STEP 4: Update Setiap Variable untuk Tambah Development Scope**

**Untuk SETIAP variable** (mulai dari yang pertama):

1. **KLIK nama variable** (misalnya "NEXT_POSTGRES_HOST")
   ```
   Akan muncul modal/popup seperti:
   ┌────────────────────────────────────────┐
   │ Edit NEXT_POSTGRES_HOST                │
   ├────────────────────────────────────────┤
   │                                        │
   │ Name: NEXT_POSTGRES_HOST               │
   │ Value: [encrypted - tidak bisa dilihat]│
   │                                        │
   │ Environments:                          │
   │ ☑ Production                           │
   │ ☑ Preview                              │
   │ ☐ Development                          │
   │                                        │
   │ [Cancel]  [Save]                       │
   └────────────────────────────────────────┘
   ```

2. **CENTANG checkbox "Development"** (ubah dari ☐ menjadi ☑)
   
3. **KLIK "Save"**

4. **Tunggu notifikasi "Updated"** muncul (beberapa detik)

5. **Ulangi untuk variable berikutnya**

---

## 📋 DAFTAR SEMUA VARIABLES YANG PERLU DI-UPDATE

Centang saat sudah di-update:

- [ ] NEXT_POSTGRES_DATABASE
- [ ] NEXT_POSTGRES_HOST
- [ ] NEXT_POSTGRES_PASSWORD
- [ ] NEXT_POSTGRES_PRISMA_URL
- [ ] NEXT_POSTGRES_URL
- [ ] NEXT_POSTGRES_URL_NON_POOLING
- [ ] NEXT_POSTGRES_USER
- [ ] NEXT_SUPABASE_ANON_KEY
- [ ] NEXT_SUPABASE_JWT_SECRET
- [ ] NEXT_SUPABASE_SECRET_KEY
- [ ] NEXT_SUPABASE_SERVICE_ROLE_KEY
- [ ] NEXT_SUPABASE_URL
- [ ] NEXT_PUBLIC_NEXT_SUPABASE_PUBLISHABLE_KEY

**Total: 13 variables**

---

## ⏱️ ESTIMASI WAKTU
- **~5-10 menit** untuk update semua (1 klik + 1 save per variable)

---

## ✅ VERIFIKASI SETELAH SELESAI

Setelah update semua:

```bash
# Pull ulang env vars
npx vercel env pull --scope team_W2ISZnqaZcYLO2T5H1TSIwBT -y

# Cek berapa banyak variable yang ter-pull
wc -l .env.local

# Seharusnya banyak line (minimal 20+, bukan hanya 2-3)
```

---

## 🎯 TARGET HASIL

Setelah update, file `.env.local` akan berisi:

```
NEXT_POSTGRES_DATABASE=...
NEXT_POSTGRES_HOST=...
NEXT_POSTGRES_PASSWORD=...
NEXT_POSTGRES_PRISMA_URL=...
NEXT_POSTGRES_URL=...
NEXT_POSTGRES_URL_NON_POOLING=...
NEXT_POSTGRES_USER=...
NEXT_SUPABASE_ANON_KEY=...
NEXT_SUPABASE_JWT_SECRET=...
NEXT_SUPABASE_SECRET_KEY=...
NEXT_SUPABASE_SERVICE_ROLE_KEY=...
NEXT_SUPABASE_URL=...
NEXT_PUBLIC_NEXT_SUPABASE_PUBLISHABLE_KEY=...
```

Baru saat itu bisa jalankan:
```bash
npm run db:test
```

---

## 🆘 STUCK? 

Jika ada yang salah:
1. Screenshot halaman Environment Variables
2. Cek kolom "Environments" - harusnya terlihat: `Production` `Preview` `Development`
3. Pastikan tidak ada variable yang kosong (tidak ada value)

