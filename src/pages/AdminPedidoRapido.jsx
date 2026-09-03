import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Minus, Trash2, Search } from "lucide-react";
import supabase from "../services/supabase";
import getParfums, { getConfigBazar } from "../functions/getParfums";
import {
  calcularPrecioDecant,
  getOpcionesMililitros,
} from "../functions/pricingDecant";
import { formatPrecio } from "../functions/formatPrecio";
import { imagenThumb } from "../functions/imagenThumb";

// Tarifa por ml redondeada hacia arriba a la próxima decena (solo decants).
const redondearArriba10 = (n) => Math.ceil((Number(n) || 0) / 10) * 10;
const precioMlR = (parfum) => redondearArriba10(Number(parfum.precio) || 0);
// Precio de un decant calculado a partir de la tarifa redondeada.
const precioDecantR = (parfum, ml) =>
  calcularPrecioDecant({ ...parfum, precio: precioMlR(parfum) }, ml);

// Una fila del catálogo con su propio control para agregar.
function FilaPerfume({ parfum, minSiempre, onAgregar }) {
  const esDecant = parfum.stock === false;
  const esBotella = parfum.stock === true;

  const opciones = esDecant
    ? getOpcionesMililitros(parfum, { minSiempre })
    : [];
  const [ml, setMl] = useState(opciones[0]?.value ?? "");
  const stockBotellas = Math.max(
    0,
    Math.floor(Number(parfum.botellasDisponibles) || 0),
  );
  const [cantidad, setCantidad] = useState(1);

  const minMl = opciones[0]?.value ?? null;
  const minTotal =
    esDecant && minMl != null ? precioDecantR(parfum, minMl) : null;

  // Subtotal en vivo según lo seleccionado, sin agregar todavía a la orden.
  const subtotalActual = esDecant
    ? ml
      ? precioDecantR(parfum, Number(ml))
      : 0
    : Number(parfum.precio) *
      Math.min(Math.max(1, Number(cantidad) || 1), stockBotellas || 1);

  const agregar = () => {
    if (esDecant) {
      if (!ml) return;
      onAgregar({
        parfumId: parfum.id,
        nombre: parfum.nombre,
        casa: parfum.casa,
        foto: parfum.image,
        tipo: "decant",
        ml: Number(ml),
        minMl: minMl || 1,
        subtotal: precioDecantR(parfum, Number(ml)),
      });
    } else if (esBotella) {
      if (stockBotellas < 1) return;
      const q = Math.min(Math.max(1, Number(cantidad) || 1), stockBotellas);
      onAgregar({
        parfumId: parfum.id,
        nombre: parfum.nombre,
        casa: parfum.casa,
        foto: parfum.image,
        tipo: "botella",
        cantidad: q,
        subtotal: Number(parfum.precio) * q,
      });
    }
  };

  return (
    <tr className="border-b border-gray-100">
      <td className="py-2 pr-2">
        {parfum.image ? (
          <img
            src={imagenThumb(parfum.image, 96)}
            alt={parfum.nombre}
            className="w-12 h-14 object-cover rounded"
          />
        ) : (
          <div className="w-12 h-14 bg-gray-100 rounded" />
        )}
      </td>
      <td className="py-2 pr-2 text-xs text-gray-500">{parfum.casa}</td>
      <td className="py-2 pr-2 text-sm font-medium text-gray-800">
        {parfum.nombre}
      </td>
      <td className="py-2 pr-2 text-sm text-gray-700 whitespace-nowrap">
        ${formatPrecio(esDecant ? precioMlR(parfum) : parfum.precio)}
        {esDecant ? "/ml" : " /pza"}
      </td>
      <td className="py-2 pr-2 text-sm text-gray-500 whitespace-nowrap">
        {esDecant && minMl ? (
          <span>
            {minMl} ml
            <span className="text-gray-400"> · ${formatPrecio(minTotal)}</span>
          </span>
        ) : (
          "—"
        )}
      </td>
      <td className="py-2">
        <div className="flex items-center gap-2">
          {esDecant ? (
            <select
              value={ml}
              onChange={(e) => setMl(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              {opciones.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              min="1"
              max={stockBotellas || 1}
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm"
            />
          )}
          <span className="text-sm font-semibold text-gray-800 whitespace-nowrap min-w-[64px]">
            = ${formatPrecio(subtotalActual)}
          </span>
          <button
            onClick={agregar}
            disabled={esBotella && stockBotellas < 1}
            className="flex items-center gap-1 bg-[#A47E3B] text-white px-3 py-1 rounded-md text-sm hover:bg-[#8b6d32] disabled:bg-gray-300"
          >
            <Plus size={14} /> Agregar
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminPedidoRapido() {
  const [parfums, setParfums] = useState([]);
  const [config, setConfig] = useState({ min_decant_siempre: 0 });
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [lineas, setLineas] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const [p, c] = await Promise.all([getParfums(), getConfigBazar()]);
      setParfums(p || []);
      setConfig(c || { min_decant_siempre: 0 });
      setCargando(false);
    })();
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    // Solo perfumes disponibles (nada de Agotado ni Próximamente).
    let base = parfums.filter((p) => p.disponible === "Disponible");

    if (q) {
      base = base.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(q) ||
          p.casa?.toLowerCase().includes(q),
      );
    }

    // Orden: casa A-Z y, dentro de cada casa, nombre A-Z (ignora may/acentos).
    const cmp = (a, b) =>
      (a || "").localeCompare(b || "", "es", { sensitivity: "base" });
    return [...base].sort(
      (a, b) => cmp(a.casa, b.casa) || cmp(a.nombre, b.nombre),
    );
  }, [parfums, busqueda]);

  const total = useMemo(
    () => lineas.reduce((s, l) => s + l.subtotal, 0),
    [lineas],
  );

  const agregar = (linea) => {
    setLineas((prev) => {
      // Si el mismo perfume (mismo tipo) ya está en el pedido, suma en su línea.
      const idx = prev.findIndex(
        (l) => l.parfumId === linea.parfumId && l.tipo === linea.tipo,
      );
      if (idx !== -1) {
        const parfum = parfumPorId(linea.parfumId);
        const copia = [...prev];
        const actual = copia[idx];
        if (linea.tipo === "decant") {
          const nuevoMl = Math.min(30, Number(actual.ml) + Number(linea.ml));
          copia[idx] = {
            ...actual,
            ml: nuevoMl,
            subtotal: parfum
              ? precioDecantR(parfum, nuevoMl)
              : actual.subtotal,
          };
        } else {
          const stock = parfum
            ? Math.max(1, Math.floor(Number(parfum.botellasDisponibles) || 1))
            : actual.cantidad + linea.cantidad;
          const nuevaCant = Math.min(
            stock,
            Number(actual.cantidad) + Number(linea.cantidad),
          );
          copia[idx] = {
            ...actual,
            cantidad: nuevaCant,
            subtotal: parfum
              ? Number(parfum.precio) * nuevaCant
              : actual.subtotal,
          };
        }
        return copia;
      }
      return [...prev, { ...linea, key: Date.now() + Math.random() }];
    });
    setMsg("");
  };

  const quitar = (key) => setLineas((prev) => prev.filter((l) => l.key !== key));

  const parfumPorId = (id) => parfums.find((p) => p.id === id);

  // Ajusta los ml de un decant ya agregado (±1, o ±0.5 en Ensar Oud).
  const cambiarMl = (key, dir) => {
    setLineas((prev) =>
      prev.map((l) => {
        if (l.key !== key || l.tipo !== "decant") return l;
        const parfum = parfumPorId(l.parfumId);
        if (!parfum) return l;
        const paso = parfum.casa === "Ensar Oud" ? 0.5 : 1;
        const min = l.minMl || paso;
        const max = 30;
        let nuevo = Math.round((Number(l.ml) + dir * paso) * 10) / 10;
        nuevo = Math.max(min, Math.min(max, nuevo));
        return { ...l, ml: nuevo, subtotal: precioDecantR(parfum, nuevo) };
      }),
    );
  };

  // Ajusta la cantidad de piezas de una botella ya agregada (±1, tope por stock).
  const cambiarCantidad = (key, dir) => {
    setLineas((prev) =>
      prev.map((l) => {
        if (l.key !== key || l.tipo !== "botella") return l;
        const parfum = parfumPorId(l.parfumId);
        if (!parfum) return l;
        const stock = Math.max(
          1,
          Math.floor(Number(parfum.botellasDisponibles) || 1),
        );
        let nueva = Math.max(1, Math.min(stock, (Number(l.cantidad) || 1) + dir));
        return { ...l, cantidad: nueva, subtotal: Number(parfum.precio) * nueva };
      }),
    );
  };

  const detalleLinea = (l) =>
    l.tipo === "decant"
      ? `${l.ml} ml`
      : `${l.cantidad} pza${l.cantidad > 1 ? "s" : ""}`;

  const nuevoPedido = () => {
    setLineas([]);
    setMsg("");
  };

  const guardarPedido = async () => {
    if (lineas.length === 0) return;
    setGuardando(true);
    setMsg("");
    const { error } = await supabase.from("pedidos_bazar").insert({
      items: lineas.map(({ key, ...l }) => ({ ...l, detalle: detalleLinea(l) })),
      total,
      bazar_activo: false,
      recargo: 0,
    });
    setGuardando(false);
    if (error) {
      setMsg("No se pudo guardar el pedido. Revisa permisos (RLS) o conexión.");
    } else {
      setMsg("Pedido guardado ✓");
      setLineas([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2 hover:text-gray-300">
            <ArrowLeft size={20} /> Volver al panel
          </Link>
          <h1 className="text-lg font-bold">Pedido rápido</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Catálogo */}
          <div className="lg:col-span-2">
            <div className="relative mb-3">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o casa…"
                className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-[#A47E3B] focus:outline-none"
              />
            </div>

            {cargando ? (
              <p className="text-gray-500 text-sm">Cargando catálogo…</p>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[11px] uppercase text-gray-400 border-b border-gray-100">
                      <th className="py-2 pr-2 pl-3">Foto</th>
                      <th className="py-2 pr-2">Casa</th>
                      <th className="py-2 pr-2">Nombre</th>
                      <th className="py-2 pr-2">Precio</th>
                      <th className="py-2 pr-2">Mín.</th>
                      <th className="py-2">Agregar</th>
                    </tr>
                  </thead>
                  <tbody className="pl-3">
                    {filtrados.map((p) => (
                      <FilaPerfume
                        key={p.id}
                        parfum={p}
                        minSiempre={Number(config.min_decant_siempre) || 0}
                        onAgregar={agregar}
                      />
                    ))}
                  </tbody>
                </table>
                {filtrados.length === 0 && (
                  <p className="text-gray-400 text-sm p-4">Sin resultados.</p>
                )}
              </div>
            )}
          </div>

          {/* Pedido actual */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow sticky top-4 flex flex-col max-h-[calc(100vh-2rem)]">
              {/* Encabezado */}
              <div className="flex items-center justify-between p-4 pb-2 shrink-0">
                <h2 className="font-bold text-gray-900">Pedido actual</h2>
                <button
                  onClick={nuevoPedido}
                  className="text-xs text-gray-500 hover:text-red-600"
                >
                  Nuevo pedido
                </button>
              </div>

              {/* Lista (lo único que scrollea) */}
              <div className="flex-1 min-h-0 overflow-y-auto px-4">
                {lineas.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">
                    Agrega productos desde la lista.
                  </p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {lineas.map((l) => (
                      <li key={l.key} className="py-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {l.nombre}
                            </p>
                            <p className="text-xs text-gray-500">{l.casa}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-sm font-semibold">
                              ${formatPrecio(l.subtotal)}
                            </span>
                            <button
                              onClick={() => quitar(l.key)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Ajuste de ml / cantidad */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            onClick={() =>
                              l.tipo === "decant"
                                ? cambiarMl(l.key, -1)
                                : cambiarCantidad(l.key, -1)
                            }
                            className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="text-xs text-gray-700 w-16 text-center">
                            {detalleLinea(l)}
                          </span>
                          <button
                            onClick={() =>
                              l.tipo === "decant"
                                ? cambiarMl(l.key, 1)
                                : cambiarCantidad(l.key, 1)
                            }
                            className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Total + guardar (fijo abajo) */}
              <div className="p-4 pt-3 border-t shrink-0">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${formatPrecio(total)}
                  </span>
                </div>
                <button
                  onClick={guardarPedido}
                  disabled={lineas.length === 0 || guardando}
                  className="w-full bg-[#A47E3B] text-white py-2 rounded-md font-semibold hover:bg-[#8b6d32] disabled:bg-gray-300"
                >
                  {guardando ? "Guardando…" : "Guardar pedido"}
                </button>
                {msg && (
                  <p className="text-xs text-center text-gray-600 mt-2">{msg}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}