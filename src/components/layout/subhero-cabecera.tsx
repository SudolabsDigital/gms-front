import Image from "next/image";
import { MigasVisual, type Miga } from "@/components/layout/migas-visual";
import { cn } from "@/lib/utils";

/**
 * SUBHERO CABECERA TRANSVERSAL / CABECERA CINEMATOGRÁFICA DE PÁGINA
 *
 * Organismo transversal del portal público de GMS Integra (obras, catálogo, blog).
 * Preserva al 100% la jerarquía visual de alto impacto:
 * - Ruta de navegación visual sobre píldora traslúcida de alto contraste
 * - Título dominante con tipografía fluida de gran formato
 * - Resumen destacado en tarjeta de vidrio templado con acento cian
 * - Metadatos e indicadores en píldoras nítidas
 * - Velos oscuros multicapa balanceados para visibilidad nítida en desktop y móvil
 */

/**
 * Qué forma tiene la portada, y qué hace la cabecera con ella.
 *
 * Antes el marco era uno solo (`28rem` / `34rem`) con `object-center` fijo, así que una foto
 * vertical entraba en un banner apaisado y el recorte se llevaba por delante el sujeto. Cuanto más
 * vertical es la foto, más alto se hace el marco —para tragarse menos— y más arriba se ancla el
 * encuadre, porque en carpintería lo que identifica la pieza está arriba: cabezal, travesaño, remate.
 *
 * `horizontal` es el defecto y conserva EXACTAMENTE las medidas que la cabecera tenía antes de
 * existir este prop: ninguna de las 8 páginas que ya la usan cambia de aspecto por esto.
 */
const FORMA = {
  panoramica: { alto: "min-h-[24rem] md:min-h-[30rem]", encuadre: "object-center" },
  horizontal: { alto: "min-h-[28rem] md:min-h-[34rem]", encuadre: "object-center" },
  cuadrada: { alto: "min-h-[30rem] md:min-h-[38rem]", encuadre: "object-[center_35%]" },
  vertical: { alto: "min-h-[30rem] md:min-h-[38rem]", encuadre: "object-[center_25%]" },
} as const;

const FOCO = {
  arriba: "object-[center_20%]",
  centro: "object-center",
  abajo: "object-[center_80%]",
} as const;

export interface SubheroCabeceraProps {
  migas: Miga[];
  titulo: string;
  /**
   * Pregunta de enganche sobre el resumen, con la tipografia del hero.
   *
   * Es la que convierte un panel descriptivo en una invitacion: el visitante llega leyendo QUE es
   * esta pagina y se va con algo que responderle a la empresa.
   */
  pregunta?: string;
  resumen?: string;
  antetitulo?: string;
  imagen: string;
  imagenAlt: string;
  /** Forma real de la portada. Deriva alto del marco y encuadre. Usa `orientacionDe(ancho, alto)`. */
  orientacion?: keyof typeof FORMA;
  /** Corrige el encuadre a mano cuando la derivación no acierta con esta foto en concreto. */
  foco?: keyof typeof FOCO;
  meta?: React.ReactNode;
  acciones?: React.ReactNode;
  className?: string;
}

export function SubheroCabecera({
  migas,
  titulo,
  pregunta,
  resumen,
  antetitulo,
  imagen,
  imagenAlt,
  orientacion = "horizontal",
  foco,
  meta,
  acciones,
  className,
}: SubheroCabeceraProps) {
  const { alto, encuadre } = FORMA[orientacion];

  return (
    <header
      className={cn(
        "relative isolate flex w-full flex-col justify-end overflow-hidden",
        "border-b border-slate-800 bg-[#0A1118] pt-32 md:pt-40 pb-12 md:pb-16",
        alto,
        className
      )}
    >
      {/* ── Imagen de Fondo ── */}
      <Image
        src={imagen}
        alt={imagenAlt}
        fill
        priority
        className={cn(
          "-z-20 scale-100 object-cover brightness-90 transition-transform duration-1000",
          foco ? FOCO[foco] : encuadre
        )}
        sizes="100vw"
      />

      {/*
        AQUÍ HABÍA DOS VELOS A PANTALLA COMPLETA, y se fueron el 2026-09-18.

        Tapaban la portada entera —hasta el 85 % de negro en el borde izquierdo— para que se leyeran
        cuatro textos que ocupan un tercio de la superficie. La foto es el argumento de venta de esta
        empresa: no se oscurece para proteger un título.

        Lo que protege ahora a cada texto está anclado AL TEXTO, no a la imagen — que es lo que manda
        la regla 3 del sistema de imagen: un degradado pegado a la foto cae en un sitio distinto en
        cada ancho, porque el recorte cambia, y el título acaba sobre la parte clara sin que nadie lo
        vea venir. El titular lleva contorno; las migas, el antetítulo, los metadatos y el panel de
        resumen llevan su propio fondo.
      */}

      {/* ── Contenedor Principal de Gran Formato ── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          {/*
            Fila superior: solo la ruta de navegación.

            Aquí había una píldora con un punto parpadeante —«Catálogo 2025», «Línea Certificada»,
            «Obra Concluida»— en las 8 cabeceras del portal, y se retiró entera el 2026-09-18. Decía el
            tipo de página en la que ya estás, justo encima de un titular que lo dice mejor, y dos de
            esos rótulos afirmaban cosas sin respaldo: no hay certificación que sostenga «Certificada»
            y que una obra esté concluida no consta (D15).
          */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <MigasVisual items={migas} variante="oscura" />
          </div>

          {/* ── Grid Principal de Contenido ── */}
          <div className="grid grid-cols-1 items-end gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            
            {/* ── Columna Izquierda: Título y Metadatos ── */}
            <div className="flex min-w-0 flex-col gap-4">
              {antetitulo && (
                <div className="inline-flex w-fit items-center gap-2.5 rounded-lg border border-white/15 bg-black/55 px-3 py-1.5 backdrop-blur-md">
                  <span className="bg-brand-claro h-0.5 w-6 rounded-full" />
                  {/* `--brand-claro` y no `--brand`: el azul de marca sobre oscuro da 2,11:1. */}
                  <span className="text-brand-claro text-xs font-black tracking-[0.25em] uppercase">
                    {antetitulo}
                  </span>
                </div>
              )}

              {/*
                El mismo tratamiento que el titular del hero: Fredoka con contorno de marca. El peso
                es 600 y no 900 porque son los únicos que la fuente trae cargados —pedirle negrita
                obligaría al navegador a fabricarla, y una negrita sintetizada bajo un contorno se
                empasta—. El cuerpo se lo da el trazo, no el peso.
              */}
              <h1 className="font-marca titular-contorno text-3xl leading-[1.08] font-semibold text-balance uppercase drop-shadow-md sm:text-4xl md:text-5xl lg:text-6xl">
                {titulo}
              </h1>

              {meta && (
                <div className="mt-1 flex w-fit flex-wrap items-center gap-3 rounded-lg border border-white/15 bg-black/55 px-3 py-1.5 text-xs font-bold text-slate-100 backdrop-blur-md">
                  {meta}
                </div>
              )}
            </div>

            {/* ── Columna Derecha: Tarjeta de Resumen en Vidrio Templado ── */}
            {(resumen || acciones || pregunta) && (
              /*
                LA VENTANA. El marco grueso y claro imita un perfil de aluminio; dentro, la misma
                foto de la cabecera a mayor escala, desplazandose con el scroll. Es el producto de
                la empresa usado como pieza de interfaz, y de paso resuelve el problema que dejo
                quitar el velo: el texto de este bloque necesita un fondo propio, y aqui lo tiene.
              */
              <div className="relative isolate overflow-hidden rounded-2xl border-4 border-white/25 shadow-2xl">
                {/*
                  Mas escala y otro encuadre que la foto del fondo, a proposito: si la ventana
                  ensena el mismo trozo de la misma escena, no se lee como una ventana sino como un
                  recorte mas oscuro. Con `scale-150` y el encuadre subido, ensena otra parte.
                */}
                <Image
                  src={imagen}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="ventana-vista -z-10 scale-150 object-cover object-[center_18%]"
                />
                {/*
                  El velo va anclado A ESTE contenedor, no a la foto de la cabecera (regla 3), y es
                  un degradado, no un tinte plano: arriba deja ver la vista, y se cierra abajo, que
                  es donde caen el resumen y el boton. El texto no depende de como recorte la foto.
                */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 bg-gradient-to-b from-black/45 via-black/70 to-black/85"
                />

                <div className="flex flex-col gap-5 p-6 md:p-7">
                  {pregunta && (
                    <p className="font-marca titular-contorno text-2xl leading-tight font-semibold text-balance sm:text-3xl">
                      {pregunta}
                    </p>
                  )}

                  {resumen && (
                    <p className="text-pretty text-sm leading-relaxed font-medium text-slate-100 sm:text-base">
                      {resumen}
                    </p>
                  )}

                  {acciones && (
                    <div className="flex flex-wrap items-center gap-3 border-t border-white/15 pt-2">
                      {acciones}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}

// Alias de retrocompatibilidad
export { SubheroCabecera as CabeceraDePagina };
export type { SubheroCabeceraProps as CabeceraDePaginaProps };
