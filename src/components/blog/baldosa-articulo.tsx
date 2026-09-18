import { Clock } from "lucide-react";

import { TarjetaDeContenido } from "@/components/comunes/tarjeta-contenido";
import { siteConfig } from "@/config/site-config";
import type { Articulo } from "@/lib/blog/esquema";
import { CLASES_DE_NIVEL, type Nivel } from "@/lib/blog/ranking";

/**
 * Baldosa del mosaico del blog: decide QUÉ mostrar de un artículo; el CÓMO lo pone
 * `TarjetaDeContenido`.
 *
 * `CLASES_DE_NIVEL` sigue mandando en la retícula: es lo que reparte columnas y filas del mosaico,
 * cuyas filas miden 15,5 rem fijos. Lo que se pasa ahora es `h-full`, no `aspect-auto`: la tarjeta
 * llena la celda que le toca y su foto crece con ella, en vez de desactivar el marco del organismo.
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
      meta={
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5 shrink-0" />
          {articulo.minutosDeLectura} min de lectura
        </span>
      }
      /* En el blog el lead nace de algo leído, no de una foto de producto: el contexto lo dice, para
         que a quien atiende le llegue por qué escriben y no un título de artículo suelto. */
      acciones={{
        titulo: articulo.titulo,
        url: `${siteConfig.url}/blog/${articulo.slug}`,
        contexto: "leí este artículo en el blog",
      }}
      className={["h-full min-h-[14rem]", CLASES_DE_NIVEL[nivel]].join(" ")}
    />
  );
}
