import { createClient } from "@supabase/supabase-js";
import env from "./env.js";

// Service-role client — bypasses RLS. Server-only.
const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabase;
