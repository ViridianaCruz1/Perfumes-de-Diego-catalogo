import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Package,
  Plus,
  MessageSquareQuote,
  MessagesSquare,
  Building2,
  Bell,
  Ticket,
  Newspaper,
  PenLine,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getCountAvisosNuevos } from "../functions/getAvisosStock";
import ModoBazarControl from "../ui/ModoBazarControl";

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [conteoNuevos, setConteoNuevos] = useState(0);

  useEffect(() => {
    getCountAvisosNuevos().then(setConteoNuevos);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#2C2C2C] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Panel de Admin</h1>
            <p className="text-xs text-gray-400">
              Conectado como: {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-[#A47E3B] hover:bg-[#D4AF7A] px-4 py-2 rounded-md text-sm font-semibold transition-colors"
          >
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bienvenido Diego
          </h2>
          <p className="text-gray-600">
            Desde aquí podrás administrar tu catálogo de perfumes.
          </p>
          <a
            href="/admin/pedido-rapido"
            className="inline-block mt-4 bg-[#A47E3B] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#8b6d32]"
          >
            🧾 Pedido rápido (bazar)
          </a>
          <a
            href="/admin/ventas-bazar"
            className="inline-block mt-4 ml-3 border border-[#A47E3B] text-[#A47E3B] px-5 py-2.5 rounded-lg font-semibold hover:bg-[#faf6ef]"
          >
            📊 Ventas del bazar
          </a>
          <a
            href="/admin/ajuste-precios"
            className="inline-block mt-4 ml-3 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-50"
          >
            🏷️ Ajustar precios por casa
          </a>
        </div>

        {/* Sección Avisos de stock */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Avisos de stock
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/admin/avisos")}
              className="relative bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md hover:border-[#A47E3B] transition-all text-left"
            >
              {conteoNuevos > 0 && (
                <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold rounded-full min-w-[24px] h-6 flex items-center justify-center px-2 shadow-md">
                  {conteoNuevos}
                </span>
              )}
              <Bell
                className={conteoNuevos > 0 ? "text-red-600 mb-3" : "text-[#A47E3B] mb-3"}
                size={28}
              />
              <h3 className="font-semibold text-gray-900 mb-1">
                Avisos pendientes
                {conteoNuevos > 0 && (
                  <span className="ml-2 text-red-600 text-xs font-bold uppercase">
                    · {conteoNuevos === 1 ? "1 nuevo" : `${conteoNuevos} nuevos`}
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-600">
                Clientes que pidieron aviso cuando llegue un perfume Próximamente
              </p>
            </button>
          </div>
        </div>

        {/* Sección Perfumes */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Perfumes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/admin/perfumes")}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md hover:border-[#A47E3B] transition-all text-left"
            >
              <Package className="text-[#A47E3B] mb-3" size={28} />
              <h3 className="font-semibold text-gray-900 mb-1">
                Ver y editar perfumes
              </h3>
              <p className="text-sm text-gray-600">
                Lista completa del catálogo con buscador
              </p>
            </button>

            <button
              onClick={() => navigate("/admin/perfumes/nuevo")}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md hover:border-[#A47E3B] transition-all text-left"
            >
              <Plus className="text-[#A47E3B] mb-3" size={28} />
              <h3 className="font-semibold text-gray-900 mb-1">
                Agregar perfume
              </h3>
              <p className="text-sm text-gray-600">
                Crear un perfume nuevo en el catálogo
              </p>
            </button>
          </div>
        </div>

        {/* Sección Testimonios */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Testimonios
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/admin/testimonios")}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md hover:border-[#A47E3B] transition-all text-left"
            >
              <MessagesSquare className="text-[#A47E3B] mb-3" size={28} />
              <h3 className="font-semibold text-gray-900 mb-1">
                Ver y editar testimonios
              </h3>
              <p className="text-sm text-gray-600">
                Lista de testimonios reales de clientes
              </p>
            </button>

            <button
              onClick={() => navigate("/admin/testimonios/nuevo")}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md hover:border-[#A47E3B] transition-all text-left"
            >
              <MessageSquareQuote className="text-[#A47E3B] mb-3" size={28} />
              <h3 className="font-semibold text-gray-900 mb-1">
                Agregar testimonio
              </h3>
              <p className="text-sm text-gray-600">
                Crear un testimonio nuevo
              </p>
            </button>
          </div>
        </div>

        {/* Sección Casas */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Casas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/admin/casas")}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md hover:border-[#A47E3B] transition-all text-left"
            >
              <Building2 className="text-[#A47E3B] mb-3" size={28} />
              <h3 className="font-semibold text-gray-900 mb-1">
                Editar casas
              </h3>
              <p className="text-sm text-gray-600">
                Subir imagen y descripción de cada casa
              </p>
            </button>
          </div>
        </div>

        {/* Sección Cupones */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Cupones
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/admin/cupones")}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md hover:border-[#A47E3B] transition-all text-left"
            >
              <Ticket className="text-[#A47E3B] mb-3" size={28} />
              <h3 className="font-semibold text-gray-900 mb-1">
                Cupones de descuento
              </h3>
              <p className="text-sm text-gray-600">
                Crear, activar y desactivar códigos de descuento
              </p>
            </button>
          </div>
        </div>

        {/* Sección Blog */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Blog
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/admin/blog")}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md hover:border-[#A47E3B] transition-all text-left"
            >
              <Newspaper className="text-[#A47E3B] mb-3" size={28} />
              <h3 className="font-semibold text-gray-900 mb-1">
                Ver y editar posts
              </h3>
              <p className="text-sm text-gray-600">
                Lista de reseñas y artículos del blog
              </p>
            </button>

            <button
              onClick={() => navigate("/admin/blog/nuevo")}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md hover:border-[#A47E3B] transition-all text-left"
            >
              <PenLine className="text-[#A47E3B] mb-3" size={28} />
              <h3 className="font-semibold text-gray-900 mb-1">
                Escribir post
              </h3>
              <p className="text-sm text-gray-600">
                Crear una reseña o artículo nuevo
              </p>
            </button>
          </div>
        </div>

        {/* Modo Bazar — hasta el fondo del panel */}
        <div className="mt-8">
          <ModoBazarControl />
        </div>

      </main>
    </div>
  );
}