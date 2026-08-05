import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import supabase from "../services/supabase";
import { formatPrecio } from "../functions/formatPrecio";

function fechaCorta(iso) {
  try {
    return new Date(iso).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function AdminVentasBazar() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const cargar = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("pedidos_bazar")
      .select("*")
      .order("creado_en", { ascending: false });
    if (error) {
      setError("No se pudieron cargar los pedidos. Revisa permisos (RLS).");
    } else {
      setPedidos(data || []);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargar();
  }, []);

  // Filtro por rango de fechas (inclusive).
  const filtrados = useMemo(() => {
    return pedidos.filter((p) => {
      const t = new Date(p.creado_en).getTime();
      if (desde) {
        const d = new Date(desde + "T00:00:00").getTime();
        if (t < d) return false;
      }
      if (hasta) {
        const h = new Date(hasta + "T23:59:59").getTime();
        if (t > h) return false;
      }
      return true;
    });
  }, [pedidos, desde, hasta]);

  const totalVendido = useMemo(
    () => filtrados.reduce((s, p) => s + Number(p.total || 0), 0),
    [filtrados],
  );
  const ticketPromedio = filtrados.length
    ? totalVendido / filtrados.length
    : 0;

  // Productos más vendidos (por ingreso), agregando las líneas de todos los pedidos.
  const topProductos = useMemo(() => {
    const acc = {};
    for (const p of filtrados) {
      for (const l of p.items || []) {
        const key = l.nombre || "—";
        if (!acc[key]) acc[key] = { nombre: key, casa: l.casa, ingreso: 0, veces: 0 };
        acc[key].ingreso += Number(l.subtotal || 0);
        acc[key].veces += 1;
      }
    }
    return Object.values(acc)
      .sort((a, b) => b.ingreso - a.ingreso)
      .slice(0, 10);
  }, [filtrados]);

  const borrar = async (id) => {
    if (!window.confirm("¿Borrar este pedido? No se puede deshacer.")) return;
    const { error } = await supabase
      .from("pedidos_bazar")
      .delete()
      .eq("id", id);
    if (error) {
      alert("No se pudo borrar. Revisa permisos (RLS).");
    } else {
      setPedidos((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2 hover:text-gray-300">
            <ArrowLeft size={20} /> Volver al panel
          </Link>
          <h1 className="text-lg font-bold">Ventas del bazar</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Filtro de fechas */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-end gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          {(desde || hasta) && (
            <button
              onClick={() => {
                setDesde("");
                setHasta("");
              }}
              className="text-sm text-gray-500 hover:text-gray-800 underline"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-5">
            <p className="text-xs text-gray-500 uppercase">Total vendido</p>
            <p className="text-2xl font-bold text-gray-900">
              ${formatPrecio(totalVendido)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-5">
            <p className="text-xs text-gray-500 uppercase">Pedidos</p>
            <p className="text-2xl font-bold text-gray-900">{filtrados.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-5">
            <p className="text-xs text-gray-500 uppercase">Ticket promedio</p>
            <p className="text-2xl font-bold text-gray-900">
              ${formatPrecio(ticketPromedio)}
            </p>
          </div>
        </div>

        {cargando ? (
          <p className="text-gray-500 text-sm">Cargando…</p>
        ) : error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Lista de pedidos */}
            <div className="lg:col-span-2">
              <h2 className="font-bold text-gray-900 mb-3">
                Pedidos ({filtrados.length})
              </h2>
              {filtrados.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  No hay pedidos en este rango.
                </p>
              ) : (
                <div className="space-y-3">
                  {filtrados.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-lg shadow p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-gray-500">
                            {fechaCorta(p.creado_en)}
                            {p.bazar_activo ? ` · bazar +${p.recargo}%` : ""}
                          </p>
                          <ul className="mt-1 text-sm text-gray-700">
                            {(p.items || []).map((l, i) => (
                              <li key={i}>
                                {l.nombre}{" "}
                                <span className="text-gray-400">
                                  ({l.casa} · {l.detalle})
                                </span>{" "}
                                — ${formatPrecio(l.subtotal)}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="text-lg font-bold text-gray-900">
                            ${formatPrecio(p.total)}
                          </span>
                          <button
                            onClick={() => borrar(p.id)}
                            className="text-gray-400 hover:text-red-600"
                            title="Borrar pedido"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Productos más vendidos */}
            <div className="lg:col-span-1">
              <h2 className="font-bold text-gray-900 mb-3">Más vendidos</h2>
              {topProductos.length === 0 ? (
                <p className="text-gray-400 text-sm">Sin datos.</p>
              ) : (
                <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
                  {topProductos.map((t, i) => (
                    <div
                      key={t.nombre}
                      className="p-3 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {i + 1}. {t.nombre}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t.casa} · {t.veces}{" "}
                          {t.veces === 1 ? "venta" : "ventas"}
                        </p>
                      </div>
                      <span className="text-sm font-semibold whitespace-nowrap">
                        ${formatPrecio(t.ingreso)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
