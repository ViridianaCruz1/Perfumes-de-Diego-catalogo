import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useParfums } from "../context/ParfumsContext";
import ShoppingCartProduct from "../ui/ShoppingCartProduct";
import EnvioGratisProgress from "../ui/EnvioGratisProgress";
import Checkout from "../ui/Checkout";
import { formatPrecio } from "../functions/formatPrecio";
import { getEstadoEnvioGratis } from "../functions/envioGratis";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    subtotal,
    totalWithDiscount,
    discountCode,
    applyDiscountCode,
    isDiscountApplied,
    discountType,
    discountValue,
    discountTarget,
    errorMessage,
    setErrorMessage,
    closeCart,
  } = useCart();

  const [postalCode, setPostalCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [resumenAbierto, setResumenAbierto] = useState(false); // solo movil

  // Cierra el panel del carrito si venía abierto.
  useEffect(() => {
    closeCart?.();
    setErrorMessage?.("");
    // Sube al tope siempre — incluso después de que el carrito restaure su
    // posición al cerrarse (por eso reintentamos en los siguientes frames).
    const irArriba = () => window.scrollTo(0, 0);
    irArriba();
    const raf = requestAnimationFrame(() => {
      irArriba();
      requestAnimationFrame(irArriba);
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si el carrito queda vacío, regresa al catálogo.
  useEffect(() => {
    if (cartItems.length === 0) navigate("/home", { replace: true });
  }, [cartItems.length, navigate]);

  // ¿Los decants ya califican a envío gratis? (fuente única)
  const { bazarActivo } = useParfums();
  const { califica: decantsCalifican } = getEstadoEnvioGratis({
    cartItems,
    isDiscountApplied,
    discountType,
    discountValue,
    discountTarget,
    bazarActivo,
  });

  const handleApplyCode = async () => {
    if (!inputCode.trim() || applying) return;
    setApplying(true);
    try {
      await applyDiscountCode(inputCode);
    } finally {
      setApplying(false);
    }
    setInputCode("");
  };

  const handleInputChange = (e) => {
    setInputCode(e.target.value);
    if (errorMessage) setErrorMessage("");
  };

  const handlePostalCodeChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,5}$/.test(value)) setPostalCode(value);
  };

  const isPostalCodeValid = postalCode.length === 5;

  if (cartItems.length === 0) return null; // el efecto redirige al catálogo

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        type="button"
        onClick={() => navigate("/home")}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4"
      >
        <ArrowLeft size={16} />
        Seguir comprando
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Finaliza tu pedido
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Resumen del pedido */}
        <div>
          {/* Barra colapsable - SOLO movil */}
          <button
            type="button"
            onClick={() => setResumenAbierto((v) => !v)}
            className="md:hidden w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 mb-3 bg-white"
          >
            <span className="text-sm font-semibold text-gray-800">
              Resumen del pedido ({cartItems.length}{" "}
              {cartItems.length === 1 ? "producto" : "productos"})
            </span>
            <span className="flex items-center gap-2 text-gray-900 font-bold">
              ${formatPrecio(totalWithDiscount)}
              <ChevronDown
                size={18}
                className={`text-gray-500 transition-transform ${
                  resumenAbierto ? "rotate-180" : ""
                }`}
              />
            </span>
          </button>

          {/* Titulo - SOLO escritorio */}
          <h2 className="hidden md:block font-semibold text-gray-900 mb-3">
            Tu pedido
          </h2>

          {/* Lista: colapsable en movil, siempre visible en escritorio.
              Solo lectura (sin controles de +/- ni borrar). */}
          <div
            className={`${
              resumenAbierto ? "block" : "hidden"
            } md:block border border-gray-200 rounded-xl overflow-hidden`}
          >
            <ShoppingCartProduct soloLectura />
          </div>
        </div>

        {/* Datos, total y envío */}
        <div className="flex flex-col gap-5">
          {/* Envío gratis */}
          <EnvioGratisProgress />

          {/* Código postal (opcional) */}
          <div>
            <label
              htmlFor="cp"
              className="text-sm font-medium text-gray-700"
            >
              Tu código postal (opcional)
            </label>
            <p className="text-xs text-gray-500 mt-1 mb-1">
              Si lo pones, te cotizo el envío de una vez. Si no, lo vemos por
              WhatsApp.
            </p>
            <input
              id="cp"
              type="text"
              value={postalCode}
              onChange={handlePostalCodeChange}
              placeholder="Ej. 72000"
              inputMode="numeric"
              maxLength={5}
              className="w-full border border-gray-300 rounded-md px-3 py-3 text-base bg-white text-gray-800 focus:ring-2 focus:ring-[#A47E3B] focus:outline-none"
            />
            {postalCode.length > 0 && !isPostalCodeValid && (
              <p className="text-xs text-gray-500 mt-1">
                El código postal tiene 5 dígitos.
              </p>
            )}
          </div>

          {/* Código de descuento (oculto durante el modo bazar) */}
          {!bazarActivo && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                Código de descuento
              </label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  value={inputCode}
                  onChange={handleInputChange}
                  placeholder="Código de descuento"
                  autoCapitalize="characters"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#A47E3B] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCode}
                  disabled={applying}
                  className="bg-[#A47E3B] text-white px-4 py-2 rounded-md text-sm hover:bg-[#8b6d32] disabled:opacity-50 whitespace-nowrap"
                >
                  {applying ? "Validando..." : "Aplicar"}
                </button>
              </div>
              {errorMessage && (
                <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
              )}
            </div>
          )}

          {/* Totales */}
          <div className="border-t pt-4">
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

            <div className="flex justify-between text-gray-900 font-bold text-lg border-t pt-3">
              <span>Total:</span>
              <span>${formatPrecio(totalWithDiscount)}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {decantsCalifican
                ? "Tu envío es gratis (zona regular DHL)."
                : "El envío no está incluido; se cotiza según tu código postal."}
            </p>
          </div>

          {/* Enviar por WhatsApp */}
          <Checkout
            totalCartPrice={totalWithDiscount}
            postalCode={postalCode}
          />

          <p className="text-xs text-gray-500 text-center mt-3">
            Al realizar tu pedido, aceptas nuestros{" "}
            <a
              href="/terminos"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#A47E3B]"
            >
              Términos y Condiciones
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}