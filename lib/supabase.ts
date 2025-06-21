import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lqbivpzpknvjxjjeogve.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxYml2cHpwa252anhqamVvZ3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDc2ODYsImV4cCI6MjA2NTU4MzY4Nn0.lN_3IBa8-PVi_bs04omZkIYU4nC68RJu92eiUoFchto";

export const supabase = createClient(supabaseUrl, supabaseKey);
