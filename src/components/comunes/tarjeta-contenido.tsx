import Image from "next/image";
import Link from "next/link";

import {
  AccionesDeContenido,
  type AccionesDeContenidoProps,
} from "@/components/comunes/acciones-contenido";
import { cn } from "@/lib/utils";

/**
 * TARJETA DE CONTENIDO — la baldosa del portal, una sola vez para catálogo, obras y blog.
 *
 * Sustituye a tres implementaciones de la misma intención visual que divergían en todo: envoltorio,
 * componente de imagen, proporción, radio, scrim y color de acento. La consecuencia no era estética:
 * `tarjeta-obra` nació como disparador de lightbox, sin ancla, y dejó 2.027 páginas de detalle a las
 * que no enlazaba nada. Por eso aquí `href` es obligatorio y no existe variante sin él — la puerta
 * que impide que eso vuelva está en el tipo.
 *
 * SOLO EL TÍTULO. Nada de descripción ni de resumen: la foto es el argumento de venta en este rubro
 * y tres longitudes de resumen distintas conviviendo en la misma retícula la empequeñecían.
 *
 * ABRIR EL VISOR ES *ADEMÁS*, NUNCA *EN LUGAR DE*. Cuando se pasa `alAbrirVista` se pinta un botón
 * hermano del enlace: quien navega con el ratón se queda en la galería, y el rastreador sigue
 * teniendo un `<a href>` que seguir.
 */

export type OrientacionImagen = "panoramica" | "horizontal" | "cuadrada" | "vertical";

/**
 * Qué forma tiene la foto, y qué hace la tarjeta con ella.
 *
 * Antes se fijaba una altura mínima igual para todas (`min-h-[280px]`), así que una foto vertical
 * —una puerta, una mampara de una hoja, una baranda de escalera— entraba en un marco apaisado y el
 * recorte se comía el sujeto. El encuadre se sube en las verticales porque en carpintería lo que
 * identifica la pieza está arriba: el cabezal, el travesaño, el remate.
 */
const FORMA: Record<OrientacionImagen, { proporcion: string; encuadre: string }> = {
  panoramica: { proporcion: "aspect-[16/9]", encuadre: "object-center" },
  horizontal: { proporcion: "aspect-[16/10]", encuadre: "object-center" },
  cuadrada: { proporcion: "aspect-[4/3]", encuadre: "object-[center_35%]" },
  vertical: { proporcion: "aspect-[3/4]", encuadre: "object-[center_25%]" },
};

/**
 * Deduce la forma a partir de las dimensiones REALES de la foto.
 *
 * El catálogo y las obras ya guardan `ancho` y `alto` de cada imagen, así que la orientación es un
 * dato medido y no hace falta que nadie la escriba a mano — que es donde se equivocaría, porque son
 * 1.558 fichas. Los cortes salen de dónde empieza a notarse el recorte, no de proporciones
 * canónicas: 16/9 y 3/2 caen las dos en «panorámica» y se comportan igual dentro del marco.
 */
export function orientacionDe(ancho?: number, alto?: number): OrientacionImagen {
  if (!ancho || !alto) return "horizontal";
  const razon = ancho / alto;
  if (razon >= 1.7) return "panoramica";
  if (razon >= 1.3) return "horizontal";
  if (razon >= 0.95) return "cuadrada";
  return "vertical";
}

/** `sizes` sale del hueco que ocupa la tarjeta en la retícula, no se escribe en cada consumidor. */
const TAMANOS: Record<1 | 2 | 3, string> = {
  1: "(max-width: 768px) 100vw, 66vw",
  2: "(max-width: 768px) 100vw, 33vw",
  3: "(max-width: 768px) 100vw, 33vw",
};

export interface TarjetaDeContenidoProps {
  /** OBLIGATORIO. No existe tarjeta sin destino: es lo que impide volver a dejar páginas huérfanas. */
  href: string;
  /** Único texto principal. Se pinta en `<h3>`. */
  titulo: string;
  imagen: string;
  /** Descriptivo y del contexto — nunca el título de cámara del catálogo. */
  imagenAlt: string;
  orientacion?: OrientacionImagen;
  /** Jerarquía en el mosaico: 1 destaca, 3 es la baldosa menor. */
  nivel?: 1 | 2 | 3;
  /** Línea breve sobre el título: «Residencial · Huancayo», «7 min de lectura». */
  antetitulo?: React.ReactNode;
  /** Píldora superior derecha: conteo, ubicación, etiqueta. */
  badge?: React.ReactNode;
  /** Marca la imagen como LCP. Solo las primeras de la retícula. */
  prioridad?: boolean;
  /** Si viene, monta las acciones de compartir y cotizar sobre la imagen. */
  acciones?: Omit<AccionesDeContenidoProps, "variante">;
  /** Abre el visor. Se pinta como botón aparte, sin sustituir al enlace. */
  alAbrirVista?: () => void;
  className?: string;
}

export function TarjetaDeContenido({
  href,
  titulo,
  imagen,
  imagenAlt,
  orientacion = "horizontal",
  nivel = 2,
  antetitulo,
  badge,
  prioridad = false,
  acciones,
  alAbrirVista,
  className,
}: TarjetaDeContenidoProps) {
  const { proporcion, encuadre } = FORMA[orientacion];
  const destacada = nivel === 1;

  return (
    <article
      className={cn(
        "group relative isolate overflow-hidden rounded-2xl border border-border/80 bg-slate-950 shadow-xs",
        "transition-all duration-500 hover:-translate-y-1 hover:border-primary/60 hover:shadow-2xl",
        "focus-within:ring-ring focus-within:ring-2 focus-within:ring-offset-2",
        proporcion,
        className,
      )}
    >
      {/* El ancla envuelve imagen Y título: enlace con texto, no enlace vacío. */}
      <Link href={href} className="absolute inset-0 flex flex-col justify-end">
        <Image
          src={imagen}
          alt={imagenAlt}
          fill
          priority={prioridad}
          sizes={TAMANOS[nivel]}
          className={cn(
            "-z-10 object-cover transition-transform duration-700 group-hover:scale-105",
            encuadre,
          )}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-300 group-hover:from-black/90"
        />

        <div className={cn("relative flex flex-col gap-1.5", destacada ? "p-6 sm:p-8" : "p-5")}>
          {antetitulo && (
            <span className="text-brand truncate text-[11px] font-bold tracking-wider uppercase">
              {antetitulo}
            </span>
          )}
          <h3
            className={cn(
              "text-balance font-black tracking-tight text-white transition-colors group-hover:text-brand",
              destacada ? "text-xl leading-tight sm:text-2xl md:text-3xl" : "text-base sm:text-lg",
            )}
          >
            {titulo}
          </h3>
        </div>
      </Link>

      {badge && (
        <div className="pointer-events-none absolute top-3.5 right-3.5 z-10 rounded-full border border-white/15 bg-black/70 px-3 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-md">
          {badge}
        </div>
      )}

      {acciones && <AccionesDeContenido {...acciones} variante="flotante" />}

      {alAbrirVista && <BotonDeVisor titulo={titulo} alAbrir={alAbrirVista} />}
    </article>
  );
}

/**
 * Botón para abrir el visor sin salir de la galería.
 *
 * Va FUERA del `<a>` a propósito: un `<button>` dentro de un ancla es HTML inválido y el navegador
 * reparte el clic entre los dos de forma impredecible.
 */
function BotonDeVisor({ titulo, alAbrir }: { titulo: string; alAbrir: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        alAbrir();
      }}
      aria-label={`Ver ${titulo} en grande`}
      className="focus-visible:ring-ring absolute right-3.5 bottom-3.5 z-10 flex size-9 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110 hover:bg-white/25 focus-visible:ring-2 focus-visible:outline-none"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
        <path
          d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
