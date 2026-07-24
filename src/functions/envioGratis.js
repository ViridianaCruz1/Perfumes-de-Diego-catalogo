import { calcularPrecioDecantCarrito } from "./pricingDecant";

export const UMBRAL_ENVIO_GRATIS = 1950;

/**
 * Los 30 ml de Louis Vuitton se venden con precio especial (precio30ml), o sea
 * que ya traen descuento. Por eso NO suman para el envío gratis.
 *
 * La condición espeja EXACTAMENTE la de pricingDecant.calcularPrecioDecantCarrito.
 * Si algún día otra casa recibe precio fijo de 30 ml, hay que actualizar los dos.
 */
export function esDecantConPrecioEspecial30ml(item) {
  return (
    item?.tipoVenta === "decant" &&
    Number(item?.mililitros) === 30 &&
    item?.casa === "Louis Vuitton"
  );
}

/**
 * Fuente ÚNICA de la lógica de envío gratis.
 * Solo suman los decants individuales, excepto los que ya llevan precio
 * especial de 30 ml (Louis Vuitton).
 *
 * @returns {object} {
 *   total,          monto elegible (ya con descuento aplicado)
 *   califica,       si alcanza el envío gratis
 *   falta,          cuánto falta para el umbral
 *   porcentaje,     avance 0-100 para la barra
 *   hayEspeciales,  el carrito trae 30 ml de Louis Vuitton
 *   hayElegibles,   el carrito trae decants que sí suman
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
      hayEspeciales: false,
      hayElegibles: false,
      bazar: true,
    };
  }

  const decants = cartItems.filter((i) => i.tipoVenta === "decant");
  const elegibles = decants.filter((i) => !esDecantConPrecioEspecial30ml(i));
  const hayEspeciales = decants.some(esDecantConPrecioEspecial30ml);

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
    hayEspeciales,
    hayElegibles: elegibles.length > 0,
  };
}
