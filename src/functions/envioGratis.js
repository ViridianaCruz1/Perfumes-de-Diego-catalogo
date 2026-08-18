import { calcularPrecioDecantCarrito } from "./pricingDecant";

export const UMBRAL_ENVIO_GRATIS = 1950;

/**
 * Fuente ÚNICA de la lógica de envío gratis.
 * Solo suman los decants individuales.
 *
 * @returns {object} {
 *   total,          monto elegible (ya con descuento aplicado)
 *   califica,       si alcanza el envío gratis
 *   falta,          cuánto falta para el umbral
 *   porcentaje,     avance 0-100 para la barra
 *   hayElegibles,   el carrito trae decants que suman
 * }
 */
export function getEstadoEnvioGratis({
  cartItems = [],
  isDiscountApplied = false,
  discountType = null,
  discountValue = 0,
  discountTarget = "ALL",
  bazarActivo = false,
} = {}) {
  // Durante el modo bazar no hay envío gratis (se entrega en mano).
  if (bazarActivo) {
    return {
      total: 0,
      califica: false,
      falta: UMBRAL_ENVIO_GRATIS,
      porcentaje: 0,
      hayElegibles: false,
      bazar: true,
    };
  }

  const elegibles = cartItems.filter((i) => i.tipoVenta === "decant");

  const subtotal = elegibles.reduce(
    (sum, item) => sum + calcularPrecioDecantCarrito(item),
    0,
  );

  let total = subtotal;
  if (
    isDiscountApplied &&
    (discountTarget === "ALL" || discountTarget === "DECANT")
  ) {
    if (discountType === "percentage") {
      total = subtotal * (1 - discountValue / 100);
    } else if (discountType === "amount") {
      total = Math.max(0, subtotal - discountValue);
    }
  }

  return {
    total,
    califica: subtotal > 0 && total >= UMBRAL_ENVIO_GRATIS,
    falta: Math.max(0, UMBRAL_ENVIO_GRATIS - total),
    porcentaje: Math.min((total / UMBRAL_ENVIO_GRATIS) * 100, 100),
    hayElegibles: elegibles.length > 0,
  };
}
