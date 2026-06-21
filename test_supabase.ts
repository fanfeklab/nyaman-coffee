import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase Connection...');
  const { data, error } = await supabase.from('users').select('*');
  
  if (error) {
    console.error('Error fetching users:', error.message);
    process.exit(1);
  }
  
  console.log('Successfully connected to Supabase!');
  console.log('Users found:', data);
}

testConnection();
