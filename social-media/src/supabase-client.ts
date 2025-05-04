import { createClient } from "@supabase/supabase-js";

const supabaseURL = "https://iniutlnjcbuirdquzomu.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_ANON_KEY in environment variables");
}

export const supabase = createClient(supabaseURL, supabaseAnonKey);
