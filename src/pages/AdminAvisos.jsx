import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  Trash2,
  MessageCircle,
  Eye,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getAvisosStock,
  marcarAvisoNotificado,
  desmarcarAvisoNotificado,
  marcarAvisoLeido,
  deleteAvisoStock,
} from "../functions/getAvisosStock";
import LoadingSpinner from "../ui/LoadingSpinner";
import { useToast } from "../context/ToastContext";

// Helper para derivar el estado de un aviso
function getEstado(aviso) {
  if (aviso.notificado_en) return "notificado";
  if (aviso.leido_en) return "leido";
  return "nuevo";
}

export default function AdminAvisos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pendientes");
  const [abiertos, setAbiertos] = useState({}); // qué grupos están expandidos

  const toggleGrupo = (key) =>
    setAbiertos((prev) => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    fetchAvisos();
  }, []);

  const fetchAvisos = async () => {
    setLoading(true);
    const data = await getAvisosStock();
    setAvisos(data);
    setLoading(false);
  };

  const avisosFiltrados = avisos.filter((a) => {
    if (filter === "pendientes") return a.notificado_en === null;
    if (filter === "notificados") return a.notificado_en !== null;
    return true;
  });

  // Agrupa los avisos por perfume. Ordena por cantidad de personas (desc).
  const grupos = useMemo(() => {
    const map = new Map();
    for (const a of avisosFiltrados) {
      const key = a.parfum_id || `${a.parfum_nombre}||${a.parfum_casa || ""}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          nombre: a.parfum_nombre,
          casa: a.parfum_casa,
          tipo: a.tipo,
          avisos: [],
        });
      }
      map.get(key).avisos.push(a);
    }
    return Array.from(map.values()).sort(
      (x, y) =>
        y.avisos.length - x.avisos.length ||
        (x.nombre || "").localeCompare(y.nombre || "", "es"),
    );
  }, [avisosFiltrados]);

  const handleMarcarLeido = async (id) => {
    try {
      await marcarAvisoLeido(id);
      await fetchAvisos();
    } catch {
      showToast("Error al marcar como leído.", "error");
    }
  };

  const handleMarcarNotificado = async (id) => {
    try {
      await marcarAvisoNotificado(id);
      await fetchAvisos();
    } catch {
      showToast("Error al marcar como notificado.", "error");
    }
  };

  const handleDesmarcarNotificado = async (id) => {
    try {
      await desmarcarAvisoNotificado(id);
      await fetchAvisos();
    } catch {
      showToast("Error al desmarcar.", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Borrar este aviso definitivamente?")) return;
    try {
      await deleteAvisoStock(id);
      await fetchAvisos();
    } catch {
      showToast("Error al borrar.", "error");
    }
  };

  const handleOpenWhatsApp = (aviso) => {
    const numeroLimpio = aviso.whatsapp.replace(/\D/g, "");
    const numeroConPrefijo = numeroLimpio.startsWith("52")
      ? numeroLimpio
      : `52${numeroLimpio}`;
    const mensaje = `Hola! Te escribo de Perfumes de Diego. Pediste que te avisara cuando llegara ${aviso.parfum_nombre}${
      aviso.parfum_casa ? ` de ${aviso.parfum_casa}` : ""
    }. ¡Ya está disponible!`;
    const url = `https://wa.me/${numeroConPrefijo}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "";
    const d = new Date(fecha);
    return d.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Conteos por filtro
  const conteoPendientes = avisos.filter(
    (a) => a.notificado_en === null,
  ).length;
  const conteoNotificados = avisos.filter(
    (a) => a.notificado_en !== null,
  ).length;
  const conteoNuevos = avisos.filter(
    (a) => a.notificado_en === null && a.leido_en === null,
  ).length;

  // Colores y etiquetas por estado
  const estiloEstado = {
    nuevo: {
      borde: "border-red-500",
      badgeBg: "bg-red-100",
      badgeText: "text-red-800",
      label: "Nuevo",
    },
    leido: {
      borde: "border-sky-500",
      badgeBg: "bg-sky-100",
      badgeText: "text-sky-800",
      label: "Leído",
    },
    notificado: {
      borde: "border-green-500",
      badgeBg: "bg-green-100",
      badgeText: "text-green-800",
      label: "Notificado",
    },
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#2C2C2C] text-white shadow-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/admin")}
            className="p-2 hover:bg-gray-700 rounded-md transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold">Avisos de stock</h1>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Aviso de cuántos nuevos */}
        {conteoNuevos > 0 && filter !== "notificados" && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-md p-3 mb-4 flex items-center gap-3">
            <Bell className="text-red-600" size={20} />
            <div className="text-sm text-red-900">
              Tienes <strong>{conteoNuevos}</strong>{" "}
              {conteoNuevos === 1 ? "aviso nuevo sin leer" : "avisos nuevos sin leer"}.
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { value: "pendientes", label: "Pendientes", count: conteoPendientes },
            {
              value: "notificados",
              label: "Notificados",
              count: conteoNotificados,
            },
            { value: "todos", label: "Todos", count: avisos.length },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === opt.value
                  ? "bg-[#A47E3B] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              {opt.label} ({opt.count})
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : avisosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Bell className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500">No hay avisos en esta categoría.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {grupos.map((grupo) => (
              <div
                key={grupo.key}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                {/* Encabezado del grupo (perfume) — clickeable para expandir */}
                <button
                  type="button"
                  onClick={() => toggleGrupo(grupo.key)}
                  className="w-full text-left flex items-center justify-between gap-2 px-4 py-3 border-b bg-gray-50 hover:bg-gray-100"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 truncate">
                        {grupo.nombre}
                      </p>
                      {grupo.tipo && (
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                            grupo.tipo === "botella"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {grupo.tipo === "botella" ? "Botella" : "Decant"}
                        </span>
                      )}
                    </div>
                    {grupo.casa && (
                      <p className="text-sm text-gray-500">{grupo.casa}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {(() => {
                      const nuevos = grupo.avisos.filter(
                        (a) => getEstado(a) === "nuevo",
                      ).length;
                      return nuevos > 0 ? (
                        <span className="text-xs font-bold text-white bg-red-500 rounded-full px-2.5 py-1">
                          {nuevos} nuevo{nuevos > 1 ? "s" : ""}
                        </span>
                      ) : null;
                    })()}
                    <span className="text-xs font-semibold text-gray-600 bg-gray-200 rounded-full px-2.5 py-1">
                      {grupo.avisos.length}{" "}
                      {grupo.avisos.length === 1 ? "persona" : "personas"}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-gray-500 transition-transform ${
                        abiertos[grupo.key] ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Personas que esperan este perfume (solo si está abierto) */}
                {abiertos[grupo.key] && (
                <div className="divide-y divide-gray-100">
                  {grupo.avisos.map((aviso) => {
                    const estado = getEstado(aviso);
                    const estilo = estiloEstado[estado];
                    return (
                      <div
                        key={aviso.id}
                        className={`p-3 border-l-4 ${estilo.borde}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span
                                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${estilo.badgeBg} ${estilo.badgeText}`}
                              >
                                {estilo.label}
                              </span>
                              <span className="text-xs text-gray-500">
                                Solicitado: {formatFecha(aviso.created_at)}
                              </span>
                              {aviso.leido_en && !aviso.notificado_en && (
                                <span className="text-xs text-gray-500">
                                  · Leído: {formatFecha(aviso.leido_en)}
                                </span>
                              )}
                              {aviso.notificado_en && (
                                <span className="text-xs text-gray-500">
                                  · Notificado: {formatFecha(aviso.notificado_en)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700">
                              📱 WhatsApp:{" "}
                              <span className="font-mono">{aviso.whatsapp}</span>
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenWhatsApp(aviso)}
                              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md"
                            >
                              <MessageCircle size={14} />
                              WhatsApp
                            </button>

                            {estado === "nuevo" && (
                              <button
                                type="button"
                                onClick={() => handleMarcarLeido(aviso.id)}
                                className="flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md"
                              >
                                <Eye size={14} />
                                Marcar leído
                              </button>
                            )}

                            {(estado === "nuevo" || estado === "leido") && (
                              <button
                                type="button"
                                onClick={() => handleMarcarNotificado(aviso.id)}
                                className="flex items-center gap-1 bg-[#A47E3B] hover:bg-[#D4AF7A] text-white text-xs font-semibold px-3 py-1.5 rounded-md"
                              >
                                <CheckCircle size={14} />
                                Marcar notificado
                              </button>
                            )}

                            {estado === "notificado" && (
                              <button
                                type="button"
                                onClick={() => handleDesmarcarNotificado(aviso.id)}
                                className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-md"
                              >
                                Pasar a pendiente
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDelete(aviso.id)}
                              className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium px-3 py-1.5 rounded-md border border-red-200"
                            >
                              <Trash2 size={14} />
                              Borrar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}