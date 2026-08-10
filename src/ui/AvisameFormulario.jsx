import { useState } from "react";
import { Bell, CheckCircle, AlertCircle } from "lucide-react";
import { createAvisoStock } from "../functions/getAvisosStock";

export default function AvisameFormulario({ parfum }) {
  const [whatsapp, setWhatsapp] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const whatsappLimpio = whatsapp.replace(/\D/g, "");

    if (whatsappLimpio.length < 10) {
      setError("Ingresa un número de WhatsApp válido (mínimo 10 dígitos).");
      return;
    }

    setEnviando(true);
    try {
      await createAvisoStock({
        parfum_id: parfum.id,
        parfum_nombre: parfum.nombre,
        parfum_casa: parfum.casa || null,
        tipo:
          parfum.stock === true
            ? "botella"
            : parfum.stock === false
              ? "decant"
              : null,
        whatsapp: whatsappLimpio,
      });
      setExito(true);
    } catch (err) {
      // 23505 = violación de UNIQUE: ya hay un aviso pendiente con este
      // WhatsApp para este perfume. Se trata como éxito amable.
      if (err?.code === "23505") {
        setExito(true);
      } else {
        setError("No se pudo registrar tu aviso. Intenta de nuevo.");
      }
    } finally {
      setEnviando(false);
    }
  };

  if (exito) {
    return (
      <div className="bg-green-50 border border-green-300 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle
          className="text-green-600 flex-shrink-0 mt-0.5"
          size={20}
        />
        <div>
          <p className="font-semibold text-green-800 text-sm">¡Listo!</p>
          <p className="text-sm text-green-700">
            Te avisaremos por WhatsApp en cuanto llegue {parfum.nombre}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-sky-50 border border-sky-200 rounded-lg p-4 space-y-3"
    >
      <div className="flex items-start gap-2">
        <Bell className="text-sky-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="font-semibold text-sky-900 text-sm">
            Avísame cuando llegue
          </p>
          <p className="text-xs text-sky-800">
            Te mando un mensaje por WhatsApp en cuanto esté disponible.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          WhatsApp <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="Ej: 222 123 4567"
          required
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-2">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={enviando}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
          enviando
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white"
        }`}
      >
        <Bell size={16} />
        {enviando ? "Registrando..." : "Avísame cuando llegue"}
      </button>
    </form>
  );
}