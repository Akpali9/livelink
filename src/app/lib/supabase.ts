import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase env vars. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// ─── Shared Types ─────────────────────────────────────────────────────────────
// Helper function to check if we're connected
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase
      .from('creators')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('Supabase connection error:', error)
      return false
    }
    
    console.log('✅ Supabase connected successfully')
    return true
  } catch (err) {
    console.error('Failed to connect to Supabase:', err)
    return false
  };
export type Tables = {
  creator_profiles: {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    platform: string;
    status: string;
    total_earned?: number;
    pending?: number;
    paid_out?: number;
    [key: string]: any;
  };
  business_profiles: {
    id: string;
    user_id: string;
    full_name: string;
    business_name: string;
    email: string;
    status: string;
    [key: string]: any;
  };
};
