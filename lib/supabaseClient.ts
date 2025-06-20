// lib/supabaseClient.ts - Renamed for clarity
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase URL or Anon Key. Check environment variables."
  );
  // Optionally throw an error in a real app
}

// Standard client for frontend usage (uses anon key, respects RLS)
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

// Export type for convenience
export type { SupabaseClient } from "@supabase/supabase-js";
