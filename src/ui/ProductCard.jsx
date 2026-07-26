import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTiktok } from "react-icons/fa";
import { Package } from "lucide-react";
import { slugify } from "../functions/slugify";
import { getBadgeEstatus } from "../functions/getBadgeEstatus";
import { formatPrecio } from "../functions/formatPrecio";
import { imagenThumb } from "../functions/imagenThumb";

function ProductCard({ parfum }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [usarOriginal, setUsarOriginal] = useState(false);

  // Un solo badge, misma lógica que ProductDetail (fuente única).
  const badge = getBadgeEstatus(parfum);

  const handleCardClick = () => {
    navigate(`/product/${slugify(parfum.nombre)}/${parfum.id}`);
  };

  return (
    <div
      key={parfum.id}
      onClick={handleCardClick}
      className={`cursor-pointer bg-white relative shadow-md rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300
        ${parfum.disponible === "Agotado" ? "shadow-red-600" : ""}
      ${parfum.disponible === "Próximamente" ? "shadow-sky-600" : ""}`}
    >
      {/* Badge de estatus (esquina superior derecha) — un solo badge */}
      {badge && (
        <span
          className={`absolute top-2 right-2 z-10 text-white text-xs sm:text-sm font-semibold px-3 py-1 rounded-md ${badge.color}`}
        >
          {badge.texto}
        </span>
      )}

      {parfum.image && !imgError ? (
        <img
          src={usarOriginal ? parfum.image : imagenThumb(parfum.image, 640)}
          alt={parfum.nombre}
          loading="lazy"
          onError={() =>
            usarOriginal ? setImgError(true) : setUsarOriginal(true)
          }
          className="w-full h-100 object-cover pt-2"
        />
      ) : (
        <div className="w-full h-100 bg-gray-100 flex items-center justify-center">
          <Package className="text-gray-300" size={48} />
        </div>
      )}
      <div className="sm:p-5 px-2 py-5 flex flex-col justify-between">
        <h3 className="sm:text-lg text-sm font-semibold text-gray-900 mb-2 2xl:flex-row">
          {parfum.nombre}
        </h3>
        <div className="text-gray-500 text-xs mb-4">
          {parfum.casa}
          <p className="italic">{parfum.concentracion}</p>
        </div>
        <div className="border-t border-gray-200 pt-4 flex flex-col justify-between">
          <span className="text-gray-800 text-sm font-semibold">
            Precio: ${formatPrecio(parfum.precio)}
            {!parfum.stock && "/ml"}
          </span>
          <span className="hidden sm:block text-xs text-gray-600">
            {parfum.notas}
          </span>

          {parfum.tiktokLink && (
            <a
              href={parfum.tiktokLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-2 inline-flex items-center justify-center gap-1 text-[10px] sm:text-xs text-[#A47E3B] hover:text-[#D4AF7A] font-semibold border border-[#A47E3B] rounded-md py-1 px-2 w-fit"
            >
              <FaTiktok className="h-3 w-3" />
              Ver video
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
