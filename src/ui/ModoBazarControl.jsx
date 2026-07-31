import { useEffect, useState } from "react";
import supabase from "../services/supabase";

export default function ModoBazarControl() {
  const [activo, setActivo] = useState(false);
  const [recargo, setRecargo] = useState(0);
  const [minDecant, setMinDecant] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("config_bazar")
        .select("activo, recargo, min_decant")
        .eq("id", 1)
        .single();
      if (data) {
        setActivo(!!data.activo);
        setRecargo(Number(data.recargo) || 0);
        setMinDecant(Number(data.min_decant) || 0);
      }
      setCargando(false);
    })();
  }, []);

  const guardar = async (nuevoActivo, nuevoRecargo, nuevoMin) => {
    setGuardando(true);
    setMsg("");
    const { error } = await supabase
      .from("config_bazar")
      .update({
        activo: nuevoActivo,
        recargo: Number(nuevoRecargo) || 0,
        min_decant: Number(nuevoMin) || 0,
        actualizado_en: new Date().toISOString(),
      })
      .eq("id", 1);
    setGuardando(false);
    if (error) {
      setMsg("No se pudo guardar. Revisa permisos (RLS) o conexión.");
    } else {
      setMsg("Guardado ✓");
      setTimeout(() => setMsg(""), 2500);
    }
  };

  const toggle = () => {
    const nuevo = !activo;
    setActivo(nuevo);
    guardar(nuevo, recargo, minDecant);
  };

  if (cargando) {
    return (
      <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
        <p className="text-sm text-gray-500">Cargando modo bazar…</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="font-bold text-gray-900">Modo Bazar</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Sube todos los precios del sitio el % indicado. Se desactivan
            cupones y envío gratis. Ensar Oud no se toca.
          </p>
        </div>
        <button
          onClick={toggle}
          disabled={guardando}
          aria-label="Activar o desactivar modo bazar"
          className={`relative w-14 h-8 rounded-full transition-colors shrink-0 ${
            activo ? "bg-[#A47E3B]" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
              activo ? "translate-x-6" : ""
            }`}
          />
        </button>
      </div>

      <label className="text-sm font-medium text-gray-700">Recargo (%)</label>
      <input
        type="number"
        min="0"
        step="1"
        value={recargo}
        onChange={(e) => setRecargo(e.target.value)}
        onBlur={() => guardar(activo, recargo, minDecant)}
        className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#A47E3B] focus:outline-none"
      />

      <label className="text-sm font-medium text-gray-700 block mt-4">
        Mínimo por decant ($)
      </label>
      <p className="text-xs text-gray-500 mt-0.5 mb-1">
        Cada decant debe llegar a este monto. El sistema oculta las cantidades
        de ml que queden por debajo, según el precio de cada perfume. Pon 0 para
        no exigir mínimo.
      </p>
      <input
        type="number"
        min="0"
        step="10"
        value={minDecant}
        onChange={(e) => setMinDecant(e.target.value)}
        onBlur={() => guardar(activo, recargo, minDecant)}
        className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#A47E3B] focus:outline-none"
      />

      <p
        className={`mt-3 text-sm font-semibold ${
          activo ? "text-[#A47E3B]" : "text-gray-400"
        }`}
      >
        {activo
          ? `ACTIVO · +${recargo}% en todo el sitio`
          : "Apagado (precios normales)"}
      </p>
      {msg && <p className="text-xs text-gray-500 mt-1">{msg}</p>}
      <p className="text-[11px] text-gray-400 mt-2">
        El cambio se refleja en el sitio en ~30 segundos (o al recargar).
      </p>
    </div>
  );
}
