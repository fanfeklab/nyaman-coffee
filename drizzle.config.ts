import { defineConfig } from 'drizzle-kit';

const getDatabaseUrl = () => {
  // Try standard DATABASE_URL first
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // Try Vercel Postgres connection string format (NEXT_POSTGRES_URL_NON_POOLING or NEXT_POSTGRES_URL)
  if (process.env.NEXT_POSTGRES_URL_NON_POOLING) {
    return process.env.NEXT_POSTGRES_URL_NON_POOLING;
  }
  
  if (process.env.NEXT_POSTGRES_URL) {
    return process.env.NEXT_POSTGRES_URL;
  }
  
  // Fallback to local development
  return 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
};

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});
