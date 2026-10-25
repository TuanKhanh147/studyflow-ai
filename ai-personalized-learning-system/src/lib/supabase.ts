import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Optional for the first local demo. Production database features require Supabase credentials.
export const supabase = url && key ? createClient(url, key) : null;
