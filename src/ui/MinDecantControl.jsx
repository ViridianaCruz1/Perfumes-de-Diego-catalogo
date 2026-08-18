import { useEffect, useState } from "react";
import supabase from "../services/supabase";

export default function MinDecantControl() {
  const [minimo, setMinimo] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("config_bazar")
        .select("min_decant_siempre")
        .eq("id", 1)
        .single();
      if (data) setMinimo(Number(data.min_decant_siempre) || 0);
      setCargando(false);
    })();
  }, []);

  const guardar = async () => {
    setMsg("");
    const { error } = await supabase
      .from("config_bazar")
      .update({ min_decant_siempre: Number(minimo) || 0 })
      .eq("id", 1);
    if (error) {
      setMsg("No se pudo guardar. Revisa permisos (RLS) o conexión.");
    } else {
      setMsg("Guardado ✓");
      setTimeout(() => setMsg(""), 2500);
    }
  };

  if (cargando) {
    return (
      <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
        <p className="text-sm text-gray-500">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
      <h3 className="font-bold text-gray-900">Mínimo de compra por decant</h3>
      <p className="text-xs text-gray-500 mt-0.5 mb-3">
        Cada decant debe llegar a este monto. El sitio oculta las cantidades de
        ml por debajo, según el precio de cada perfume. Aplica siempre, en toda
        la tienda. Pon 0 para no exigir mínimo. Ensar Oud no se toca.
      </p>
      <div className="flex items-center gap-3">
        <span className="text-gray-600">$</span>
        <input
          type="number"
          min="0"
          step="10"
          value={minimo}
          onChange={(e) => setMinimo(e.target.value)}
          onBlur={guardar}
          className="w-40 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#A47E3B] focus:outline-none"
        />
        {msg && <span className="text-xs text-gray-500">{msg}</span>}
      </div>
    </div>
  );
}
