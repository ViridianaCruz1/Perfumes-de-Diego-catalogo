import ProductCard from "./ProductCard";
import CotizarPerfume from "./CotizarPerfume";
import { useEffect, useState, useRef, useMemo } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { useOrder } from "../context/OrderContext.jsx";
import { useParfums } from "../context/ParfumsContext.jsx";
import Pagination from "./Paginacion.jsx";
import { useNavigate, useSearchParams } from "react-router-dom";

// 🔒 Helper global para blindar strings
const safeString = (value) => (value ?? "").toString();

const DIAS_NUEVO = 7;
const esReciente = (p) => {
  if (!p.disponible_desde) return false;
  const dias = (new Date() - new Date(p.disponible_desde)) / (1000 * 60 * 60 * 24);
  return dias <= DIAS_NUEVO;
};

export default function ProductGrid({
  selectedCasa,
  selectedOcasion,
  selectedCategoria,
  onSelectLimpiar,
  searchResult,
  stockFilter,
  recientesFilter,
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { parfums: allParfums, loading, error } = useParfums();
  const { order } = useOrder();

  // Paginación leída desde la URL para que sobreviva navegaciones POP
  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const itemsPerPage = 36;
  const gridRef = useRef(null);

  // Cambio de página: actualiza URL con `replace` para no llenar el historial
  const setCurrentPage = (pageNumber) => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        if (pageNumber <= 1) {
          newParams.delete("page");
        } else {
          newParams.set("page", String(pageNumber));
        }
        return newParams;
      },
      { replace: true }
    );
  };

  // Cuando el usuario cambia el orden, volver a página 1.
  // Robusto contra StrictMode: comparamos contra el valor previo del orden.
  const prevOrderRef = useRef(order);
  useEffect(() => {
    if (prevOrderRef.current !== order) {
      prevOrderRef.current = order;
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const filteredParfums = useMemo(() => {
    if (!allParfums || allParfums.length === 0) return [];

    // ===== BUSQUEDA DIRECTA =====
    if (searchResult && searchResult.nombre) {
      let result = allParfums.filter(
        (p) =>
          safeString(p.nombre).toLowerCase() ===
          safeString(searchResult.nombre).toLowerCase(),
      );

      if (stockFilter !== null) {
        result = result.filter((p) => p.stock === stockFilter);
      }

      return result;
    }

    // ===== BUSQUEDA PARCIAL =====
    if (searchResult && searchResult.query) {
      const lowerQuery = searchResult.query.toLowerCase();

      let result = allParfums.filter(
        (p) =>
          safeString(p.nombre).toLowerCase().includes(lowerQuery) ||
          safeString(p.casa).toLowerCase().includes(lowerQuery),
      );

      if (stockFilter !== null) {
        result = result.filter((p) => p.stock === stockFilter);
      }

      // 🔒 Sort blindado: casa A-Z, precio menor a mayor, nombre A-Z como desempate
      result = result.sort((a, b) => {
        const casaA = safeString(a.casa);
        const casaB = safeString(b.casa);

        const casaComparison = casaA.localeCompare(casaB);
        if (casaComparison !== 0) return casaComparison;

        const precioA = Number(a.precio) || 0;
        const precioB = Number(b.precio) || 0;
        if (precioA !== precioB) return precioA - precioB;

        return safeString(a.nombre).localeCompare(safeString(b.nombre));
      });

      return result;
    }

    // ===== RECIÉN LLEGADOS =====
    if (recientesFilter) {
      const result = allParfums
        .filter((p) => p.disponible === "Disponible" && esReciente(p))
        .sort((a, b) => {
          const casaCmp = safeString(a.casa).localeCompare(safeString(b.casa));
          if (casaCmp !== 0) return casaCmp;
          return (Number(a.precio) || 0) - (Number(b.precio) || 0);
        });
      return result;
    }

    // ===== FILTROS NORMALES =====
    let result = allParfums.filter((p) => {
      const casaMatch =
        !selectedCasa ||
        safeString(p.casa).toLowerCase() === selectedCasa.toLowerCase();

      const ocasionMatch =
        !selectedOcasion ||
        safeString(p.disponible).toLowerCase() ===
          selectedOcasion.toLowerCase();

      const categoriaMatch =
        !selectedCategoria ||
        safeString(p.categoria).toLowerCase() ===
          selectedCategoria.toLowerCase();

      const stockMatch = stockFilter === null ? true : p.stock === stockFilter;

      return casaMatch && ocasionMatch && categoriaMatch && stockMatch;
    });

    // 🔒 Ordenamiento completamente blindado
    result = result.sort((a, b) => {
      const nombreA = safeString(a.nombre);
      const nombreB = safeString(b.nombre);
      const casaA = safeString(a.casa);
      const casaB = safeString(b.casa);

      if (order === "nombre") {
        return nombreA.localeCompare(nombreB);
      }

      if (order === "casa") {
        const casaComparison = casaA.localeCompare(casaB);
        if (casaComparison !== 0) return casaComparison;
        const precioComparison = (a.precio ?? 0) - (b.precio ?? 0);
        if (precioComparison !== 0) return precioComparison;
        return nombreA.localeCompare(nombreB);
      }

      if (order === "precio") {
        const precioComparison = (a.precio ?? 0) - (b.precio ?? 0);
        if (precioComparison !== 0) return precioComparison;
        return nombreA.localeCompare(nombreB);
      }
      if (order === "precioMayor") {
        const precioComparison = (b.precio ?? 0) - (a.precio ?? 0);
        if (precioComparison !== 0) return precioComparison;
        return nombreA.localeCompare(nombreB);
      }

      return 0;
    });

    return result;
  }, [
    allParfums,
    selectedCasa,
    selectedOcasion,
    selectedCategoria,
    order,
    searchResult,
    stockFilter,
    recientesFilter,
  ]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  const totalPages = Math.max(
    1,
    Math.ceil(filteredParfums.length / itemsPerPage),
  );
  const safePage = Math.min(currentPage, totalPages);
  const indexOfLastItem = safePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentParfums = filteredParfums.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  return (
    <section className="bg-gray-100 py-12">
      <div className="max-w-12xl mx-auto sm:mx-8 lg:mx-12 px-6">
        <div className="mb-4 text-right space-x-3">
          {(selectedCasa ||
            selectedOcasion ||
            selectedCategoria ||
            stockFilter !== null) && (
            <button
              onClick={onSelectLimpiar}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {filteredParfums.length === 0 ? (
          <div className="max-w-2xl mx-auto mt-8">
            <p className="text-center text-gray-500 mb-6">
              {searchResult
                ? `No encontramos resultados para "${
                    searchResult.nombre || searchResult.query
                  }". Revisa la ortografía o intenta con otro término.`
                : "No hay perfumes que coincidan con los filtros seleccionados."}
            </p>
            <CotizarPerfume
              sugerencia={
                searchResult ? searchResult.nombre || searchResult.query : ""
              }
            />
          </div>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-8"
          >
            {currentParfums.map((parfum) => (
              <ProductCard key={parfum.id} parfum={parfum} />
            ))}
          </div>
        )}

        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          maxPageButtons={5}
          scrollRef={gridRef}
        />
      </div>
    </section>
  );
}