const SUPABASE_URL = "https://eaivlukvbuwlvvbmvwit.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Ik0zdu-MpFCp-DsFJiUWhg_MMigLcjj";

const { createClient } = supabase;

const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

window.supabase = supabaseClient;
