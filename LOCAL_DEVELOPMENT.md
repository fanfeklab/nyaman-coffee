# 🖥️ Local Development dengan Supabase

Panduan untuk develop project secara lokal dengan Supabase.

---

## Setup Local Environment

### Step 1: Clone Repository (jika belum ada)

```bash
git clone https://github.com/fanfeklab/nyaman-coffee.git
cd nyaman-coffee
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create `.env.local` File

Buat file `.env.local` di root directory project:

```bash
# Di root project
cat > .env.local << 'EOF'
# Supabase Config (Copy dari Vercel environment variables)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres...

# Google AI (Optional)
GEMINI_API_KEY=your_gemini_key_here

# App URL
APP_URL=http://localhost:3000
EOF
```

### Step 4: Verify Environment Variables

```bash
# Test database connection
npm run db:test
```

Expected output:
```
🔍 Testing Supabase Connection...

📍 Connecting to Supabase...
✅ SUCCESS: Connected to Supabase!
✓ Checking database schema...
✅ Found X tables in database
✅ All tests passed!
```

### Step 5: Start Development Server

```bash
npm run dev
```

Output:
```
  ▲ Next.js 15.4.9
  - Local:        http://localhost:3000
  - Environments: .env.local

  ✓ Ready in 2.3s
```

Buka browser: http://localhost:3000

---

## Workflow Development

### Struktur Project

```
nyaman-coffee/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout
│   └── api/               # API routes (server-side)
│       └── [route]
│
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── features/         # Feature components
│   └── ...
│
├── lib/                   # Utilities & helpers
│   ├── db/               # Database functions
│   │   ├── schema.ts     # Drizzle schema
│   │   └── index.ts      # DB queries
│   └── supabase/
│       └── client.ts     # Supabase client
│
├── scripts/              # Utility scripts
│   └── test-db-connection.js
│
└── package.json
```

### Database Operations

#### Read Data

```typescript
// lib/db/index.ts atau api routes
import { db } from '@/lib/db/index'
import { users, products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Get all users
const allUsers = await db.select().from(users)

// Get user by ID
const user = await db.select().from(users).where(eq(users.id, userId))

// Get products in category
const categoryProducts = await db.select()
  .from(products)
  .where(eq(products.categoryId, categoryId))
```

#### Create Data

```typescript
import { db } from '@/lib/db/index'
import { products } from '@/lib/db/schema'

const newProduct = await db.insert(products).values({
  id: 'prod-1',
  name: 'Espresso',
  categoryId: 'cat-1',
  basePrice: 25000,
  type: 'SINGLE'
}).returning()
```

#### Update Data

```typescript
import { db } from '@/lib/db/index'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const updated = await db.update(products)
  .set({ basePrice: 30000 })
  .where(eq(products.id, productId))
  .returning()
```

#### Delete Data

```typescript
import { db } from '@/lib/db/index'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

await db.delete(products)
  .where(eq(products.id, productId))
```

### Creating API Routes

```typescript
// app/api/products/route.ts
import { db } from '@/lib/db/index'
import { products } from '@/lib/db/schema'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/products
export async function GET(req: NextRequest) {
  try {
    const allProducts = await db.select().from(products)
    return NextResponse.json(allProducts)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/products
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    const newProduct = await db.insert(products).values({
      id: crypto.randomUUID(),
      name: body.name,
      categoryId: body.categoryId,
      basePrice: body.basePrice,
      type: 'SINGLE'
    }).returning()
    
    return NextResponse.json(newProduct)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate migrations
npm run db:push         # Push migrations to Supabase
npm run db:test         # Test database connection

# Code Quality
npm run lint            # Run ESLint
npm run test            # Run tests with Vitest

# Cleanup
npm run clean           # Clean build artifacts
```

---

## Troubleshooting

### Issue: `DATABASE_URL is not set`

```bash
# Solution: Create/update .env.local
echo "DATABASE_URL=postgresql://..." >> .env.local

# Then test
npm run db:test
```

### Issue: Tables tidak ditemukan

```bash
# Generate dan push migrations
npm run db:generate
npm run db:push

# Verify
npm run db:test
```

### Issue: Port 3000 sudah terpakai

```bash
# Gunakan port lain
npm run dev -- -p 3001

# Atau kill process yang menggunakan port 3000
lsof -i :3000
kill -9 <PID>
```

### Issue: HMR (Hot Module Reload) tidak berfungsi

```bash
# Restart dev server
# Ctrl + C
npm run dev
```

---

## Best Practices

### 1. Database Queries

✅ **DO:**
```typescript
// Use parameterized queries (automatic dengan Drizzle)
const user = await db.select().from(users).where(eq(users.id, userId))
```

❌ **DON'T:**
```typescript
// Don't use string concatenation (SQL injection risk)
const user = await db.query(`SELECT * FROM users WHERE id = '${userId}'`)
```

### 2. Error Handling

✅ **DO:**
```typescript
export async function GET() {
  try {
    const data = await db.select().from(users)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
```

### 3. Environment Variables

✅ **DO:**
```typescript
// Server-side only
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Client-side safe
const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
```

❌ **DON'T:**
```typescript
// Don't use server secrets in client code
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY // Will be undefined in client!
```

### 4. Commit Message

```bash
# Meaningful commits
git commit -m "feat: add product variant selection"
git commit -m "fix: database connection timeout"
git commit -m "docs: update setup instructions"

# Not like this
git commit -m "update"
git commit -m "fix bug"
```

---

## Debugging

### Check Database Logs

Di Supabase Dashboard:
```
Settings → Logs → Query Performance
```

### Use Console Logs

```typescript
console.log('[DEBUG] Fetching product:', productId)
const product = await db.select().from(products).where(eq(products.id, productId))
console.log('[DEBUG] Product found:', product)
```

### Test Database Connection

```bash
npm run db:test
```

### Check Network Requests

Browser DevTools:
```
F12 → Network tab → Filter by XHR/Fetch → Check Request/Response
```

---

## Performance Tips

1. **Use indexes** - Already configured in schema
2. **Limit queries** - Add `.limit()` untuk besar dataset
3. **Use connection pooling** - Already using Session pool
4. **Caching** - Consider Next.js cache strategies

---

## Next Steps

1. ✅ Setup local environment
2. ✅ Test database connection
3. Create your first API route
4. Build features
5. Test locally
6. Push ke Git
7. Deploy ke Vercel

---

**Happy coding! 🚀**
