import { useState } from "react";
import { useCart } from "../context/CartContext";
import { formatPrecio } from "../functions/formatPrecio";
import {
  getEstadoEnvioGratis,
  UMBRAL_ENVIO_GRATIS,
} from "../functions/envioGratis";

function EnvioGratisProgress() {
  const {
    cartItems,
    isDiscountApplied,
    discountType,
    discountValue,
    discountTarget,
  } = useCart();
  const [showTerms, setShowTerms] = useState(false);

  const { califica, falta, porcentaje, hayElegibles } =
    getEstadoEnvioGratis({
      cartItems,
      isDiscountApplied,
      discountType,
      discountValue,
      discountTarget,
    });

  // Sin decants en el carrito: no hay nada que mostrar.
  if (!hayElegibles) return null;

  const botonTerminos = (
    <>
      <button
        onClick={() => setShowTerms(!showTerms)}
        className="text-[10px] text-gray-500 hover:text-[#A47E3B] underline mt-1 block mx-auto"
      >
        {showTerms ? "Ocultar términos" : "Ver términos y condiciones"}
      </button>

      {showTerms && (
        <div className="mt-2 p-3 bg-white border border-gray-200 rounded-md text-[11px] text-gray-600 leading-relaxed">
          <p className="font-semibold text-gray-800 mb-1">
            Términos del envío gratis
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              Aplica únicamente en decants individuales. No válido en botellas
              completas ni parciales.
            </li>
            <li>
              Monto mínimo: ${formatPrecio(UMBRAL_ENVIO_GRATIS, 0)} en decants
              individuales.
            </li>
            <li>
              Válido solo para <strong>zonas regulares de DHL</strong>. No aplica
              en zonas extendidas o de cobertura especial.
            </li>
            <li>
              En caso de zona extendida, se cotizará el envío por WhatsApp al
              finalizar el pedido.
            </li>
          </ul>
        </div>
      )}
    </>
  );

  return (
    <div className="px-6 py-3 bg-gradient-to-r from-amber-50 to-white border-b border-amber-100">
      {califica ? (
        <p className="text-sm text-green-700 font-semibold text-center mb-2">
          🎉 ¡Tienes envío gratis!
        </p>
      ) : (
        <p className="text-sm text-gray-700 text-center mb-2">
          Te faltan{" "}
          <span className="font-bold text-[#A47E3B]">
            ${formatPrecio(falta, 0)}
          </span>{" "}
          en decants para <span className="font-semibold">envío gratis</span>
        </p>
      )}

      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            califica
              ? "bg-gradient-to-r from-green-400 to-green-600"
              : "bg-gradient-to-r from-[#A47E3B] to-[#D4AF7A]"
          }`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>

      {botonTerminos}
    </div>
  );
}

export default EnvioGratisProgress;
