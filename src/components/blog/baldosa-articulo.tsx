import { Clock } from "lucide-react";

import { TarjetaDeContenido } from "@/components/comunes/tarjeta-contenido";
import type { Articulo } from "@/lib/blog/esquema";
import { CLASES_DE_NIVEL, type Nivel } from "@/lib/blog/ranking";

/**
 * Baldosa del mosaico del blog: decide QUÉ mostrar de un artículo; el CÓMO lo pone
 * `TarjetaDeContenido`.
 *
 * `CLASES_DE_NIVEL` sigue mandando en la retícula —es lo que reparte columnas y filas del mosaico—
 * y se pasa junto a `aspect-auto`, que desactiva la proporción del organismo: dentro de una celda
 * con `col-span`/`row-span`, una proporción fija y el reparto de la rejilla se contradicen.
 */
export function BaldosaDeArticulo({
  articulo,
  nivel,
  prioridad = false,
}: {
  articulo: Articulo;
  nivel: Nivel;
  prioridad?: boolean;
}) {
  return (
    <TarjetaDeContenido
      href={`/blog/${articulo.slug}`}
      titulo={articulo.titulo}
      imagen={articulo.portada}
      imagenAlt={articulo.portadaAlt}
      nivel={nivel}
      prioridad={prioridad}
      antetitulo={
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5 shrink-0" />
          {articulo.minutosDeLectura} min de lectura
        </span>
      }
      className={[
        "aspect-auto min-h-[14rem]",
        CLASES_DE_NIVEL[nivel],
        nivel === 1 ? "md:min-h-[28rem]" : "md:min-h-[15rem]",
      ].join(" ")}
    />
  );
}
