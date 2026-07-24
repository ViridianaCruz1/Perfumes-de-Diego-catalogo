import supabase from "../services/supabase";

// Solo las columnas que usa el grid del catálogo (card + filtros + buscador +
// orden + badges). Evita bajar columnas pesadas que no se muestran.
// El detalle de producto (getParfumById) sí trae todo con "*".
const COLS_GRID =
  "id, nombre, casa, precio, image, disponible, disponible_desde, categoria, stock, concentracion, notas, tiktokLink, esBestSeller";

// ============================================================
//  MODO BAZAR — recargo global sobre los precios
//  El recargo se aplica AQUÍ, en la única capa donde se leen los precios de
//  la base, para que tarjetas, PDP, carrito y WhatsApp queden todos iguales.
//  Ensar Oud queda EXCLUIDO (no va al bazar).
// ============================================================
let _configCache = null;
let _configCacheAt = 0;
const CONFIG_TTL_MS = 30000; // relee la config cada 30 s como máximo

export async function getConfigBazar() {
  const ahora = Date.now();
  if (_configCache && ahora - _configCacheAt < CONFIG_TTL_MS) {
    return _configCache;
  }
  try {
    const { data } = await supabase
      .from("config_bazar")
      .select("activo, recargo")
      .eq("id", 1)
      .single();
    _configCache = data || { activo: false, recargo: 0 };
  } catch {
    _configCache = { activo: false, recargo: 0 };
  }
  _configCacheAt = ahora;
  return _configCache;
}

function redondearArriba10(n) {
  return Math.ceil(n / 10) * 10;
}

function aplicarRecargoUno(parfum, config) {
  if (!parfum) return parfum;
  if (!config?.activo || !config.recargo) return parfum;
  if (parfum.casa === "Ensar Oud") return parfum; // no va al bazar

  const factor = 1 + Number(config.recargo) / 100;
  const nuevo = { ...parfum };
  if (nuevo.precio != null) {
    nuevo.precio = redondearArriba10(Number(nuevo.precio) * factor);
  }
  if (nuevo.precio30ml != null) {
    nuevo.precio30ml = redondearArriba10(Number(nuevo.precio30ml) * factor);
  }
  return nuevo;
}

// Aplica el recargo a un perfume o a una lista, según la config actual.
async function conRecargo(parfums) {
  const config = await getConfigBazar();
  if (!config.activo) return parfums;
  if (Array.isArray(parfums)) {
    return parfums.map((p) => aplicarRecargoUno(p, config));
  }
  return aplicarRecargoUno(parfums, config);
}


export default async function getParfums() {
  const { data, error } = await supabase.from("parfums").select(COLS_GRID);
  if (error) {
    console.error("Error fetching parfums:", error);
    throw new Error("Could not fetch parfums");
  }
  return conRecargo(data);
}

export async function getParfumById(id) {
  const { data, error } = await supabase
    .from("parfums")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching parfum:", error);
    throw new Error("Could not fetch parfum");
  }
  return conRecargo(data);
}
export async function getBestSellers() {
  const { data, error } = await supabase
    .from("parfums")
    .select(COLS_GRID)
    .eq("esBestSeller", true);

  if (error) {
    console.error("Error fetching best sellers:", error);
    throw new Error("Could not fetch best sellers");
  }
  return conRecargo(data);
}
export async function getRelacionados(casa, excluirId) {
  const { data, error } = await supabase
    .from("parfums")
    .select(COLS_GRID)
    .eq("casa", casa)
    .neq("id", excluirId)
    .eq("disponible", "Disponible");

  if (error) {
    console.error("Error fetching relacionados:", error);
    return [];
  }

  if (!data || data.length === 0) return [];

  // Shuffle (Fisher-Yates) y limita a 4
  const shuffled = [...data];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return conRecargo(shuffled.slice(0, 4));
}
export async function getPerfumesConTikTok() {
  const { data, error } = await supabase
    .from("parfums")
    .select(COLS_GRID)
    .not("tiktokLink", "is", null)
    .neq("tiktokLink", "");

  if (error) {
    console.error("Error fetching perfumes con TikTok:", error);
    return [];
  }
  return conRecargo(data);
}
