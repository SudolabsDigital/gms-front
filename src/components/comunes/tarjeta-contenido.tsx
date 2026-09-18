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
 * SOBRE LA FOTO NO VA NADA (v2). La primera versión ponía el texto ENCIMA de la imagen, sobre un
 * velo negro, y alrededor hasta cuatro cosas más: antetítulo, píldora de conteo, botón de compartir
 * y botón de visor. El producto de esta empresa se compra por cómo se ve, y cada capa era una
 * porción de foto tapada para decir algo que cabe debajo. Ahora la imagen está limpia y el texto
 * vive en un pie, fuera del marco.
 *
 * CON EL VELO SE VA TAMBIÉN UN DEFECTO DE CONTRASTE: el antetítulo en `text-brand` sobre la base
 * oscura daba 2,11:1 —bajo AA en las 476 tarjetas de obras—. El pie es superficie clara, así que el
 * texto deja de depender de dónde cayó el recorte de la foto.
 *
 * ABRIR EL VISOR ES *ADEMÁS*, NUNCA *EN LUGAR DE*. El enlace envuelve foto y pie: un clic en la
 * tarjeta entra en la ficha, que es donde vive la acción. Cuando se pasa `alAbrirVista` se pinta un
 * botón hermano del enlace —en la esquina del pie, no sobre la imagen— y el rastreador sigue
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
  /**
   * Línea bajo el título: «La Huaycha · 2025 · 48 fotos», «7 min de lectura».
   *
   * Absorbe el `antetitulo` y el `badge` de la v1, que eran dos textos en dos esquinas distintas de
   * la imagen. Juntos y debajo se leen de una vez, y la foto queda entera.
   */
  meta?: React.ReactNode;
  /** Marca la imagen como LCP. Solo las primeras de la retícula. */
  prioridad?: boolean;
  /**
   * Compartir y cotizar, como dos cuadrados EN EL PIE, a la derecha del nombre.
   *
   * La v1 los montaba flotando sobre la imagen y eso se retiró: la foto va limpia. Aquí están en la
   * banda blanca, que es un sitio distinto y no le quita un píxel a la foto.
   */
  acciones?: Omit<AccionesDeContenidoProps, "variante">;
  /** Abre el visor. Se pinta en la esquina del pie, sin sustituir al enlace. */
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
  meta,
  prioridad = false,
  acciones,
  alAbrirVista,
  className,
}: TarjetaDeContenidoProps) {
  const { proporcion, encuadre } = FORMA[orientacion];
  const destacada = nivel === 1;

  /**
   * Cuánto sitio hay que dejarle al carril de botones del pie.
   *
   * Se calcula aquí y no se escribe a ojo en cada caso porque el texto y los botones comparten
   * franja: si el reservado se queda corto, un título largo pasa por debajo de los botones y lo que
   * se lee es un nombre cortado a la mitad.
   */
  const anchoDeLosBotones = (acciones ? 2 : 0) + (alAbrirVista ? 1 : 0);
  const RESERVA = ["", "pr-16", "pr-28", "pr-40"][anchoDeLosBotones];

  return (
    <article
      className={cn(
        "group border-border/80 bg-card relative flex flex-col overflow-hidden rounded-2xl border shadow-xs",
        "hover:border-primary/60 focus-within:ring-ring transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-within:ring-2 focus-within:ring-offset-2",
        className,
      )}
    >
      {/* El ancla envuelve imagen Y pie: enlace con texto, no enlace vacío. */}
      <Link href={href} className="flex min-h-0 flex-auto flex-col">
        {/*
          El marco no lleva NADA dentro salvo la foto. Ni velo, ni píldora, ni botón.

          `flex-auto` junto a la proporción es lo que hace innecesario el `aspect-auto` que dos
          consumidores pasaban para anular el marco: cuando la tarjeta cae en una retícula de celdas
          altas —el mosaico del blog— la foto crece hasta llenar la celda; cuando la altura es libre
          —catálogo, obras— manda la proporción derivada de la forma real de la foto.
        */}
        <div className={cn("bg-muted relative min-h-0 flex-auto overflow-hidden", proporcion)}>
          <Image
            src={imagen}
            alt={imagenAlt}
            fill
            priority={prioridad}
            sizes={TAMANOS[nivel]}
            className={cn(
              "object-cover transition-transform duration-700 group-hover:scale-[1.03]",
              encuadre,
            )}
          />
        </div>

        <div
          className={cn(
            "flex shrink-0 flex-col gap-1",
            destacada ? "p-5 sm:p-6" : "px-4 py-3.5",
            /* Deja libre la franja derecha donde se posan los botones. */
            RESERVA,
          )}
        >
          <h3
            className={cn(
              "text-foreground group-hover:text-brand text-balance font-black tracking-tight transition-colors",
              destacada ? "text-lg leading-tight sm:text-xl md:text-2xl" : "text-sm sm:text-base",
            )}
          >
            {titulo}
          </h3>
          {meta && <p className="text-muted-foreground truncate text-xs font-medium">{meta}</p>}
        </div>
      </Link>

      {/*
        El carril de botones del pie. Va FUERA del `<Link>` a propósito: un `<button>` o un `<a>`
        dentro de un ancla es HTML inválido y el navegador reparte el clic de forma impredecible.
        Se posiciona sobre la banda blanca, nunca sobre la imagen.
      */}
      {(acciones || alAbrirVista) && (
        <div className="absolute right-3 bottom-3 flex items-center gap-2">
          {acciones && <AccionesDeContenido {...acciones} variante="compacta" />}
          {alAbrirVista && <BotonDeVisor titulo={titulo} alAbrir={alAbrirVista} />}
        </div>
      )}
    </article>
  );
}

/**
 * Botón para abrir el visor sin salir de la galería.
 *
 * Va FUERA del `<a>` a propósito: un `<button>` dentro de un ancla es HTML inválido y el navegador
 * reparte el clic entre los dos de forma impredecible. Y va en el PIE, no sobre la foto: es la
 * segunda intención de la tarjeta, y la primera —entrar en la ficha— es el enlace entero.
 *
 * Comparte medida y radio con los cuadrados de `AccionesDeContenido`, para que el carril del pie se
 * lea como un grupo y no como tres piezas sueltas.
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
      className="border-border bg-card text-muted-foreground hover:text-brand hover:border-brand/40 focus-visible:ring-ring flex size-10 items-center justify-center rounded border transition-colors focus-visible:ring-2 focus-visible:outline-none"
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
