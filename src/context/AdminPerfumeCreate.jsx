import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createParfumAdmin } from "../functions/getParfumsAdmin";
import { ensureCasaExists } from "../functions/getCasas";
import ImageUploader from "../ui/ImageUploader";
import CasaAutocomplete from "../ui/CasaAutocomplete";

const OPCIONES_CATEGORIA = ["Nicho", "Diseñador", "Árabe"];
const OPCIONES_CONCENTRACION = [
  "Absolu De Parfum",
  "Eau De Parfum",
  "Eau De Toilette",
  "Extrait de Parfum",
  "Parfum",
  "Pure Parfum",
];
const OPCIONES_DISPONIBLE = ["Disponible", "Agotado", "Próximamente"];



const OPCIONES_LINEA_TESTER = ["Línea", "Tester"];

const OPCIONES_ESTADO = ["Sellado", "Parcial", "Nuevo"];

const DEFAULT_FORM = {
  nombre: "",
  casa: "",
  categoria: "Nicho",
  concentracion: "Eau De Parfum",
  disponible: "Próximamente",
  stock: false,
  notas: "",
  precio: "",
  mlBotella: null,
  botellasDisponibles: null,
  image: "",
  fraganticaLink: "",
  tiktokLink: "",
  esBestSeller: false,
  linea_tester: "",
  estado_botella: "",
  tiene_caja: null,
};

export default function AdminPerfumeCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.nombre?.trim() || !form.casa?.trim()) {
      setError("Nombre y casa son obligatorios.");
      return;
    }
    if (form.precio === "" || isNaN(Number(form.precio))) {
      setError("Precio inválido.");
      return;
    }

    setSaving(true);
    try {
      const newParfum = {
        ...form,
        precio: Number(form.precio) || 0,
        mlBotella:
          form.mlBotella !== null && form.mlBotella !== ""
            ? Number(form.mlBotella) || null
            : null,
        botellasDisponibles:
          form.botellasDisponibles !== null && form.botellasDisponibles !== ""
            ? Number(form.botellasDisponibles) || null
            : null,
      };

      await createParfumAdmin(newParfum);
      ensureCasaExists(newParfum.casa).catch((err) =>
        console.error("Error asegurando la casa:", err),
      );
      setSuccess(true);

      setTimeout(() => {
        navigate("/admin/perfumes");
      }, 800);
    } catch (err) {
      setError("Error al crear el perfume. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const esBotella = form.stock === true;
  const esDecant = form.stock === false;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#2C2C2C] text-white shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/perfumes")}
              className="p-2 hover:bg-gray-700 rounded-md transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Nuevo perfume</h1>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving || success}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              saving || success
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-[#A47E3B] hover:bg-[#D4AF7A]"
            }`}
          >
            {success ? <CheckCircle size={16} /> : <Save size={16} />}
            <span className="hidden sm:inline">
              {saving ? "Creando..." : success ? "Creado" : "Crear"}
            </span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4 flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md mb-4 flex items-center gap-2">
            <CheckCircle size={20} />
            Perfume creado correctamente
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información básica
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nombre *">
                <input
                  type="text"
                  value={form.nombre || ""}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  className={inputClass}
                  placeholder="Ej: Aventus"
                />
              </Field>

              <Field label="Casa *">
                <CasaAutocomplete
                  value={form.casa || ""}
                  onChange={(val) => handleChange("casa", val)}
                  className={inputClass}
                  placeholder="Ej: Creed"
                />
              </Field>

              <Field label="Categoría">
                <select
                  value={form.categoria || ""}
                  onChange={(e) => handleChange("categoria", e.target.value)}
                  className={inputClass}
                >
                  {OPCIONES_CATEGORIA.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Concentración">
                <select
                  value={form.concentracion || ""}
                  onChange={(e) =>
                    handleChange("concentracion", e.target.value)
                  }
                  className={inputClass}
                >
                  {OPCIONES_CONCENTRACION.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Disponibilidad">
                <select
                  value={form.disponible || ""}
                  onChange={(e) => handleChange("disponible", e.target.value)}
                  className={inputClass}
                >
                  {OPCIONES_DISPONIBLE.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </Field>

              {esBotella && (
                <>
                  <Field label="Línea / Tester">
                    <select
                      value={form.linea_tester || ""}
                      onChange={(e) => handleChange("linea_tester", e.target.value)}
                      className={inputClass}
                    >
                      <option value="">— sin especificar —</option>
                      {OPCIONES_LINEA_TESTER.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Estado de la botella">
                    <select
                      value={form.estado_botella || ""}
                      onChange={(e) => handleChange("estado_botella", e.target.value)}
                      className={inputClass}
                    >
                      <option value="">— sin especificar —</option>
                      {OPCIONES_ESTADO.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="¿Tiene caja?">
                    <select
                      value={form.tiene_caja === null ? "" : form.tiene_caja ? "true" : "false"}
                      onChange={(e) => {
                        const v = e.target.value;
                        handleChange("tiene_caja", v === "" ? null : v === "true");
                      }}
                      className={inputClass}
                    >
                      <option value="">— sin especificar —</option>
                      <option value="true">Con caja</option>
                      <option value="false">Sin caja</option>
                    </select>
                  </Field>
                </>
              )}

              <Field label="Tipo de venta">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleChange("stock", false)}
                    className={`flex-1 py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
                      esDecant
                        ? "bg-[#A47E3B] text-white border-[#A47E3B]"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    Decant
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange("stock", true)}
                    className={`flex-1 py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
                      esBotella
                        ? "bg-[#A47E3B] text-white border-[#A47E3B]"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    Botella
                  </button>
                </div>
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Notas">
                <textarea
                  value={form.notas || ""}
                  onChange={(e) => handleChange("notas", e.target.value)}
                  rows="3"
                  className={inputClass}
                  placeholder="Ej: Cuero, especias, ámbar..."
                />
              </Field>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Precio y stock
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label={esDecant ? "Precio por ml *" : "Precio por botella *"}
              >
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.precio ?? ""}
                  onChange={(e) => handleChange("precio", e.target.value)}
                  className={inputClass}
                  placeholder={esDecant ? "Ej: 200" : "Ej: 4500"}
                />
              </Field>


              {esBotella && (
                <>
                  <Field label="Tamaño botella (ml)">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.mlBotella ?? ""}
                      onChange={(e) =>
                        handleChange("mlBotella", e.target.value)
                      }
                      className={inputClass}
                      placeholder="Ej: 100"
                    />
                  </Field>

                  <Field label="Botellas disponibles">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.botellasDisponibles ?? ""}
                      onChange={(e) =>
                        handleChange("botellasDisponibles", e.target.value)
                      }
                      className={inputClass}
                      placeholder="Ej: 1"
                    />
                  </Field>
                </>
              )}
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Imagen
            </h2>

            <ImageUploader
              value={form.image || ""}
              onChange={(newUrl) => handleChange("image", newUrl)}
              bucket="perfumsImages"
            />
          </section>

          <section className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Links</h2>

            <div className="space-y-4">
              <Field label="Link de Fragrantica">
                <input
                  type="text"
                  value={form.fraganticaLink || ""}
                  onChange={(e) =>
                    handleChange("fraganticaLink", e.target.value)
                  }
                  className={inputClass}
                  placeholder="https://www.fragrantica.com/..."
                />
              </Field>

              <Field label="Link de TikTok">
                <input
                  type="text"
                  value={form.tiktokLink || ""}
                  onChange={(e) => handleChange("tiktokLink", e.target.value)}
                  className={inputClass}
                  placeholder="https://www.tiktok.com/..."
                />
              </Field>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Destacados
            </h2>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.esBestSeller === true}
                onChange={(e) =>
                  handleChange("esBestSeller", e.target.checked)
                }
                className="w-5 h-5 rounded border-gray-300 text-[#A47E3B] focus:ring-[#A47E3B]"
              />
              <span className="text-gray-800 font-medium">
                Marcar como Mejor Vendido
              </span>
            </label>
          </section>

          <div className="sm:hidden">
            <button
              type="submit"
              disabled={saving || success}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                saving || success
                  ? "bg-gray-300 text-gray-500"
                  : "bg-[#A47E3B] text-white hover:bg-[#D4AF7A]"
              }`}
            >
              {saving
                ? "Creando..."
                : success
                  ? "Creado ✓"
                  : "Crear perfume"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A47E3B] focus:border-[#A47E3B] outline-none transition";

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 block">
        {label}
      </label>
      {children}
    </div>
  );
}
