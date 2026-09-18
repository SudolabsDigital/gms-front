import {
  TarjetaDeContenido,
  orientacionDe,
} from "@/components/comunes/tarjeta-contenido";
import { siteConfig } from "@/config/site-config";
import type { ObraItem } from "@/lib/obras/esquema";

/**
 * Tarjeta de obra: solo decide QUÉ mostrar de una obra. El CÓMO lo pone `TarjetaDeContenido`.
 *
 * Antes era un `<div onClick>` que abría el visor y nada más. Como no había ancla, las 472 páginas
 * de `/obras/[id]` se compilaban y se servían sin que nada enlazara a ellas: el rastreador no tenía
 * por dónde entrar. Ahora la tarjeta es un enlace y el visor se abre desde su propio botón, así que
 * la galería se comporta igual para quien navega y además existe para quien indexa.
 */
export function TarjetaObra({ obra, onAbrir }: { obra: ObraItem; onAbrir: () => void }) {
  const esPanoramica = obra.nivel === 1;

  return (
    <TarjetaDeContenido
      href={`/obras/${obra.id}`}
      titulo={obra.obraNombre}
      imagen={obra.src}
      /* La obra delante y la foto detrás: «Foto N» solo distingue la foto dentro de su obra. */
      imagenAlt={`${obra.obraNombre} · ${obra.titulo}`}
      orientacion={orientacionDe(obra.ancho, obra.alto)}
      nivel={obra.nivel}
      /* Lugar y año solo si la carpeta los declara; tipo y zona eran deducidos y ya no se afirman.
         Va DEBAJO del título desde la v2: encima de la foto daba 2,11:1 de contraste. */
      meta={[obra.lugar, obra.anio].filter(Boolean).join(" · ") || "Obra ejecutada"}
      /* Sin píldora de ubicación. En pantalla la tarjeta decía el mismo sitio TRES veces: en la
         píldora, en la línea de meta y otra vez dentro del título generado. */
      /* Compartir y cotizar en el pie, con el enlace de ESTA foto de la obra. El matiz importa:
         quien ve una obra terminada no pide esa obra, pide algo parecido para la suya. */
      acciones={{
        titulo: `${obra.obraNombre} · ${obra.titulo}`,
        url: `${siteConfig.url}/obras/${obra.id}`,
        contexto: "quiero un acabado similar",
      }}
      alAbrirVista={onAbrir}
      /*
        Fuera `aspect-auto` y las alturas mínimas. Anulaban la proporción que `orientacionDe()`
        deduce de las dimensiones reales, que es justo el trabajo que evita que una foto vertical
        —una puerta, una baranda de escalera— entre recortada en un marco apaisado. La obra
        destacada sigue ocupando dos columnas; el alto lo pone su foto.
      */
      className={esPanoramica ? "md:col-span-2 md:row-span-2" : undefined}
    />
  );
}
