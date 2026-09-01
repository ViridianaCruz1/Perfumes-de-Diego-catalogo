/**
 * api/sitemap.js  —  Sitemap DINÁMICO (Vercel Serverless Function)
 * --------------------------------------------------------------------------
 * Arma el sitemap en vivo desde Supabase cada vez que un buscador lo pide.
 * No hay archivo estático que regenerar ni script que correr: cuando agregas
 * un producto en el admin, aparece en el sitemap de inmediato.
 *
 * Se sirve en:  https://TU-DOMINIO/api/sitemap
 * (robots.txt apunta a esa URL; Google la acepta sin importar la extensión.)
 *
 * Configuración: ninguna obligatoria.
 *   - El dominio se toma del propio request (o de SITE_URL si la defines).
 *   - Supabase se lee de las variables que YA tienes en Vercel
 *     (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY).
 *
 * Si Supabase fallara, devuelve igual las rutas fijas (nunca rompe).
 * --------------------------------------------------------------------------
 */

import { createClient } from "@supabase/supabase-js";

// Rutas fijas e indexables (sin /admin y sin /paquetes).
const RUTAS_FIJAS = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/home", changefreq: "daily", priority: "0.9" },
  { path: "/decants", changefreq: "daily", priority: "0.9" },
  { path: "/botellas", changefreq: "daily", priority: "0.9" },
  { path: "/best-sellers", changefreq: "weekly", priority: "0.9" },
  { path: "/recien-llegados", changefreq: "weekly", priority: "0.8" },
  { path: "/casas", changefreq: "weekly", priority: "0.8" },
  { path: "/sobre-mi", changefreq: "monthly", priority: "0.6" },
  { path: "/tiktok", changefreq: "weekly", priority: "0.7" },
  { path: "/pedido-especial", changefreq: "monthly", priority: "0.7" },
  { path: "/testimonios", changefreq: "weekly", priority: "0.7" },
  { path: "/faqs", changefreq: "monthly", priority: "0.5" },
  { path: "/terminos", changefreq: "yearly", priority: "0.3" },
  { path: "/privacidad", changefreq: "yearly", priority: "0.3" },
  { path: "/blog", changefreq: "weekly", priority: "0.7" },
];

// slugify idéntico al de src/functions/slugify
function slugify(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function nodoUrl(base, { path, loc, changefreq, priority }) {
  const url = loc || `${base}${path}`;
  return (
    "  <url>\n" +
    `    <loc>${url}</loc>\n` +
    `    <changefreq>${changefreq}</changefreq>\n` +
    `    <priority>${priority}</priority>\n` +
    "  </url>"
  );
}

async function traerParfums(supabase) {
  const pageSize = 1000;
  let desde = 0;
  const todos = [];
  for (;;) {
    const { data, error } = await supabase
      .from("parfums")
      .select("id, nombre, casa")
      .order("id", { ascending: true })
      .range(desde, desde + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    todos.push(...data);
    if (data.length < pageSize) break;
    desde += pageSize;
  }
  return todos;
}

export default async function handler(req, res) {
  // Dominio: SITE_URL si está definida; si no, el host del propio request.
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const BASE_URL = (process.env.SITE_URL || `https://${host}`)
    .trim()
    .replace(/\/+$/, "");

  const urls = RUTAS_FIJAS.map((r) => ({ ...r })); // siempre van las fijas

  try {
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_KEY =
      process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (SUPABASE_URL && SUPABASE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const parfums = await traerParfums(supabase);

      // Productos
      for (const p of parfums) {
        const slug = slugify(p.nombre);
        if (!slug || p.id == null) continue;
        urls.push({
          loc: `${BASE_URL}/product/${slug}/${p.id}`,
          changefreq: "weekly",
          priority: "0.8",
        });
      }

      // Casas (valores únicos reales de parfums.casa)
      const slugsCasa = new Set();
      for (const p of parfums) {
        const slug = slugify(p.casa);
        if (slug) slugsCasa.add(slug);
      }
      for (const slug of [...slugsCasa].sort()) {
        urls.push({
          loc: `${BASE_URL}/casa/${slug}`,
          changefreq: "weekly",
          priority: "0.7",
        });
      }

      // Posts del blog (publicados)
      const { data: posts } = await supabase
        .from("posts")
        .select("slug")
        .eq("publicado", true);
      for (const post of posts || []) {
        if (!post.slug) continue;
        urls.push({
          loc: `${BASE_URL}/blog/${post.slug}`,
          changefreq: "monthly",
          priority: "0.6",
        });
      }
    }
  } catch (e) {
    // Si Supabase falla, seguimos con las rutas fijas (no rompemos el sitemap).
    console.error("sitemap: error leyendo parfums:", e?.message || e);
  }

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => nodoUrl(BASE_URL, u)).join("\n") +
    "\n</urlset>\n";

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  // El CDN lo cachea 1h y sirve la versión vieja mientras revalida en 2º plano.
  res.setHeader(
    "Cache-Control",
    "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  );
  res.status(200).send(xml);
}