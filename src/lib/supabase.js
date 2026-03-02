import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Guard: if credentials are still placeholders, export null
// The app will show a "Not Configured" screen instead of a DNS error
const isConfigured =
    supabaseUrl &&
    supabaseAnon &&
    !supabaseUrl.includes('TU-PROYECTO') &&
    !supabaseAnon.includes('tu-anon-key');

export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnon)
    : null;

export { isConfigured };
