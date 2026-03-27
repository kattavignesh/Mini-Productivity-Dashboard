import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client initialised from environment variables.
 * Create a `.env` file at the project root with:
 *   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
 *   VITE_SUPABASE_ANON_KEY=<your-anon-key>
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient = null;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are missing. ' +
      'Dashbord is running in DEMO MODE with local state.'
  );
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;
