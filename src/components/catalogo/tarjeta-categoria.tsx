import { TarjetaDeContenido } from "@/components/comunes/tarjeta-contenido";
import { siteConfig } from "@/config/site-config";
import type { CategoriaCatalogo } from "@/lib/catalogo/esquema";

/**
 * Tarjeta de línea del catálogo: decide QUÉ mostrar de una categoría; el CÓMO lo pone
 * `TarjetaDeContenido`.
 *
 * Pierde la descripción de tres líneas que llevaba debajo de la foto. Es deliberado: en este rubro
 * la foto es el argumento, y un párrafo bajo cada baldosa empequeñecía las 17 imágenes de la
 * retícula a la vez. Lo que la descripción contaba sigue estando en la página de la categoría, que
 * es donde alguien lo lee de verdad.
 */
export function TarjetaCategoria({
  categoria,
  prioridad = false,
}: {
  categoria: CategoriaCatalogo;
  prioridad?: boolean;
}) {
  return (
    <TarjetaDeContenido
      href={`/catalogo/${categoria.slug}`}
      titulo={categoria.nombre}
      imagen={categoria.portada}
      imagenAlt={`Línea de ${categoria.nombre} — carpintería de aluminio y cristal de GMS Integra`}
      orientacion="horizontal"
      prioridad={prioridad}
      /* Sin antetítulo. Se probó con «Línea de fabricación» y en pantalla se veía la misma
         etiqueta 17 veces: en una retícula donde TODAS las tarjetas son una línea, decirlo en
         cada una no distingue ninguna. El encabezado de la sección ya lo dice una vez. */
      meta={`${categoria.totalItems} ${categoria.totalItems === 1 ? "foto" : "fotos"}`}
      /* Compartir y cotizar en el pie, a la derecha del nombre. La URL es la de ESTA línea, así
         que el mensaje que llega al taller dice de cuál de las 17 se trata y trae el enlace para
         abrirla. Sobre la foto no va nada: estos dos cuadrados están en la banda blanca. */
      acciones={{
        titulo: categoria.nombre,
        url: `${siteConfig.url}/catalogo/${categoria.slug}`,
        contexto: `línea de ${categoria.nombre}`,
      }}
    />
  );
}
