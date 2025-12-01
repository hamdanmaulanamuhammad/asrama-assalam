import { createClient } from '@/lib/supabase/client';

async function testSupabaseConnection() {
  const supabase = createClient();
  
  console.log('Testing Supabase connection...');
  
  // Test 1: Check connection
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  console.log('Session:', session);
  console.log('Session Error:', sessionError);
  
  // Test 2: Try to fetch users table
  const { data: users, error: usersError } = await supabase.from('users').select('*').limit(5);
  console.log('Users:', users);
  console.log('Users Error:', usersError);
  
  // Test 3: Check auth user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('Current User:', user);
  console.log('User Error:', userError);
}

testSupabaseConnection();
