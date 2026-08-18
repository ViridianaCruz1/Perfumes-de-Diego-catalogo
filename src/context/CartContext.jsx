import { createContext, useContext, useState, useEffect, useRef } from "react";
import supabase from "../services/supabase";
import { useToast } from "./ToastContext";
import { track } from "@vercel/analytics";
import { getCupon } from "../functions/cuponBienvenida";
import { getConfigBazar } from "../functions/getParfums";
import {
  calcularPrecioDecantCarrito,
  getIncrementoMililitros,
  getMililitrosMinimos,
} from "../functions/pricingDecant";

const CartContext = createContext();
const CART_STORAGE_KEY = "perfumes-diego-cart";
const CART_EXPIRY_DAYS = 10;
const CART_EXPIRY_MS = CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);

      // Formato viejo (sin timestamp): se descarta para que se rehidrate con el nuevo formato.
      if (!parsed.savedAt || !Array.isArray(parsed.items)) {
        localStorage.removeItem(CART_STORAGE_KEY);
        return [];
      }

      // Verificar si el carrito caducó
      const ageMs = Date.now() - parsed.savedAt;
      if (ageMs > CART_EXPIRY_MS) {
        localStorage.removeItem(CART_STORAGE_KEY);
        return [];
      }

      return parsed.items;
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const { showToast } = useToast();

  // 🔄 Al cargar, refrescar precio/stock de los items guardados (el carrito
  // puede tener hasta 10 días). Si un producto ya no existe o se agotó, lo
  // quitamos. Si la red falla, NO tocamos el carrito (mejor un precio viejo
  // que vaciarlo sin querer). Corre una sola vez, con el carrito recién
  // hidratado desde localStorage.
  useEffect(() => {
    let cancelado = false;

    async function revalidar() {
      const ids = cartItems.map((i) => i.id);
      if (ids.length === 0) return;

      const { data, error } = await supabase
        .from("parfums")
        .select("id, precio, botellasDisponibles, disponible")
        .in("id", ids);

      if (error || !data || cancelado) return;

      const frescosPorId = new Map(data.map((p) => [p.id, p]));
      let huboCambios = false;
      let huboEliminados = false;
      const actualizados = [];

      for (const item of cartItems) {
        const fresco = frescosPorId.get(item.id);

        // Producto borrado o ya no disponible → fuera.
        if (!fresco || fresco.disponible !== "Disponible") {
          huboEliminados = true;
          huboCambios = true;
          continue;
        }

        const nuevo = { ...item };

        if (Number(fresco.precio) !== Number(item.precioUnitario)) {
          nuevo.precioUnitario = fresco.precio;
          huboCambios = true;
        }

        // Botella: refrescar stock y recortar cantidad si bajó.
        if (item.tipoVenta === "botella") {
          const stock = Number(fresco.botellasDisponibles) || 0;
          if (stock < 1) {
            huboEliminados = true;
            huboCambios = true;
            continue;
          }
          if (stock !== item.stockDisponible) {
            nuevo.stockDisponible = stock;
            huboCambios = true;
          }
          if (Number(item.cantidad) > stock) {
            nuevo.cantidad = stock;
            huboCambios = true;
          }
        }

        actualizados.push(nuevo);
      }

      if (huboCambios && !cancelado) {
        setCartItems(actualizados);
        showToast(
          huboEliminados
            ? "Quitamos productos de tu carrito que ya no están disponibles."
            : "Actualizamos tu carrito con precios y stock al día.",
          "info",
        );
      }
    }

    revalidar();

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      // Guardar con timestamp para poder verificar caducidad
      const payload = {
        items: cartItems,
        savedAt: Date.now(),
      };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error("Error guardando carrito:", err);
    }
  }, [cartItems]);

  // 💰 Estados del descuento
  const [discountCode, setDiscountCode] = useState("");
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState(null);
  const [discountTarget, setDiscountTarget] = useState("ALL");
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 🛍️ Códigos: ahora viven en Supabase (tabla codigos_descuento) y se
  // validan server-side con la función validar_cupon. Ya no hay nada hardcodeado.


  // 🛒 Añadir producto (decant o botella)
  const addToCart = (product) => {
    // Tope de stock para botellas: avisar en vez de no hacer nada.
    if (product.tipoVenta === "botella") {
      const existente = cartItems.find(
        (i) => i.id === product.id && i.tipoVenta === "botella",
      );
      if (existente && existente.cantidad + 1 > existente.stockDisponible) {
        showToast(
          `Solo quedan ${existente.stockDisponible} de ${
            existente.nombre || "este producto"
          }.`,
          "info",
        );
        return;
      }
    }

    track("agregar_al_carrito", {
      producto: product?.nombre || "",
      tipo: product?.tipoVenta || "",
    });

    setCartItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.id === product.id &&
          item.tipoVenta === product.tipoVenta,
      );

      if (existing) {
        return prev.map((item) => {
          if (
            item.id === product.id &&
            item.tipoVenta === product.tipoVenta
          ) {
            if (item.tipoVenta === "botella") {
              if (item.cantidad + 1 > item.stockDisponible) return item;
              return {
                ...item,
                cantidad: item.cantidad + 1,
              };
            } else {
              const nuevosMl = item.mililitros + product.mililitros;
              return {
                ...item,
                mililitros: nuevosMl,
              };
            }
          }
          return item;
        });
      }

      return [...prev, { ...product }];
    });
  };

  // ✏️ Actualizar cantidad
  const updateCartItem = (id, tipoVenta, newValue) => {
    if (tipoVenta === "botella") {
      const item = cartItems.find(
        (i) => i.id === id && i.tipoVenta === "botella",
      );
      if (item && newValue > item.stockDisponible) {
        showToast(`Solo hay ${item.stockDisponible} disponibles.`, "info");
        return;
      }
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id && item.tipoVenta === tipoVenta) {
          if (tipoVenta === "botella") {
            if (newValue > item.stockDisponible) return item;
            return { ...item, cantidad: newValue };
          }

          if (tipoVenta === "decant") {
            return { ...item, mililitros: newValue };
          }
        }
        return item;
      }),
    );
  };

  // 🗑️ Eliminar producto
  const removeFromCart = (id, tipoVenta) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === id && item.tipoVenta === tipoVenta)),
    );
  };

  // ⚙️ Carrito
  const openCart = () => {
    track("abrir_carrito");
    setIsCartOpen(true);
  };
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  // 🧮 Subtotal
  const subtotal = cartItems.reduce((acc, item) => {
    if (item.tipoVenta === "botella") {
      return acc + (item.precioUnitario || 0) * (item.cantidad || 0);
    }
    if (item.tipoVenta === "decant") {
      return acc + calcularPrecioDecantCarrito(item);
    }
    return acc;
  }, 0);

  // 🎟️ Aplicar descuento — valida server-side con la función validar_cupon.
  // (NO aplica a paquetes; ya tienen su propio ahorro)
  const applyDiscountCode = async (code, silent = false) => {
    const upperCode = code.trim().toUpperCase();
    // En modo silencioso (auto-aplicado del cupón guardado) no mostramos
    // errores al usuario: es un intento en segundo plano.
    const fail = (msg) => {
      if (!silent) setErrorMessage(msg);
    };

    // Durante el modo bazar los cupones no aplican.
    const cfgBazar = await getConfigBazar();
    if (cfgBazar?.activo) {
      fail("Los cupones no aplican durante el evento.");
      return;
    }

    // 1) Validar contra Supabase. La lista de códigos nunca sale al navegador.
    const { data, error } = await supabase.rpc("validar_cupon", {
      p_codigo: upperCode,
    });

    if (error) {
      console.error("Error validando cupón:", error);
      fail("Hubo un problema al validar el código. Intenta de nuevo.");
      return;
    }

    const resultado = data?.[0];

    // 2) Si no es válido, mostramos el motivo y MANTENEMOS el descuento previo si lo había.
    if (!resultado || !resultado.valido) {
      fail(resultado?.mensaje || `El código "${upperCode}" no es válido.`);
      return;
    }

    const target = resultado.aplica_a;

    // 3) Verificar que el código aplique a algo en el carrito actual.
    const applicableItems = cartItems.filter((item) => {
      if (target === "ALL") return true;
      if (target === "DECANT") return item.tipoVenta === "decant";
      if (target === "BOTELLA") return item.tipoVenta === "botella";
      if (target === "BOTELLA_SELLADA")
        return (
          item.tipoVenta === "botella" &&
          item.estado_botella?.startsWith("Sellado")
        );
      return item.tipoVenta === "decant" && item.casa === target;
    });

    if (applicableItems.length === 0) {
      fail(`El código ${upperCode} no aplica a los productos de tu carrito.`);
      return;
    }

    // 4) Válido: aplica el descuento y limpia el error.
    setDiscountCode(upperCode);
    setDiscountType(resultado.tipo);
    setDiscountValue(Number(resultado.valor));
    setDiscountTarget(target);
    setIsDiscountApplied(true);
    setErrorMessage("");
  };

  // 🧾 Calcular total con descuento
  const calculateDiscount = () => {
    if (!isDiscountApplied) return subtotal;

    let discountableTotal = 0;

    cartItems.forEach((item) => {
      let applies = false;
      if (discountTarget === "ALL") applies = true;
      else if (discountTarget === "DECANT") applies = item.tipoVenta === "decant";
      else if (discountTarget === "BOTELLA") applies = item.tipoVenta === "botella";
      else if (discountTarget === "BOTELLA_SELLADA")
        applies = item.tipoVenta === "botella" && item.estado_botella?.startsWith("Sellado");

      if (!applies) return;

      if (item.tipoVenta === "decant") {
        discountableTotal += calcularPrecioDecantCarrito(item);
      } else if (item.tipoVenta === "botella") {
        discountableTotal += (item.precioUnitario || 0) * (item.cantidad || 0);
      }
    });

    let totalAfterDiscount = subtotal;

    if (discountType === "percentage") {
      totalAfterDiscount -= (discountableTotal * discountValue) / 100;
    } else if (discountType === "amount") {
      totalAfterDiscount -= Math.min(discountValue, discountableTotal);
    }

    return Math.max(0, totalAfterDiscount);
  };

  const totalWithDiscount = calculateDiscount();

  // Vacía el carrito por completo: items, descuento y lo guardado en el
  // navegador. Se usa al enviar el pedido por WhatsApp.
  const vaciarCarrito = () => {
    setCartItems([]);
    setDiscountCode("");
    setDiscountType(null);
    setDiscountValue(0);
    setDiscountTarget("ALL");
    setIsDiscountApplied(false);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  };

  // Auto-aplica el cupón guardado (del link del correo) en cuanto hay decants
  // en el carrito. Cada código se intenta una sola vez.
  const cuponesIntentados = useRef(new Set());
  useEffect(() => {
    if (isDiscountApplied) return;
    const codigo = getCupon();
    if (!codigo || cuponesIntentados.current.has(codigo)) return;
    if (!cartItems.some((i) => i.tipoVenta === "decant")) return;
    cuponesIntentados.current.add(codigo);
    applyDiscountCode(codigo, true);
  }, [cartItems, isDiscountApplied]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItem,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        subtotal,
        totalWithDiscount,
        discountCode,
        discountType,
        discountValue,
        discountTarget,
        isDiscountApplied,
        applyDiscountCode,
        vaciarCarrito,
        errorMessage,
        setErrorMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}