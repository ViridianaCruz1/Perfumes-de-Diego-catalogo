import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Faltan variables de entorno de Supabase. Revisa el archivo .env",
  );
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Mantener la sesión: se guarda en el navegador y se renueva sola
    // mientras el token de refresco siga siendo válido (config del panel).
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
export default supabase;