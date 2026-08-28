import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, X, Search } from "lucide-react";
import {
  getCodigosDescuento,
  createCodigo,
  updateCodigo,
  deleteCodigo,
} from "../functions/getCodigosDescuento";
import { useToast } from "../context/ToastContext";

const OPCIONES_APLICA = [
  { value: "ALL", label: "Todo el carrito" },
  { value: "DECANT", label: "Solo decants" },
  { value: "BOTELLA", label: "Solo botellas" },
  { value: "BOTELLA_SELLADA", label: "Solo botellas selladas" },
];

const FORM_VACIO = {
  codigo: "",
  tipo: "percentage",
  valor: "",
  aplica_a: "ALL",
  activo: true,
  expira: "",
  usos_maximos: "",
};

function etiquetaAplica(valor) {
  return OPCIONES_APLICA.find((o) => o.value === valor)?.label || valor;
}

function descripcionDescuento(c) {
  const monto = c.tipo === "percentage" ? `${c.valor}%` : `$${c.valor}`;
  return `${monto} · ${etiquetaAplica(c.aplica_a)}`;
}

function estaExpirado(c) {
  // Vencimiento por hora (cupones de bienvenida, 24 h)
  if (c.expira_en && new Date(c.expira_en) < new Date()) return true;
  // Vencimiento por fecha (códigos normales)
  if (!c.expira) return false;
  const fecha = new Date(c.expira + "T12:00:00");
  return fecha < new Date(new Date().toDateString());
}

// Texto de "Expira": prioriza la hora exacta si existe.
function textoExpira(c) {
  if (c.expira_en) {
    return new Date(c.expira_en).toLocaleString("es-MX", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }
  return c.expira || null;
}

export default function AdminCodigosList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [codigos, setCodigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [confirmarBorrar, setConfirmarBorrar] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const data = await getCodigosDescuento();
      setCodigos(data);
    } catch (err) {
      console.error(err);
      showToast("Error cargando los códigos. Recarga la página.", "error");
    } finally {
      setLoading(false);
    }
  }

  function abrirCrear() {
    setEditing(null);
    setForm(FORM_VACIO);
    setError(null);
    setModalOpen(true);
  }

  function abrirEditar(c) {
    setEditing(c);
    setForm({
      codigo: c.codigo,
      tipo: c.tipo,
      valor: String(c.valor),
      aplica_a: c.aplica_a,
      activo: c.activo,
      expira: c.expira || "",
      usos_maximos: c.usos_maximos == null ? "" : String(c.usos_maximos),
    });
    setError(null);
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.codigo.trim()) {
      setError("El código es obligatorio.");
      return;
    }
    if (!form.valor || Number(form.valor) <= 0) {
      setError("El valor debe ser mayor a 0.");
      return;
    }
    if (form.tipo === "percentage" && Number(form.valor) > 100) {
      setError("Un porcentaje no puede ser mayor a 100.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await updateCodigo(editing.id, form);
      } else {
        await createCodigo(form);
      }
      setModalOpen(false);
      await fetchData();
    } catch (err) {
      if (err.code === "23505") {
        setError("Ya existe un código con ese nombre.");
      } else {
        setError("Error al guardar. Intenta de nuevo.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleEliminar(c) {
    try {
      await deleteCodigo(c.id);
      setConfirmarBorrar(null);
      await fetchData();
    } catch {
      showToast("Error al borrar.", "error");
    }
  }

  const filtrados = codigos.filter((c) =>
    (c.codigo || "").toLowerCase().includes(busqueda.toLowerCase().trim()),
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#2C2C2C] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 hover:text-[#D4AF7A] transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Volver al panel</span>
          </button>
          <h1 className="text-lg sm:text-xl font-bold">
            Cupones ({codigos.length})
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A47E3B] focus:outline-none text-sm"
            />
          </div>
          <button
            onClick={abrirCrear}
            className="flex items-center justify-center gap-2 bg-[#A47E3B] hover:bg-[#D4AF7A] text-white px-5 py-2 rounded-md text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            Crear cupón
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-12">Cargando...</p>
        ) : filtrados.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            {busqueda ? "Sin coincidencias." : "No hay cupones todavía."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtrados.map((c) => {
              const expirado = estaExpirado(c);
              const inactivo = !c.activo || expirado;
              return (
                <div
                  key={c.id}
                  className={`bg-white rounded-xl shadow-sm border p-4 ${
                    inactivo ? "border-gray-200 opacity-70" : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate font-mono">
                        {c.codigo}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {descripcionDescuento(c)}
                      </p>
                    </div>
                    {c.activo && !expirado ? (
                      <span className="shrink-0 text-[10px] font-bold uppercase px-2 py-1 rounded bg-emerald-100 text-emerald-700">
                        Activo
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] font-bold uppercase px-2 py-1 rounded bg-gray-200 text-gray-600">
                        {expirado ? "Expirado" : "Inactivo"}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 space-y-0.5 mb-3">
                    <p>
                      Expira:{" "}
                      {textoExpira(c) ? (
                        <span className={expirado ? "text-red-600 font-semibold" : ""}>
                          {textoExpira(c)}
                        </span>
                      ) : (
                        "sin fecha"
                      )}
                    </p>
                    <p>
                      Usos:{" "}
                      {c.usos_maximos == null
                        ? "ilimitado"
                        : `${c.usos_actuales} / ${c.usos_maximos}`}
                    </p>
                  </div>

                  {confirmarBorrar === c.id ? (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEliminar(c)}
                        className="flex-1 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-semibold hover:bg-red-100"
                      >
                        Confirmar borrar
                      </button>
                      <button
                        onClick={() => setConfirmarBorrar(null)}
                        className="px-3 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-2 justify-end">
                      <button
                        onClick={() => abrirEditar(c)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold hover:bg-blue-200"
                      >
                        <Pencil size={12} />
                        Editar
                      </button>
                      <button
                        onClick={() => setConfirmarBorrar(c.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-semibold hover:bg-red-100"
                      >
                        <Trash2 size={12} />
                        Borrar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editing ? "Editar cupón" : "Crear cupón"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Código <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.codigo}
                  onChange={(e) =>
                    setForm({ ...form, codigo: e.target.value.toUpperCase() })
                  }
                  placeholder="EJEMPLO20"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono uppercase focus:ring-2 focus:ring-[#A47E3B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#A47E3B] focus:outline-none"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="amount">Monto fijo ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Valor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={form.valor}
                    onChange={(e) => setForm({ ...form, valor: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#A47E3B] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Aplica a
                </label>
                <select
                  value={form.aplica_a}
                  onChange={(e) => setForm({ ...form, aplica_a: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#A47E3B] focus:outline-none"
                >
                  {OPCIONES_APLICA.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Expira (opcional)
                  </label>
                  <input
                    type="date"
                    value={form.expira}
                    onChange={(e) => setForm({ ...form, expira: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#A47E3B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Usos máx. (opcional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.usos_maximos}
                    onChange={(e) =>
                      setForm({ ...form, usos_maximos: e.target.value })
                    }
                    placeholder="ilimitado"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#A47E3B] focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                  className="rounded border-gray-300 text-[#A47E3B] focus:ring-[#A47E3B]"
                />
                Cupón activo
              </label>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                  {error}
                </p>
              )}
            </div>

            <div className="flex gap-2 mt-5 justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-[#A47E3B] hover:bg-[#D4AF7A] text-white rounded-md text-sm font-semibold disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}