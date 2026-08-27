import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import LoadingSpinner from "../ui/LoadingSpinner";
import { getPostsPublicados } from "../functions/getPosts";

function formatearFecha(fecha) {
  try {
    return new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const data = await getPostsPublicados();
        if (activo) setPosts(data || []);
      } catch {
        if (activo) setError(true);
      } finally {
        if (activo) setLoading(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Blog — Perfumes de Diego</title>
        <meta
          name="description"
          content="Reseñas honestas de perfumes de nicho y exclusivos: notas, proyección, ocasiones y si valen lo que cuestan. Por Perfumes de Diego."
        />
        <link rel="canonical" href="https://perfumesdediego.com/blog" />
      </Helmet>

      <main className="max-w-5xl mx-auto px-5 py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Blog
        </h1>
        <p className="text-gray-600 mb-10">
          Reseñas honestas de perfumes de nicho, sin exageraciones.
        </p>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <p className="text-center text-gray-500 mt-8">
            No pudimos cargar el blog en este momento. Intenta de nuevo más
            tarde.
          </p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500 mt-8">
            Aún no hay publicaciones. ¡Vuelve pronto!
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group block rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                {post.imagen ? (
                  <img
                    src={post.imagen}
                    alt={post.titulo}
                    loading="lazy"
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200" />
                )}
                <div className="p-5">
                  <p className="text-xs text-gray-400 mb-2">
                    {formatearFecha(post.creado_en)}
                  </p>
                  <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#A47E3B] transition-colors">
                    {post.titulo}
                  </h2>
                  {post.extracto && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                      {post.extracto}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}