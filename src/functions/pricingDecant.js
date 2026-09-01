/**
 * Utilidades de precio y opciones de mililitros para decants.
 *
 * Casos especiales que maneja:
 * - Ensar Oud: opciones [0.5, 1, 1.5, 2, 2.5, 3], 0.5 ml = precio * 0.6
 * - Resto: opciones [1...10], precio * mililitros
 *
 * Toda la lógica vive aquí. Los componentes solo consumen estas funciones.
 */

const OPCIONES_ENSAR_OUD = [0.5, 1, 1.5, 2, 2.5, 3];
const OPCIONES_DEFAULT = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const FACTOR_MEDIO_ML = 0.6; // 0.5 ml cuesta 60% del precio de 1 ml
const INCREMENTO_ENSAR_OUD = 0.5;
const INCREMENTO_DEFAULT = 1;

const isEnsarOud = (parfum) => parfum?.casa === "Ensar Oud";

/**
 * Devuelve las opciones de ml disponibles para un perfume.
 * Oculta las cantidades cuyo precio quede por debajo del mínimo de compra por
 * decant (minSiempre). Ensar Oud no se toca.
 * @param {object} parfum
 * @param {{minSiempre?: number}} opts
 * @returns {Array<{value: number, label: string}>}
 */
export function getOpcionesMililitros(parfum, opts = {}) {
  const { minSiempre = 0 } = opts;
  const lista = isEnsarOud(parfum) ? OPCIONES_ENSAR_OUD : OPCIONES_DEFAULT;

  const efectivo = minSiempre;

  let valores = lista;
  if (efectivo > 0 && !isEnsarOud(parfum)) {
    const filtradas = lista.filter(
      (ml) => calcularPrecioDecant(parfum, ml) >= efectivo,
    );
    // Si nada alcanza el mínimo, deja al menos la cantidad más grande.
    valores = filtradas.length > 0 ? filtradas : [lista[lista.length - 1]];
  }

  return valores.map((num) => ({
    value: num,
    label: `${num} ml`,
  }));
}

/**
 * Calcula el precio total de un decant según el perfume y los ml.
 * @param {object} parfum - objeto del perfume con casa, precio
 * @param {number} mililitros - cantidad de ml
 * @returns {number} precio total
 */
export function calcularPrecioDecant(parfum, mililitros) {
  if (!parfum || mililitros == null || mililitros <= 0) return 0;

  const precio = Number(parfum.precio) || 0;

  // Caso Ensar Oud (medios ml con factor especial)
  if (isEnsarOud(parfum)) {
    const enteros = Math.floor(mililitros);
    const tieneMedio = mililitros - enteros === 0.5;
    let total = enteros * precio;
    if (tieneMedio) {
      total += precio * FACTOR_MEDIO_ML;
    }
    return total;
  }

  // Caso default
  return precio * mililitros;
}

/**
 * Variante para items del carrito (donde tenemos precioUnitario, no precio).
 * @param {object} item - item del carrito con precioUnitario, casa
 * @param {number} mililitros - opcional, si no se pasa usa item.mililitros
 * @returns {number} precio total del item
 */
export function calcularPrecioDecantCarrito(item, mililitros = null) {
  if (!item) return 0;
  const ml = mililitros != null ? mililitros : Number(item.mililitros) || 0;
  if (ml <= 0) return 0;

  const precio = Number(item.precioUnitario) || 0;

  // Caso Ensar Oud
  if (item.casa === "Ensar Oud") {
    const enteros = Math.floor(ml);
    const tieneMedio = ml - enteros === 0.5;
    let total = enteros * precio;
    if (tieneMedio) {
      total += precio * FACTOR_MEDIO_ML;
    }
    return total;
  }

  return precio * ml;
}

/**
 * Devuelve cuánto debe sumar/restar el botón +/- según el perfume.
 * @returns {number} 0.5 para Ensar Oud, 1 para el resto
 */
export function getIncrementoMililitros(parfum) {
  return isEnsarOud(parfum) ? INCREMENTO_ENSAR_OUD : INCREMENTO_DEFAULT;
}

/**
 * Devuelve el ml mínimo permitido para un perfume.
 * @returns {number} 0.5 para Ensar Oud, 1 para el resto
 */
export function getMililitrosMinimos(parfum) {
  return isEnsarOud(parfum) ? 0.5 : 1;
}

/**
 * ml máximo permitido para un decant (el mayor de las opciones estándar).
 * Sirve para topar el "+" del carrito y que no supere el máximo de la tienda.
 * @param {object} item
 * @returns {number}
 */
export function getMililitrosMaximos(item) {
  const lista = isEnsarOud(item) ? OPCIONES_ENSAR_OUD : OPCIONES_DEFAULT;
  return lista[lista.length - 1];
}

/**
 * ml mínimo respetando el mínimo de compra en $ por decant (min_decant_siempre).
 * Devuelve la cantidad de ml más baja cuyo precio alcanza el mínimo. Si el
 * mínimo es 0, o es Ensar Oud (excluido del mínimo), regresa el piso normal.
 * Acepta tanto un perfume (con precio) como un item de carrito (precioUnitario).
 * @param {object} item
 * @param {number} minSiempre - mínimo de compra en $ por decant
 * @returns {number} ml mínimo permitido
 */
export function getMililitrosMinimosMonto(item, minSiempre = 0) {
  const piso = isEnsarOud(item) ? 0.5 : 1;
  if (!minSiempre || minSiempre <= 0 || isEnsarOud(item)) return piso;
  const precio = Number(item?.precioUnitario ?? item?.precio) || 0;
  if (precio <= 0) return piso;
  const alcanza = OPCIONES_DEFAULT.find((ml) => precio * ml >= minSiempre);
  return alcanza ?? OPCIONES_DEFAULT[OPCIONES_DEFAULT.length - 1];
}

/**
 * Para el placeholder/label del select, según la casa.
 */
export function getPlaceholderMililitros(parfum) {
  return "-- Elige mililitros --";
}