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
  badge?: string;
  className?: string;
}

export function SubheroCabecera({
  migas,
  titulo,
  resumen,
  antetitulo,
  imagen,
  imagenAlt,
  orientacion = "horizontal",
  foco,
  meta,
  acciones,
  badge,
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

      {/* ── Velo 1: Degradado horizontal calibrado para visibilidad y legibilidad ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/55 to-black/30 md:from-black/80 md:via-black/45 md:to-black/25"
      />

      {/* ── Velo 2: Degradado vertical para proteger cabecera superior y base ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-transparent to-[#0A1118]"
      />

      {/* ── Contenedor Principal de Gran Formato ── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          {/* ── Fila Superior: Ruta de Navegación (Blanca) y Badge ── */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <MigasVisual items={migas} variante="oscura" />

            {badge && (
              <span className="inline-flex items-center gap-2 rounded-xl border border-[#00C9FF]/40 bg-black/60 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#00C9FF] backdrop-blur-md shadow-md">
                <span className="size-2 rounded-full bg-[#00C9FF] animate-ping" />
                {badge}
              </span>
            )}
          </div>

          {/* ── Grid Principal de Contenido ── */}
          <div className="grid grid-cols-1 items-end gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            
            {/* ── Columna Izquierda: Título y Metadatos ── */}
            <div className="flex min-w-0 flex-col gap-4">
              {antetitulo && (
                <div className="inline-flex items-center gap-2.5">
                  <span className="h-0.5 w-8 bg-[#00C9FF] rounded-full" />
                  <span className="text-xs font-black uppercase tracking-[0.25em] text-[#00C9FF] drop-shadow-sm">
                    {antetitulo}
                  </span>
                </div>
              )}

              <h1 className="text-balance font-black uppercase tracking-tight text-white leading-[1.08] text-3xl sm:text-4xl md:text-5xl lg:text-6xl drop-shadow-md">
                {titulo}
              </h1>

              {meta && (
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-300">
                  {meta}
                </div>
              )}
            </div>

            {/* ── Columna Derecha: Tarjeta de Resumen en Vidrio Templado ── */}
            {(resumen || acciones) && (
              <div className="flex flex-col gap-5 rounded-2xl border border-white/15 bg-black/45 p-6 md:p-7 backdrop-blur-md shadow-2xl">
                {resumen && (
                  <p className="text-pretty text-sm sm:text-base leading-relaxed text-slate-200 font-medium">
                    {resumen}
                  </p>
                )}

                {acciones && (
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10">
                    {acciones}
                  </div>
                )}
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
