import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function Terminos() {
  return (
    <>
      <Helmet>
        <title>Términos y condiciones — Perfumes de Diego</title>
        <meta
          name="description"
          content="Términos y condiciones de uso y compra en Perfumes de Diego: proceso de pedido, precios, pagos, envíos a todo México y devoluciones."
        />
        <link rel="canonical" href="https://perfumesdediego.com/terminos" />
      </Helmet>

      <main className="max-w-2xl mx-auto px-5 py-12 md:py-16 text-gray-800">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Términos y condiciones
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          Última actualización: junio de 2026
        </p>

        <section className="space-y-4 text-[15px] leading-relaxed">
          <p>
            Estos términos y condiciones regulan el uso del sitio
            perfumesdediego.com y la compra de productos a través de Perfumes de
            Diego. Al realizar cualquier pedido, ya sea a través del sitio o por
            WhatsApp, aceptas estos términos en su totalidad, los hayas leído o
            no, por encontrarse publicados en este sitio. Si no estás de acuerdo,
            te pedimos no realizar ningún pedido.
          </p>
          <p>
            Esta aceptación aplica a todo pedido, sin importar cuándo utilizaste
            el sitio por primera vez. Si realizaste un pedido en el pasado y más
            adelante acuerdas uno nuevo por WhatsApp o cualquier otro medio, ese
            pedido posterior también queda sujeto a estos términos, incluidos los
            relativos a los perfumes bajo pedido.
          </p>
        </section>

        <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">
          1. Qué es Perfumes de Diego
        </h2>
        <section className="space-y-4 text-[15px] leading-relaxed">
          <p>
            Perfumes de Diego es una tienda en línea dedicada a la venta de
            perfumería de nicho, ofrecida en dos formatos: decants (porciones
            decantadas en mililitros para probar) y botellas completas o
            parciales. La selección se basa en criterio personal y experiencia,
            no en patrocinios de las casas perfumeras.
          </p>
        </section>

        <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">
          2. Autenticidad de los productos
        </h2>
        <section className="space-y-4 text-[15px] leading-relaxed">
          <p>
            Todos los productos que vendemos son originales. Los decants se
            preparan a partir de botellas originales, decantadas de forma
            higiénica en envases nuevos. Un decant no incluye el empaque, la caja
            ni el frasco original de la marca, salvo que se indique lo contrario
            en la descripción del producto.
          </p>
        </section>

        <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">
          3. Proceso de compra
        </h2>
        <section className="space-y-4 text-[15px] leading-relaxed">
          <p>
            El catálogo del sitio permite armar tu pedido y enviarlo por
            WhatsApp, donde se confirman la disponibilidad, el total, el costo de
            envío y la forma de pago antes de concretar la compra. Un pedido se
            considera confirmado únicamente cuando así se acuerda por ese medio.
            Nos reservamos el derecho de cancelar un pedido si un producto deja de
            estar disponible o si detectamos un error evidente en la información.
          </p>
        </section>

        <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">
          4. Precios y disponibilidad
        </h2>
        <section className="space-y-4 text-[15px] leading-relaxed">
          <p>
            Los precios están expresados en pesos mexicanos (MXN) y pueden
            cambiar sin previo aviso. La disponibilidad de los productos es
            limitada y puede variar; el inventario mostrado en el sitio es
            orientativo y se confirma al momento de procesar tu pedido por
            WhatsApp.
          </p>
        </section>

        <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">
          5. Formas de pago
        </h2>
        <section className="space-y-4 text-[15px] leading-relaxed">
          <p>Aceptamos las siguientes formas de pago:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Transferencia interbancaria (SPEI).</li>
            <li>Depósito en efectivo.</li>
            <li>
              Tarjeta de crédito o débito a través de la plataforma Mercado
              Pago. Este método genera una comisión adicional que será absorbida
              por el comprador y se sumará al total de su pedido.
            </li>
          </ul>
          <p>El pedido se procesa una vez confirmado el pago correspondiente.</p>
        </section>

        <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">
          6. Envíos
        </h2>
        <section className="space-y-4 text-[15px] leading-relaxed">
          <p>
            Realizamos envíos a todo México mediante DHL Express (nuestra
            paquetería preferida) o FedEx cuando sea necesario.
          </p>
          <p>
            Los precios de los productos no incluyen el costo de envío. Dicho
            costo se calcula según tu código postal y se te informa antes de
            confirmar el pedido. El envío es gratuito únicamente en pedidos de
            decants iguales o mayores a $1,950 MXN.
          </p>
          <p>
            Los decants de 30 ml de Louis Vuitton se venden con precio especial,
            por lo que no suman para alcanzar el monto mínimo de envío gratis.
          </p>
          <p>
            Entregamos tu pedido a la paquetería en un plazo máximo de 48 horas
            hábiles a partir de la confirmación del pago. En la mayoría de los
            casos lo entregamos a la paquetería el mismo día en que se realiza el
            pago, y normalmente los clientes lo reciben al día siguiente. Los
            tiempos de entrega finales dependen de la paquetería y están fuera de
            nuestro control.
          </p>
        </section>

        <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">
          7. Cambios y devoluciones
        </h2>
        <section className="space-y-4 text-[15px] leading-relaxed">
          <p>
            Por la naturaleza de los productos, no aceptamos devoluciones ni
            reembolsos.
          </p>
          <p>
            La única excepción es cuando un producto llegue roto, siempre y
            cuando el comprador cuente con un video del desempaquetado que
            cumpla, sin excepción, con todas las siguientes condiciones:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Mostrar el paquete con la caja completamente sellada antes de
              abrirlo.
            </li>
            <li>Grabar la apertura completa, de forma continua y a detalle.</li>
            <li>No contener cortes, ediciones ni interrupciones.</li>
            <li>
              No perder de vista el paquete ni el producto en ningún momento.
            </li>
          </ul>
          <p>
            Sin un video que cumpla con todos estos requisitos, no procede
            ninguna devolución, reembolso ni compensación.
          </p>
          <p>
            Los derrames menores de producto durante el transporte (una
            situación común en el envío de perfumería) no se consideran un daño
            imputable a Perfumes de Diego y no dan lugar a devolución, reembolso
            ni compensación.
          </p>
          <p>
            Para cualquier otro caso no contemplado en esta sección, no se
            otorgan reembolsos ni compensaciones.
          </p>
        </section>

        <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">
          8. Perfumes bajo pedido
        </h2>
        <section className="space-y-4 text-[15px] leading-relaxed">
          <p>
            Algunos perfumes se ofrecen bajo pedido: no están en existencia y se
            consiguen especialmente para ti tras tu solicitud. Al encargar un
            perfume bajo pedido, aceptas las siguientes condiciones:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Anticipo.</strong> Para iniciar tu pedido se requiere un
              anticipo mínimo del 50% del valor del perfume. Dependiendo del
              perfume, el anticipo puede ser mayor; se te informará el monto
              antes de encargarlo.
            </li>
            <li>
              <strong>Anticipo no reembolsable.</strong> Una vez que tu perfume
              ha sido encargado con el proveedor, el anticipo no es reembolsable,
              ya que corresponde a una compra realizada específicamente para ti.
            </li>
            <li>
              <strong>Precio en firme.</strong> El precio de tu perfume queda
              congelado al momento de dar el anticipo y no se ve afectado por
              cambios posteriores de costo, disponibilidad o tipo de cambio.
            </li>
            <li>
              <strong>Tiempo estimado y margen.</strong> Se te dará un tiempo
              estimado de llegada, sujeto a un margen de hasta 2 semanas
              adicionales. Por ejemplo, si el estimado es de 2 semanas, el plazo
              puede extenderse hasta 4 semanas antes de que apliquen opciones de
              cancelación o reembolso. Dentro de este margen no hay compensación
              adicional por la espera.
            </li>
            <li>
              <strong>Si no se consigue el perfume.</strong> Si por causas
              ajenas (el proveedor no lo surte, se descontinúa, etc.) no logramos
              conseguir tu perfume, se te reembolsará el anticipo de forma
              íntegra.
            </li>
            <li>
              <strong>Aviso de llegada y liquidación.</strong> Cuando tu perfume
              esté listo, te avisaremos por WhatsApp. A partir del momento en que
              enviamos ese aviso, cuentas con 5 días naturales para liquidar el
              total de tu pedido, incluido el envío.
            </li>
            <li>
              <strong>Falta de liquidación.</strong> Si el pedido no se liquida
              dentro de esos 5 días, el perfume se libera para su venta y se
              pierde el anticipo, sin derecho a reembolso ni compensación.
            </li>
            <li>
              <strong>Autenticidad y presentación.</strong> Los perfumes son
              100% originales, tal como los ofrece la casa. Las variaciones de
              lote, concentración según disponibilidad o detalles de empaque no
              son motivo de cancelación ni reembolso.
            </li>
            <li>
              <strong>Preferencia personal.</strong> Al tratarse de un producto
              encargado especialmente a tu solicitud, el hecho de que el aroma no
              sea de tu agrado no constituye motivo de reembolso.
            </li>
          </ul>
        </section>

        <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">
          9. Propiedad intelectual
        </h2>
        <section className="space-y-4 text-[15px] leading-relaxed">
          <p>
            Los nombres de las casas perfumeras y de los perfumes son marcas
            registradas de sus respectivos propietarios y se usan únicamente con
            fines descriptivos e informativos. El contenido propio del sitio
            (textos, fotografías y reseñas) pertenece a Perfumes de Diego y no
            puede reproducirse sin autorización.
          </p>
        </section>

        <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">
          10. Limitación de responsabilidad
        </h2>
        <section className="space-y-4 text-[15px] leading-relaxed">
          <p>
            Las descripciones, notas olfativas y opiniones son informativas y
            subjetivas; la percepción de un aroma varía entre personas. Si eres
            sensible a perfumes o tienes alguna condición de la piel, prueba el
            producto con precaución. No nos hacemos responsables por reacciones
            derivadas del uso inadecuado de los productos.
          </p>
        </section>

        <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">
          11. Privacidad
        </h2>
        <section className="space-y-4 text-[15px] leading-relaxed">
          <p>
            El tratamiento de tus datos personales se rige por nuestro{" "}
            <Link
              to="/privacidad"
              className="text-[#A47E3B] underline hover:text-[#D4AF7A]"
            >
              Aviso de Privacidad
            </Link>
            .
          </p>
        </section>

        <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">
          12. Legislación aplicable
        </h2>
        <section className="space-y-4 text-[15px] leading-relaxed">
          <p>
            Estos términos se rigen por las leyes de los Estados Unidos
            Mexicanos. Cualquier controversia se resolverá ante los tribunales
            competentes de México, sin perjuicio de los derechos que la
            legislación de protección al consumidor te otorga.
          </p>
        </section>

        <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">
          13. Contacto
        </h2>
        <section className="space-y-4 text-[15px] leading-relaxed">
          <p>
            Para cualquier duda sobre estos términos, escríbenos por WhatsApp al{" "}
            <a
              href="https://wa.me/5212212034647"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A47E3B] underline hover:text-[#D4AF7A]"
            >
              +52 221 203 4647
            </a>{" "}
          </p>
        </section>
      </main>
    </>
  );
}