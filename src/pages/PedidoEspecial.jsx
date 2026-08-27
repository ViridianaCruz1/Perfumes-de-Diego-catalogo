import CotizarPerfume from "../ui/CotizarPerfume";
import SEO from "../ui/SEO";

export default function PedidoEspecial() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <SEO
        title="Pide tu perfume bajo pedido | Perfumes de Diego"
        description="¿Buscas un perfume que no está en la tienda? Escríbelo y te lo cotizo por WhatsApp. Consigo muchas casas bajo pedido."
      />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Perfumes bajo pedido
      </h1>
      <p className="text-gray-600 mb-6">
        ¿No encontraste lo que buscabas? Puedo conseguir muchos perfumes que no
        tengo en existencia. Dime cuál (o cuáles) te interesan y te paso la
        cotización por WhatsApp.
      </p>

      <CotizarPerfume />

      <p className="text-xs text-gray-500 mt-4">
        Los perfumes bajo pedido se rigen por nuestros{" "}
        <a
          href="/terminos"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[#A47E3B]"
        >
          Términos y Condiciones
        </a>{" "}
        (anticipo, tiempos y liquidación).
      </p>
    </div>
  );
}
