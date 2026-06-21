# ✅ VERIFIKASI ENVIRONMENT VARIABLES DI VERCEL

## 🔍 Langkah Verifikasi

### **Step 1: Buka Vercel Project Settings**

1. Pergi ke https://vercel.com/dashboard
2. Pilih project **"ai-studio-applet"** 
3. Klik **"Settings"** (roda gigi icon)
4. Di sidebar, klik **"Environment Variables"**

### **Step 2: Verifikasi Setiap Variable**

Anda seharusnya melihat daftar seperti ini:

```
✅ NEXT_POSTGRES_DATABASE
   └─ Environments: Preview, Production
   └─ Value: [ENCRYPTED - should show dots/asterisks]

✅ NEXT_POSTGRES_HOST  
   └─ Environments: Preview, Production
   └─ Value: [ENCRYPTED]

✅ NEXT_POSTGRES_PASSWORD
   └─ Environments: Preview, Production
   └─ Value: [ENCRYPTED]

✅ NEXT_POSTGRES_URL
   └─ Environments: Preview, Production
   └─ Value: [ENCRYPTED]

✅ NEXT_POSTGRES_URL_NON_POOLING
   └─ Environments: Preview, Production
   └─ Value: [ENCRYPTED]

✅ NEXT_POSTGRES_USER
   └─ Environments: Preview, Production
   └─ Value: [ENCRYPTED]

✅ NEXT_SUPABASE_URL
   └─ Environments: Preview, Production
   └─ Value: [ENCRYPTED]

✅ NEXT_SUPABASE_ANON_KEY
   └─ Environments: Preview, Production
   └─ Value: [ENCRYPTED]

✅ NEXT_SUPABASE_SERVICE_ROLE_KEY
   └─ Environments: Preview, Production
   └─ Value: [ENCRYPTED]

✅ NEXT_SUPABASE_SECRET_KEY
   └─ Environments: Preview, Production
   └─ Value: [ENCRYPTED]

✅ NEXT_SUPABASE_JWT_SECRET
   └─ Environments: Preview, Production
   └─ Value: [ENCRYPTED]
```

### **Step 3: Check Environment Scope**

❗ **PENTING:** Pastikan setiap variable di-check untuk **Development environment**!

Untuk setiap variable:
1. Klik nama variable
2. Di modal yang muncul, cari checkbox:
   - ☐ Production
   - ☐ Preview
   - ☐ Development ← **PASTIKAN INI DI-CHECK!**

Jika belum di-check "Development", maka:
1. Klik variable
2. Di modal, centang **"Development"** 
3. Klik **"Save"**

### **Step 4: Lakukan untuk Semua Variables**

Ulangi Step 3 untuk semua 11 variables agar semuanya di-set untuk Production, Preview, DAN Development.

---

## 🚨 Troubleshooting

### **Issue: Value terlihat kosong (tidak ada dots/asterisks)**

Kemungkinan:
1. Anda belum memasukkan value, hanya nama saja
2. Value belum ter-save

**Solusi:**
- Klik variable
- Pastikan field "Value" tidak kosong
- Copy-paste value dari Supabase lagi
- Klik "Save"

### **Issue: Variable hanya untuk Preview/Production, tidak Development**

Kemungkinan:
- Saat membuat variable, Anda hanya check Production/Preview, tidak Development

**Solusi:**
1. Klik setiap variable
2. Centang checkbox **"Development"**
3. Klik **"Save"**

### **Issue: Development environment tidak terlihat**

Kemungkinan:
- Anda belum set staging/development branch

**Solusi:**
- Di modal variable, pastikan ada 3 checkbox: Production, Preview, Development
- Jika hanya ada 2, mungkin environment development perlu di-setup terlebih dahulu

---

## ✅ Checklist

Setelah verifikasi, pastikan:

- [ ] Semua 11 variables sudah ada
- [ ] Setiap variable punya value (tidak kosong)
- [ ] Setiap variable di-check untuk Development environment (minimal Preview)
- [ ] Value terenkripsi (terlihat dots/asterisks)

---

## 📝 Setelah Verifikasi

Setelah memastikan semua benar, jalankan:

```bash
# Clear existing env files
rm -f .env.local .env.development.local

# Pull ulang env vars dari Vercel
npx vercel env pull .env.local --scope team_W2ISZnqaZcYLO2T5H1TSIwBT -y

# Test koneksi database
npm run db:test
```

Expected output:
```
✅ Database connection successful!
   ✓ PostgreSQL version: 15.x
   ✓ Tables found: 15
   ✓ All systems operational
```

---

**Jika masih error, hubungi support dengan screenshot dari Settings → Environment Variables**
