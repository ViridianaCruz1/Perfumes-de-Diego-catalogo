import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { X, ShoppingBag } from "lucide-react";
import ShoppingCartProduct from "./ShoppingCartProduct";
import EnvioGratisProgress from "./EnvioGratisProgress";
import { formatPrecio } from "../functions/formatPrecio";
import { getEstadoEnvioGratis } from "../functions/envioGratis";
import { track } from "@vercel/analytics";
import { useEffect } from "react";

export default function ShoppingCart() {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    subtotal,
    totalWithDiscount,
    discountCode,
    isDiscountApplied,
    discountType,
    discountValue,
    discountTarget,
  } = useCart();

  const navigate = useNavigate();

  // ¿Los decants del carrito ya califican a envío gratis? (fuente única)
  const { califica: decantsCalifican } = getEstadoEnvioGratis({
    cartItems,
    isDiscountApplied,
    discountType,
    discountValue,
    discountTarget,
  });

  // Bloquear scroll del body al abrir el carrito, preservando la posición.
  useEffect(() => {
    if (isCartOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${scrollY}px`;
    } else {
      const topValue = document.body.style.top;
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      if (topValue) {
        window.scrollTo(0, parseInt(topValue || "0", 10) * -1);
      }
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeCart}
      ></div>

      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[400px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Pedido 🛒</h2>
          <button
            onClick={closeCart}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100%-70px)]">
          {/* Lista de productos: lo ÚNICO que se mueve con el scroll */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {cartItems.length > 0 && <EnvioGratisProgress />}
            <ShoppingCartProduct />
            {cartItems.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center text-center px-6 py-16 text-gray-500">
                <ShoppingBag className="mb-3 text-gray-300" size={56} />
                <p className="font-semibold text-gray-700 text-lg">
                  Tu carrito está vacío
                </p>
                <p className="text-sm mt-1">
                  Agrega un decant o una botella para empezar tu pedido.
                </p>
              </div>
            )}
          </div>

          {/* Totales + botón: FIJO abajo, siempre visible */}
          {cartItems.length > 0 && (
            <div className="border-t px-6 py-4 bg-white">
              <div className="flex justify-between text-gray-700 mb-2">
                <span>Subtotal:</span>
                <span>${formatPrecio(subtotal)}</span>
              </div>

              {isDiscountApplied && (
                <div className="flex justify-between items-start gap-2 text-green-700 font-medium mb-2">
                  <span className="min-w-0 break-words">
                    Descuento aplicado ({discountCode})
                  </span>
                  <span className="whitespace-nowrap shrink-0">
                    −${formatPrecio(subtotal - totalWithDiscount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-gray-900 font-semibold border-t pt-3 mb-1">
                <span>Total:</span>
                <span>${formatPrecio(totalWithDiscount)}</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                {decantsCalifican
                  ? "Tu envío es gratis (zona regular DHL)."
                  : "El envío no está incluido; se cotiza según tu código postal."}
              </p>

              <button
                type="button"
                onClick={() => {
                  track("ir_a_checkout");
                  closeCart();
                  navigate("/checkout");
                }}
                className="w-full bg-[#A47E3B] hover:bg-[#D4AF7A] active:bg-[#8B6A30] text-white py-3 rounded-md font-semibold transition-colors"
              >
                Finalizar pedido
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}