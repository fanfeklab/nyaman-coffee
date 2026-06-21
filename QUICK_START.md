# ⚡ Quick Start - Setup Supabase

## 🎯 3 Langkah Setup (5 menit)

### Step 1: Copy 4 Credentials dari Supabase

**Dari Supabase Dashboard → Settings → API:**
```
1. PROJECT URL:              https://xxxxxxxxxxxx.supabase.co
2. ANON KEY:                 eyJhbGc...
3. SERVICE_ROLE KEY:         eyJhbGc...
```

**Dari Supabase Dashboard → Settings → Database → Connection Pooler:**
```
4. DATABASE URL:             postgresql://postgres...
```

### Step 2: Add Environment Variables di Vercel

**Buka:** https://vercel.com/dashboard → ai-studio-applet → Settings → Environment Variables

**Add 4 variables:**
| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | [PROJECT URL dari Step 1] |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | [ANON KEY dari Step 1] |
| `SUPABASE_SERVICE_ROLE_KEY` | [SERVICE_ROLE KEY dari Step 1] |
| `DATABASE_URL` | [DATABASE URL dari Step 1] |

### Step 3: Jalankan Migrasi

```bash
# Generate migrations dari schema
npm run db:generate

# Push ke Supabase
npm run db:push

# Test koneksi
npm run db:test
```

## ✅ Sukses!

Jika `npm run db:test` menunjukkan:
```
✅ SUCCESS: Connected to Supabase!
✅ Found X tables in database
✅ All tests passed!
```

Semuanya sudah setup! Anda bisa jalankan:
```bash
npm run dev
```

---

## 📍 Menu References

### Supabase Dashboard
- **Settings → API:** Ambil PROJECT_URL, ANON_KEY, SERVICE_ROLE_KEY
- **Settings → Database:** Ambil DATABASE_URL (Session pool)

### Vercel Dashboard
- **Settings → Environment Variables:** Add/edit env vars

---

## 🆘 Troubleshooting

| Error | Solusi |
|-------|--------|
| `DATABASE_URL is not set` | Add DATABASE_URL di Vercel env vars, tunggu sync |
| `ECONNREFUSED` | Copy DATABASE_URL lagi dari Supabase |
| `password authentication failed` | Cek password di DATABASE_URL, atau generate baru |
| `ENOTFOUND / getaddrinfo` | Check internet, copy DATABASE_URL lagi |

---

**Untuk detail lengkap:** Baca `SUPABASE_SETUP.md`
