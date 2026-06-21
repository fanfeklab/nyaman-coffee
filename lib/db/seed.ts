import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL is not set in environment variables');
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
  console.log('Seeding data...');

  // Seed User (Admin)
  await db.insert(schema.users).values({
    id: 'u1',
    username: 'fanfeklab',
    fullName: 'Super Admin Fanfeklab',
    role: 'SUPER_ADMIN',
    pin: '1234',
  }).onConflictDoNothing();

  // Seed Category
  await db.insert(schema.categories).values({
    id: 'c1',
    name: 'Coffee',
    color: '#8B4513',
  }).onConflictDoNothing();

  // Seed Product
  await db.insert(schema.products).values({
    id: 'p1',
    name: 'Kopi Susu Aren',
    categoryId: 'c1',
    basePrice: 18000,
    type: 'SINGLE',
  }).onConflictDoNothing();

  console.log('Seeding completed!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
