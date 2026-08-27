import { useCart } from "../context/CartContext";
import { useState } from "react";
import { Package, Trash2 } from "lucide-react";
import { imagenThumb } from "../functions/imagenThumb";
import {
  calcularPrecioDecantCarrito,
  getIncrementoMililitros,
  getMililitrosMinimos,
} from "../functions/pricingDecant";
import { formatPrecio } from "../functions/formatPrecio";

function ShoppingCartProduct({ soloLectura = false }) {
  const {
    cartItems,
    removeFromCart,
    updateCartItem,
    discountType,
    discountValue,
    discountTarget,
    isDiscountApplied,
  } = useCart();

  const [confirmingDelete, setConfirmingDelete] = useState(null);

  const calculateItemTotal = (item) => {
    if (item.tipoVenta === "botella") {
      return (item.precioUnitario || 0) * (item.cantidad || 0);
    }
    if (item.tipoVenta === "decant") {
      return calcularPrecioDecantCarrito(item);
    }
    return 0;
  };

  const productHasDiscount = (item) => {
    if (!isDiscountApplied) return false;
    // El cupón de monto fijo es a nivel carrito, no por artículo: se muestra
    // solo en el total (evita restarlo de más en cada producto).
    if (discountType === "amount") return false;
    if (discountTarget === "ALL") return true;
    if (discountTarget === "DECANT") return item.tipoVenta === "decant";
    if (discountTarget === "BOTELLA") return item.tipoVenta === "botella";
    if (discountTarget === "BOTELLA_SELLADA")
      return item.tipoVenta === "botella" && item.estado_botella?.startsWith("Sellado");
    return false;
  };

  const getDiscountedPrice = (item) => {
    const itemTotal = calculateItemTotal(item);
    if (!productHasDiscount(item)) return itemTotal;
    if (discountType === "percentage") {
      return itemTotal - (itemTotal * discountValue) / 100;
    }
    if (discountType === "amount") {
      return Math.max(0, itemTotal - discountValue);
    }
    return itemTotal;
  };

  const handleIncrease = (item) => {
    if (item.tipoVenta === "botella") {
      if (item.cantidad < item.stockDisponible) {
        updateCartItem(item.id, "botella", item.cantidad + 1);
      }
    }
    if (item.tipoVenta === "decant") {
      const incremento = getIncrementoMililitros(item);
      updateCartItem(item.id, "decant", item.mililitros + incremento);
    }
  };

  const handleDecrease = (item) => {
    if (item.tipoVenta === "botella" && item.cantidad > 1) {
      updateCartItem(item.id, "botella", item.cantidad - 1);
    }
    if (item.tipoVenta === "decant") {
      const incremento = getIncrementoMililitros(item);
      const minimo = getMililitrosMinimos(item);
      const nuevosMl = item.mililitros - incremento;
      if (nuevosMl >= minimo) {
        updateCartItem(item.id, "decant", nuevosMl);
      }
    }
  };

  // El estado vacío lo muestra el panel padre (ShoppingCart), no aquí.
  if (cartItems.length === 0) return null;

  return (
    <div className="p-6 items-center">
      {cartItems.map((item) => {
        const itemTotal = calculateItemTotal(item);
        const hasDiscount = productHasDiscount(item);
        const discountedPrice = getDiscountedPrice(item);
        const itemKey = `${item.id}-${item.tipoVenta}`;

        // Límites del stepper
        const incremento =
          item.tipoVenta === "decant" ? getIncrementoMililitros(item) : 1;
        const minimo =
          item.tipoVenta === "decant" ? getMililitrosMinimos(item) : 1;
        const canDecrease =
          item.tipoVenta === "botella"
            ? item.cantidad > 1
            : item.mililitros - incremento >= minimo;
        const canIncrease =
          item.tipoVenta === "botella"
            ? item.cantidad < item.stockDisponible
            : true;

        const handleRemove = () => {
          removeFromCart(item.id, item.tipoVenta);
          setConfirmingDelete(null);
        };

        return (
          <div key={itemKey} className="flex gap-4 border-b py-3">
            {item.image || item.imagen ? (
              <img
                src={imagenThumb(item.image || item.imagen, 200)}
                alt={item.nombre}
                loading="lazy"
                className="w-24 h-32 object-cover rounded-md"
              />
            ) : (
              <div className="w-24 h-32 bg-gray-100 rounded-md flex items-center justify-center">
                <Package className="text-gray-300" size={32} />
              </div>
            )}

            <div className="flex-1">
              <h3 className="text-sm font-medium">{item.nombre}</h3>
              <p className="text-gray-500 text-sm">{item.casa}</p>

              {soloLectura && (
                <p className="text-gray-700 text-sm font-medium">
                  {item.tipoVenta === "decant"
                    ? `${item.mililitros} ml`
                    : `${item.cantidad} ${
                        item.cantidad > 1 ? "piezas" : "pieza"
                      }`}
                </p>
              )}

              {item.tipoVenta === "botella" && (
                <p className="text-gray-500 text-sm">
                  Contenido: {item.mlBotella} ml
                </p>
              )}

              {/* Precios */}
              {hasDiscount ? (
                <div className="mt-1">
                  <p className="text-gray-400 text-sm line-through">
                    ${formatPrecio(itemTotal)}
                  </p>
                  <p className="text-green-700 font-semibold text-base">
                    ${formatPrecio(discountedPrice)}{" "}
                    <span className="text-xs text-green-600 font-normal">
                      (
                      {discountType === "percentage"
                        ? `-${discountValue}%`
                        : `-$${formatPrecio(discountValue, 0)}`}
                      )
                    </span>
                  </p>
                </div>
              ) : (
                <p className="text-gray-900 font-semibold mt-1">
                  ${formatPrecio(itemTotal)}
                </p>
              )}

              {/* Controles: stepper + eliminar; al confirmar, la confirmación
                  ocupa toda la fila para que no se corte. En el checkout
                  (soloLectura) no se muestran. */}
              {!soloLectura && (
                <div className="flex flex-wrap items-center gap-3 mt-3">
                {confirmingDelete === itemKey ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">¿Eliminar?</span>
                    <button
                      onClick={handleRemove}
                      className="px-3 py-1.5 rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                    >
                      Sí
                    </button>
                    <button
                      onClick={() => setConfirmingDelete(null)}
                      className="px-3 py-1.5 rounded-md border hover:bg-gray-100"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center border rounded-md">
                      <button
                        onClick={() => handleDecrease(item)}
                        disabled={!canDecrease}
                        className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                        aria-label="Disminuir"
                      >
                        −
                      </button>
                      <span className="px-3 text-sm text-center min-w-[3.5rem]">
                        {item.tipoVenta === "botella"
                          ? item.cantidad
                          : `${item.mililitros} ml`}
                      </span>
                      <button
                        onClick={() => handleIncrease(item)}
                        disabled={!canIncrease}
                        className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                        aria-label="Aumentar"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => setConfirmingDelete(itemKey)}
                      title="Eliminar"
                      aria-label="Eliminar"
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ShoppingCartProduct;