import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

let spaHtml;
try {
  spaHtml = readFileSync(join(__dirname, "..", "dist", "index.html"), "utf-8");
} catch {
  spaHtml = "<!DOCTYPE html><html><head><meta charset=UTF-8/></head><body></body></html>";
}

const BOT_PATTERN =
  /bot|crawl|spider|slurp|WhatsApp|facebookexternalhit|Twitterbot|TelegramBot|Discordbot|Slackbot|LinkedInBot|Applebot|Googlebot|Bingbot|DuckDuckBot|Pinterest|Snapchat|metatag|opengraph|iframely|embedly|preview|MetaInspector|curl|wget|python-requests/i;

function slugify(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function esc(s) {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function disponibilidadSchema(disponible) {
  if (disponible === "Agotado") return "https://schema.org/OutOfStock";
  if (disponible === "Próximamente") return "https://schema.org/PreOrder";
  return "https://schema.org/InStock";
}

// Markdown → HTML mínimo para el prerender (encabezados, negritas, listas,
// enlaces, párrafos). Suficiente para que Google lea el contenido real.
function mdToHtml(md) {
  const inline = (s) =>
    s
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  return (md || "")
    .split(/\n{2,}/)
    .map((raw) => {
      const block = raw.trim();
      if (!block) return "";
      if (/^### /.test(block)) return `<h3>${inline(esc(block.slice(4)))}</h3>`;
      if (/^## /.test(block)) return `<h2>${inline(esc(block.slice(3)))}</h2>`;
      if (/^# /.test(block)) return `<h2>${inline(esc(block.slice(2)))}</h2>`;
      const lines = block.split("\n");
      if (lines.every((l) => /^[-*] /.test(l.trim()))) {
        return `<ul>${lines
          .map((l) => `<li>${inline(esc(l.trim().slice(2)))}</li>`)
          .join("")}</ul>`;
      }
      return `<p>${inline(esc(block)).replace(/\n/g, "<br>")}</p>`;
    })
    .filter(Boolean)
    .join("\n");
}

const SITE_URL = "https://perfumesdediego.com";
const DEFAULT_IMAGE =
  "https://xpxfacujdaiugphvpili.supabase.co/storage/v1/object/public/perfumsImages/foto%20portada.jpeg";
const SITE_NAME = "Perfumes de Diego";

// WhatsApp/Facebook rechazan imágenes muy pesadas (PNG de varios MB) para el
// preview. Servimos una versión JPEG redimensionada por wsrv.nl (~1200px),
// ligera y aceptada por todos los bots.
function ogImage(url) {
  if (!url || typeof url !== "string" || !/^https?:\/\//.test(url)) return url;
  const sinProtocolo = url.replace(/^https?:\/\//, "");
  return `https://wsrv.nl/?url=${encodeURIComponent(
    sinProtocolo,
  )}&w=1200&output=jpg&q=80`;
}

function buildOgHtml({ title, description, image, url, bodyHtml = "", jsonLd = [] }) {
  const img = ogImage(image);
  const ldScripts = jsonLd
    .map(
      (obj) =>
        `  <script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`,
    )
    .join("\n");
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${esc(url)}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${esc(img)}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:url" content="${esc(url)}" />
  <meta property="og:site_name" content="${esc(SITE_NAME)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${esc(img)}" />
${ldScripts}
</head>
<body>${bodyHtml}</body>
</html>`;
}

export default async function handler(req, res) {
  const ua = req.headers["user-agent"] || "";
  const isBot = BOT_PATTERN.test(ua);

  if (!isBot) {
    // Visitante humano: traer SIEMPRE el shell actual del sitio estático por
    // HTTP, sin depender de que el archivo del bundle se haya leído bien
    // (esa dependencia causaba pantallas en blanco intermitentes).
    let html = "";
    try {
      const r = await fetch(`${SITE_URL}/index.html`);
      if (r.ok) html = await r.text();
    } catch (e) {
      console.error("No se pudo obtener el shell del SPA:", e);
    }
    if (!html || html.length < 200) html = spaHtml; // último recurso
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(html);
    return;
  }

  const { type, id, slug } = req.query;

  let title = SITE_NAME;
  let description = "Decants y botellas de perfumes de nicho en Mexico.";
  let image = DEFAULT_IMAGE;
  let url = SITE_URL;
  let bodyHtml = `<h1>${esc(SITE_NAME)}</h1><p>${esc(description)}</p>`;
  let jsonLd = [];

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY,
    );

    if (type === "product" && id) {
      const { data: perfume } = await supabase
        .from("parfums")
        .select("id, nombre, casa, image, notas, concentracion, precio, disponible")
        .eq("id", id)
        .single();

      if (perfume) {
        const h1 = `${perfume.nombre}${perfume.casa ? ` de ${perfume.casa}` : ""}`;
        title = `${h1} | ${SITE_NAME}`;
        description =
          `Compra ${h1}${perfume.concentracion ? ` (${perfume.concentracion})` : ""} en ${SITE_NAME}. ` +
          `${perfume.notas ? `Notas: ${perfume.notas}. ` : ""}` +
          `Disponible como decant para probar o botella completa, con envíos a todo México. Perfume de nicho original.`;
        image = perfume.image || DEFAULT_IMAGE;
        url = `${SITE_URL}/product/${slugify(perfume.nombre)}/${id}`;
        bodyHtml =
          `<h1>${esc(h1)}</h1>` +
          (perfume.concentracion
            ? `<p>Concentración: ${esc(perfume.concentracion)}</p>`
            : "") +
          (perfume.notas
            ? `<p>Notas olfativas: ${esc(perfume.notas)}</p>`
            : "") +
          `<p>Disponible en decant para probar o en botella completa. Envíos a todo México.</p>` +
          `<p><a href="${esc(url)}">Ver ${esc(perfume.nombre)} en ${esc(SITE_NAME)}</a></p>`;

        // Migas de pan: Inicio › Casa › Producto
        const migas = [
          { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
        ];
        if (perfume.casa) {
          migas.push({
            "@type": "ListItem",
            position: 2,
            name: perfume.casa,
            item: `${SITE_URL}/casa/${slugify(perfume.casa)}`,
          });
        }
        migas.push({
          "@type": "ListItem",
          position: migas.length + 1,
          name: perfume.nombre,
          item: url,
        });
        jsonLd.push({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: migas,
        });

        // Producto + oferta (solo con precio válido, para no emitir schema vacío)
        const precioNum = Number(perfume.precio);
        if (precioNum > 0) {
          jsonLd.unshift({
            "@context": "https://schema.org",
            "@type": "Product",
            name: h1,
            description,
            image: [image],
            sku: String(perfume.id ?? id),
            brand: { "@type": "Brand", name: perfume.casa || SITE_NAME },
            offers: {
              "@type": "Offer",
              price: String(precioNum),
              priceCurrency: "MXN",
              availability: disponibilidadSchema(perfume.disponible),
              itemCondition: "https://schema.org/NewCondition",
              url,
              shippingDetails: {
                "@type": "OfferShippingDetails",
                shippingDestination: {
                  "@type": "DefinedRegion",
                  addressCountry: "MX",
                },
                deliveryTime: {
                  "@type": "ShippingDeliveryTime",
                  handlingTime: {
                    "@type": "QuantitativeValue",
                    minValue: 0,
                    maxValue: 2,
                    unitCode: "DAY",
                  },
                  transitTime: {
                    "@type": "QuantitativeValue",
                    minValue: 1,
                    maxValue: 3,
                    unitCode: "DAY",
                  },
                },
              },
              hasMerchantReturnPolicy: {
                "@type": "MerchantReturnPolicy",
                applicableCountry: "MX",
                returnPolicyCategory:
                  "https://schema.org/MerchantReturnNotPermitted",
              },
            },
          });
        }
      }
    } else if (type === "casa" && slug) {
      const { data: casas } = await supabase
        .from("casas")
        .select("nombre, imagen_hero, descripcion");

      const casa = (casas || []).find((c) => slugify(c.nombre) === slug);

      if (casa) {
        title = `${casa.nombre} | ${SITE_NAME}`;
        description =
          casa.descripcion ||
          `Coleccion de perfumes de ${casa.nombre}. Decants y botellas disponibles.`;
        image = casa.imagen_hero || DEFAULT_IMAGE;
        url = `${SITE_URL}/casa/${slug}`;
        bodyHtml =
          `<h1>${esc(casa.nombre)}</h1>` +
          (casa.descripcion ? `<p>${esc(casa.descripcion)}</p>` : "") +
          `<p>Explora los decants y botellas de ${esc(casa.nombre)} disponibles en ${esc(SITE_NAME)}.</p>` +
          `<p><a href="${esc(url)}">Ver perfumes de ${esc(casa.nombre)}</a></p>`;

        jsonLd.push({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
            {
              "@type": "ListItem",
              position: 2,
              name: "Casas",
              item: `${SITE_URL}/casas`,
            },
            { "@type": "ListItem", position: 3, name: casa.nombre, item: url },
          ],
        });
      }
    } else if (type === "post" && slug) {
      const { data: post } = await supabase
        .from("posts")
        .select(
          "slug, titulo, extracto, contenido, imagen, creado_en, actualizado_en",
        )
        .eq("slug", slug)
        .eq("publicado", true)
        .maybeSingle();

      if (post) {
        title = `${post.titulo} | ${SITE_NAME}`;
        description =
          post.extracto ||
          `${post.titulo}. Reseña de perfume de nicho en ${SITE_NAME}.`;
        image = post.imagen || DEFAULT_IMAGE;
        url = `${SITE_URL}/blog/${post.slug}`;
        bodyHtml =
          `<h1>${esc(post.titulo)}</h1>` + mdToHtml(post.contenido);

        jsonLd.push({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.titulo,
          description: post.extracto || undefined,
          image: post.imagen ? [post.imagen] : undefined,
          datePublished: post.creado_en,
          dateModified: post.actualizado_en || post.creado_en,
          author: { "@type": "Person", name: "Diego" },
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            logo: {
              "@type": "ImageObject",
              url: "https://xpxfacujdaiugphvpili.supabase.co/storage/v1/object/public/perfumsImages/perfumes-de-diego-letras-horizontal.png",
            },
          },
          mainEntityOfPage: url,
        });
        jsonLd.push({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
            {
              "@type": "ListItem",
              position: 2,
              name: "Blog",
              item: `${SITE_URL}/blog`,
            },
            { "@type": "ListItem", position: 3, name: post.titulo, item: url },
          ],
        });
      }
    }
  } catch (err) {
    console.error("OG error:", err);
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  res
    .status(200)
    .send(buildOgHtml({ title, description, image, url, bodyHtml, jsonLd }));
}
