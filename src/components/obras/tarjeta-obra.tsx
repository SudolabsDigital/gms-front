import {
  TarjetaDeContenido,
  orientacionDe,
} from "@/components/comunes/tarjeta-contenido";
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
      /* Lugar y año solo si la carpeta los declara; tipo y zona eran deducidos y ya no se afirman. */
      antetitulo={[obra.lugar, obra.anio].filter(Boolean).join(" · ") || "Obra ejecutada"}
      /* Sin badge de ubicación. En pantalla la tarjeta decía el mismo sitio TRES veces: en la
         píldora, en el antetítulo y otra vez dentro del título generado. El antetítulo ya lo
         sitúa; repetirlo no añade dato, solo tapa foto. */
      alAbrirVista={onAbrir}
      className={
        esPanoramica
          ? "aspect-auto min-h-[380px] md:col-span-2 md:row-span-2 md:min-h-[480px]"
          : "aspect-auto min-h-[280px] md:min-h-[320px]"
      }
    />
  );
}
