import { ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useCart } from "../context/CartContext";

function Header({ onSearchResult }) {
  const { toggleCart, cartItems } = useCart();
  const navigate = useNavigate();

  const totalItems = cartItems.length;

  const categorias = [
    {
      nombre: "Decants",
      accion: () => navigate("/decants"),
    },
    {
      nombre: "Botellas",
      accion: () => navigate("/botellas"),
    },
    {
      nombre: "Mejor vendidos",
      accion: () => navigate("/best-sellers"),
    },
    {
      nombre: "Casas",
      accion: () => navigate("/casas"),
    },
    {
      nombre: "Recién Llegados",
      accion: () => navigate("/recien-llegados"),
    },
    {
      nombre: "Visto en TikTok",
      accion: () => navigate("/tiktok"),
    },
    {
      nombre: "¿Buscas otro perfume?",
      accion: () => navigate("/pedido-especial"),
    },
  ];

  return (
    <header className="w-full border-b border-gray-200 bg-gray-200">
      {/* Fila superior: Logo + (menú en xl) + Buscador + Carrito */}
      <div className="flex flex-row justify-between items-center px-3 sm:px-6 pt-4 pb-0 xl:py-2 gap-3">
        {/* Logo */}
        <Link to="/" className="flex sm:gap-2 items-center flex-shrink-0">
          <img
            src="https://xpxfacujdaiugphvpili.supabase.co/storage/v1/object/public/perfumsImages/perfumes-de-diego-letras-horizontal.png"
            alt="Logo"
            className="sm:h-20 sm:w-48 w-24 my-3 xl:h-14 xl:w-40 xl:my-0"
          />
        </Link>

        {/* Menú en la misma fila — solo en pantallas grandes (aprovecha el hueco) */}
        <nav className="hidden xl:flex items-center gap-6">
          {categorias.map((cat, index) => (
            <button
              key={index}
              onClick={cat.accion}
              className="text-gray-700 hover:text-[#A47E3B] font-medium text-sm tracking-wide transition-colors whitespace-nowrap"
            >
              {cat.nombre}
            </button>
          ))}
        </nav>

        {/* Search + Carrito */}
        <div className="flex items-center gap-3 sm:gap-6 text-[#F5F5F5] mt-3 sm:mt-0 flex-1 min-w-0 justify-end xl:flex-none">
          <SearchBar onSearchResult={onSearchResult} />

          <div className="relative">
            <button onClick={toggleCart}>
              <ShoppingCart className="w-7 h-7 sm:w-6 sm:h-6 hover:text-[#A47E3B] cursor-pointer text-[#2C2C2C]" />
            </button>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#A47E3B] text-white text-[10px] sm:text-xs rounded-full w-5 h-5 sm:w-4 sm:h-4 flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Menú de categorías - escritorio chico/mediano (en su propia fila) */}
      <div className="hidden sm:block xl:hidden px-6 pb-3">
        <div className="flex items-center gap-8">
          {categorias.map((cat, index) => (
            <button
              key={index}
              onClick={cat.accion}
              className="text-gray-700 hover:text-[#A47E3B] font-medium text-sm tracking-wide transition-colors"
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

export default Header;