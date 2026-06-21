# 📚 Documentation Index

Dokumentasi lengkap untuk setup dan development project Nyaman Coffee.

---

## 🚀 Quick Access

### **I want to...**

- **Setup Supabase dari 0**
  → Baca: [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) (Panduan detail)
  → Atau: [`QUICK_START.md`](./QUICK_START.md) (Ringkasan 5 menit)

- **Understand the setup flow**
  → Lihat: [`SETUP_FLOW.txt`](./SETUP_FLOW.txt) (Visual diagram)

- **Setup local development**
  → Baca: [`LOCAL_DEVELOPMENT.md`](./LOCAL_DEVELOPMENT.md)

- **Understand what was prepared**
  → Baca: [`SETUP_SUMMARY.md`](./SETUP_SUMMARY.md)

- **Check env vars template**
  → Lihat: [`.env.example`](./.env.example)

---

## 📖 Documentation Files

### 1. **SUPABASE_SETUP.md** ⭐ (RECOMMENDED)
**Untuk:** Setup Supabase dari awal dengan detail lengkap

**Isi:**
- Step-by-step setup dengan menu references
- Cara ambil credentials dari Supabase dashboard
- Cara set environment variables di Vercel
- Cara jalankan migrasi database
- Cara test koneksi
- Troubleshooting lengkap dengan solusi

**Waktu:** 15-20 menit

**Kapan baca:** Pertama kali setup project

---

### 2. **QUICK_START.md** ⚡
**Untuk:** Quick reference untuk yang sudah tahu caranya

**Isi:**
- 3 langkah setup ringkas (5 menit)
- Tabel env vars yang diperlukan
- Menu references quick
- Troubleshooting singkat

**Waktu:** 5 menit

**Kapan baca:** Saat ingin recap atau setup cepat

---

### 3. **SETUP_FLOW.txt** 📊
**Untuk:** Visual diagram flow setup

**Isi:**
- ASCII diagram untuk setiap step
- Credentials cheat sheet
- Terminal commands reference
- Supabase & Vercel locations

**Kapan lihat:** Saat kurang jelas dengan step setup

---

### 4. **SETUP_SUMMARY.md** 📋
**Untuk:** Ringkasan apa yang sudah disiapkan

**Isi:**
- File yang sudah dibuat
- Langkah-langkah setup
- Credentials yang dibutuhkan
- Command reference
- Common issues & solutions

**Kapan baca:** Saat mau tahu apa yang sudah dipersiapkan

---

### 5. **LOCAL_DEVELOPMENT.md** 💻
**Untuk:** Setup dan development secara lokal

**Isi:**
- Setup local environment
- Database operations examples
- Creating API routes
- Useful commands
- Troubleshooting
- Best practices
- Debugging tips

**Kapan baca:** Saat mau develop project secara lokal

---

### 6. **.env.example** 🔑
**Untuk:** Template environment variables

**Isi:**
- List semua env vars yang diperlukan
- Penjelasan untuk setiap var
- Contoh format
- Warning untuk sensitive data

**Kapan gunakan:** Copy ke `.env.local` untuk local development

---

## 🎯 Setup Workflow (Overview)

```
┌─────────────────────────────────────┐
│ START: Baca QUICK_START.md atau     │
│        SUPABASE_SETUP.md            │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ STEP 1: Ambil credentials dari      │
│         Supabase dashboard          │
│         (5 menit)                   │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ STEP 2: Add env vars di Vercel      │
│         (5 menit)                   │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ STEP 3: Jalankan migrasi dari       │
│         terminal                    │
│         (2 menit)                   │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ SUCCESS: Supabase connected! ✅     │
│ Baca LOCAL_DEVELOPMENT.md untuk     │
│ next steps                          │
└─────────────────────────────────────┘
```

---

## 📚 Reading Order (Recommended)

### **Untuk Fresh Setup (Pertama Kali)**
1. [`QUICK_START.md`](./QUICK_START.md) - Baca cepat overview
2. [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) - Ikuti langkah-langkah detail
3. [`SETUP_FLOW.txt`](./SETUP_FLOW.txt) - Reference saat bingung dengan menu

### **Untuk Development Local**
1. [`LOCAL_DEVELOPMENT.md`](./LOCAL_DEVELOPMENT.md) - Setup lokal
2. [`.env.example`](./.env.example) - Copy template env vars

### **Untuk Reference Cepat**
- [`SETUP_SUMMARY.md`](./SETUP_SUMMARY.md) - Checklist & overview
- [`QUICK_START.md`](./QUICK_START.md) - Quick reference

### **Saat Ada Problem**
- [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) - Bagian Troubleshooting
- [`SETUP_FLOW.txt`](./SETUP_FLOW.txt) - Verify step Anda
- [`LOCAL_DEVELOPMENT.md`](./LOCAL_DEVELOPMENT.md) - Bagian Troubleshooting

---

## 🛠️ Scripts yang Tersedia

```bash
# Database
npm run db:generate     # Generate migrations dari schema
npm run db:push         # Push migrations ke Supabase
npm run db:test         # Test database connection

# Development
npm run dev             # Start dev server
npm run build           # Build production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run test            # Run tests

# Cleanup
npm run clean           # Clean build artifacts
```

---

## 📦 Files yang Sudah Disiapkan

```
project-root/
├── SUPABASE_SETUP.md           # ⭐ Panduan lengkap
├── QUICK_START.md              # ⚡ Ringkasan cepat
├── SETUP_FLOW.txt              # 📊 Visual diagram
├── SETUP_SUMMARY.md            # 📋 Ringkasan
├── LOCAL_DEVELOPMENT.md        # 💻 Local dev guide
├── DOCS_INDEX.md               # 📚 File ini
├── .env.example                # 🔑 Template env vars
├── package.json                # (ditambah 4 scripts baru)
└── scripts/
    └── test-db-connection.js   # 🧪 Test script
```

---

## ✅ Checklist

Pastikan sudah:
- [ ] Baca QUICK_START.md atau SUPABASE_SETUP.md
- [ ] Ambil 4 credentials dari Supabase
- [ ] Add 4 env vars di Vercel
- [ ] Jalankan `npm run db:generate`
- [ ] Jalankan `npm run db:push`
- [ ] Jalankan `npm run db:test` dan berhasil
- [ ] Baca LOCAL_DEVELOPMENT.md untuk next steps

---

## 🆘 Need Help?

| Pertanyaan | Jawaban Ada Di |
|-----------|----------------|
| Bagaimana cara ambil credentials Supabase? | SUPABASE_SETUP.md → PART 1 |
| Bagaimana cara add env vars di Vercel? | SUPABASE_SETUP.md → PART 2 |
| Bagaimana cara jalankan migrasi? | SUPABASE_SETUP.md → PART 3 |
| Bagaimana cara test koneksi? | SUPABASE_SETUP.md → PART 4 |
| Error "DATABASE_URL is not set" | SETUP_SUMMARY.md → Troubleshooting |
| Mau develop lokal gimana? | LOCAL_DEVELOPMENT.md |
| Apa script yang tersedia? | SETUP_SUMMARY.md atau SETUP_FLOW.txt |

---

## 🚀 Next Steps

Setelah setup selesai:

1. **Local Development**
   ```bash
   # Baca LOCAL_DEVELOPMENT.md
   npm run dev
   ```

2. **Create First API Route**
   - Baca contoh di LOCAL_DEVELOPMENT.md
   - Create `/app/api/products/route.ts`

3. **Build Features**
   - Use database queries dari examples
   - Follow Drizzle ORM patterns

4. **Deploy**
   - Vercel handles env vars automatically
   - Just push ke Git

---

## 📝 Notes

- **Don't commit `.env.local`** - Add ke `.gitignore` (sudah ada)
- **Don't share credentials** - Keep DATABASE_URL safe
- **Test regularly** - Run `npm run db:test` sebelum deploy
- **Use Session pool** - Jangan Transaction pool untuk Next.js

---

## 📞 Support

Untuk bantuan lebih lanjut:
1. Check troubleshooting di setiap doc
2. Verify env vars di Vercel
3. Run `npm run db:test` untuk diagnose
4. Check Supabase logs di dashboard

---

**Happy coding! 🚀**

---

*Last updated: June 21, 2026*
*Project: Nyaman Coffee*
*Status: Setup Ready ✅*
