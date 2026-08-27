import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useCart } from "../context/CartContext";

function MainMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { isCartOpen } = useCart();

  // Si se abre el carrito mientras el menú hamburguesa está abierto, cerrarlo
  useEffect(() => {
    if (isCartOpen && isOpen) {
      setIsOpen(false);
    }
  }, [isCartOpen]);

  const categorias = [
    {
      nombre: "Decants",
      accion: () => navigate("/home", { state: { mode: "decants" } }),
    },
    {
      nombre: "Botellas",
      accion: () => navigate("/home", { state: { mode: "stock" } }),
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

  const handleClick = (accion) => {
    accion();
    setIsOpen(false);
  };

  return (
    <nav className="sm:hidden bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* MÓVIL - botón hamburguesa */}
        <div className="sm:hidden flex justify-between items-center py-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 text-gray-700 font-medium text-sm"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
            <span>{isOpen ? "Cerrar" : "Menú"}</span>
          </button>
        </div>

        {/* MÓVIL - panel desplegable */}
        {isOpen && (
          <div className="sm:hidden border-t border-gray-100 py-2">
            {categorias.map((cat, index) => (
              <button
                key={index}
                onClick={() => handleClick(cat.accion)}
                className="block w-full text-left px-2 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#A47E3B] font-medium text-sm transition-colors"
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

export default MainMenu;
