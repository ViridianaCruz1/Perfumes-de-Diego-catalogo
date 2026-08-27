import { useState } from "react";
import { MessageCircle } from "lucide-react";

const WHATSAPP = "5212212034647";

/**
 * Casilla para pedir perfumes que no están en la tienda.
 * El cliente escribe qué busca y se abre WhatsApp con el mensaje ya armado.
 */
export default function CotizarPerfume({ sugerencia = "" }) {
  const [texto, setTexto] = useState(sugerencia);

  const enviar = () => {
    const base = "Hola Diego, busco un perfume que no vi en tu tienda";
    const limpio = texto.trim();
    const mensaje = limpio
      ? `${base}: ${limpio}. ¿Me lo puedes cotizar?`
      : `${base}. ¿Me puedes ayudar a conseguirlo?`;
    window.open(
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const alPresionar = (e) => {
    if (e.key === "Enter") enviar();
  };

  return (
    <div className="bg-[#faf6ef] border border-[#e7dcc7] rounded-xl p-5 sm:p-6">
      <h3 className="text-lg font-bold text-gray-900">
        ¿Buscas un perfume que no está aquí?
      </h3>
      <p className="text-sm text-gray-600 mt-1 mb-4">
        Escríbelo y te lo cotizo por WhatsApp. Consigo muchos perfumes bajo
        pedido, no solo los que ves en la tienda.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={alPresionar}
          placeholder="Ej. Amber Zero (Adar), Nishane Hacivat…"
          className="flex-1 border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#A47E3B] focus:outline-none"
        />
        <button
          onClick={enviar}
          className="flex items-center justify-center gap-2 bg-[#A47E3B] text-white px-5 py-2.5 rounded-md font-semibold hover:bg-[#8b6d32] whitespace-nowrap"
        >
          <MessageCircle size={18} />
          Pídelo por WhatsApp
        </button>
      </div>
    </div>
  );
}
