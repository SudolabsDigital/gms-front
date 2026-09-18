"use client";

import { Suspense, useCallback, useState, useMemo, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { LugarResumen, ObraItem, ObraResumen } from "@/lib/obras/esquema";
import { TarjetaObra } from "./tarjeta-obra";
import { FiltroObras } from "./filtro-obras";
import { siteConfig } from "@/config/site-config";
import { WhatsAppIcon } from "@/components/landing/social-icons";
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  RotateCcw,
  Info,
  ZoomIn,
  ZoomOut,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PropsGaleria {
  obras: ObraItem[];
  lugares: LugarResumen[];
  resumenObras: ObraResumen[];
}

/**
 * EL FILTRO DE OBRAS VIVE EN LA URL: `/obras?obra=uncp` o `/obras?lugar=lima`.
 *
 * Mismo mecanismo que el catálogo (`vista-categoria-cliente`): el megamenú del header necesita enlazar
 * una obra ya filtrada. En una página estática, `useSearchParams` exige un límite de `Suspense`; su
 * `fallback` —la galería sin filtrar— es lo que va en el HTML prerenderado. `?obra=` manda sobre
 * `?lugar=`, porque una obra ya dice su lugar. Un slug que no existe muestra todas las fotos.
 */
export function GaleriaObras(props: PropsGaleria) {
  return (
    <Suspense fallback={<Galeria {...props} lugarActivo="todas" obraActiva="todas" />}>
      <GaleriaConUrl {...props} />
    </Suspense>
  );
}

function GaleriaConUrl(props: PropsGaleria) {
  const router = useRouter();
  const pathname = usePathname();
  const parametros = useSearchParams();

  const obraPedida = props.resumenObras.find((o) => o.slug === parametros.get("obra"));
  const lugarPedido = props.lugares.find((l) => l.slug === parametros.get("lugar"));
  const obraActiva = obraPedida?.slug ?? "todas";
  const lugarActivo = obraPedida?.lugarSlug ?? lugarPedido?.slug ?? "todas";

  const filtrar = useCallback(
    ({ lugar, obra }: { lugar?: string; obra?: string }) => {
      const nuevos = new URLSearchParams(parametros.toString());
      nuevos.delete("obra");
      nuevos.delete("lugar");
      if (obra && obra !== "todas") nuevos.set("obra", obra);
      else if (lugar && lugar !== "todas") nuevos.set("lugar", lugar);
      const consulta = nuevos.toString();
      // `replace` y no `push`: filtrar no es navegar, y «atrás» debe volver a la página anterior.
      router.replace(consulta ? `${pathname}?${consulta}` : pathname, { scroll: false });
    },
    [parametros, pathname, router],
  );

  return <Galeria {...props} lugarActivo={lugarActivo} obraActiva={obraActiva} onFiltrar={filtrar} />;
}

function Galeria({
  obras,
  lugares,
  resumenObras,
  lugarActivo,
  obraActiva,
  onFiltrar,
}: PropsGaleria & {
  lugarActivo: string;
  obraActiva: string;
  onFiltrar?: (filtro: { lugar?: string; obra?: string }) => void;
}) {
  const [seleccionada, setSeleccionada] = useState<number | null>(null);

  // Estados del visor / lightbox
  const [mostrarInfo, setMostrarInfo] = useState(true);
  const [zoomActivado, setZoomActivado] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Soporte táctil móvil (Swipe)
  const touchStartX = useRef<number | null>(null);

  const obrasFiltradas = useMemo(() => {
    return obras.filter((o) => {
      if (obraActiva !== "todas") return o.obraSlug === obraActiva;
      return lugarActivo === "todas" || o.lugarSlug === lugarActivo;
    });
  }, [obras, lugarActivo, obraActiva]);

  const limpiarFiltros = () => onFiltrar?.({});

  const hayFiltrosActivos = lugarActivo !== "todas" || obraActiva !== "todas";

  // Lugar y obra activos, para el recordatorio
  const lugarActual = lugares.find((l) => l.slug === lugarActivo);
  const obraSeleccionada = resumenObras.find((o) => o.slug === obraActiva);

  // Control de teclado para el visor
  useEffect(() => {
    if (seleccionada === null) return;

    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSeleccionada(null);
        setZoomActivado(false);
      }
      if (e.key === "ArrowRight") {
        setSeleccionada((i) => (i !== null ? Math.min(i + 1, obrasFiltradas.length - 1) : null));
        setZoomActivado(false);
      }
      if (e.key === "ArrowLeft") {
        setSeleccionada((i) => (i !== null ? Math.max(i - 1, 0) : null));
        setZoomActivado(false);
      }
      if (e.key.toLowerCase() === "i") {
        setMostrarInfo((prev) => !prev);
      }
      if (e.key.toLowerCase() === "z") {
        setZoomActivado((prev) => !prev);
      }
    };

    document.addEventListener("keydown", alPulsar);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", alPulsar);
      document.body.style.overflow = "";
    };
  }, [seleccionada, obrasFiltradas.length]);

  // Touch handlers para móviles
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || seleccionada === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;

    // Deslizar a la izquierda = siguiente foto
    if (diff > 50 && seleccionada < obrasFiltradas.length - 1) {
      setSeleccionada(seleccionada + 1);
      setZoomActivado(false);
    }
    // Deslizar a la derecha = foto anterior
    if (diff < -50 && seleccionada > 0) {
      setSeleccionada(seleccionada - 1);
      setZoomActivado(false);
    }
    touchStartX.current = null;
  };

  useEffect(() => {
    const sincronizarHash = () => {
      if (typeof window !== "undefined" && window.location.hash) {
        const hashId = window.location.hash.replace("#", "");
        // Sobre las FILTRADAS, que son las que recorre el visor. Buscaba en todas: con un filtro
        // activo, `#id` abría otra foto (defecto hallado el 2026-09-12 al llevar el filtro a la URL).
        const index = obrasFiltradas.findIndex((o) => o.id === hashId);
        if (index !== -1) {
          setSeleccionada(index);
        }
      }
    };

    const timer = setTimeout(sincronizarHash, 0);
    window.addEventListener("hashchange", sincronizarHash);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("hashchange", sincronizarHash);
    };
  }, [obrasFiltradas]);

  const copiarEnlace = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const obraActual = seleccionada !== null ? obrasFiltradas[seleccionada] : null;
  const urlObraActual = obraActual ? `${siteConfig.url}/obras/${obraActual.id}` : "";
  const mensajeWhatsApp = obraActual
    ? `Hola GMS Integra, vi la foto «${obraActual.titulo}» de la obra ${obraActual.obraNombre} (${urlObraActual}) y deseo cotizar un proyecto similar.`
    : "";

  return (
    <div className="flex flex-col gap-8">
      
      {/* ── Panel de Filtros Jerárquicos ── */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
        <FiltroObras
          lugares={lugares}
          obras={resumenObras}
          lugarActivo={lugarActivo}
          obraActiva={obraActiva}
          totalFotos={obras.length}
          onSeleccionarLugar={(lugar) => onFiltrar?.({ lugar })}
          // Quitar la obra devuelve a SU lugar, que es el que la pantalla mostraba activo. Sin esto,
          // Lima → USIL → quitar USIL acababa en las 472 fotos (recorrido del 2026-09-17).
          onSeleccionarObra={(obra) => onFiltrar?.(obra === "todas" ? { lugar: lugarActivo } : { obra })}
        />
      </div>

      {/* ── Recordatorio Flotante / Barra de Estado de lo Seleccionado ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#0A1118] px-5 py-3.5 text-white shadow-md border border-white/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="size-2.5 rounded-full bg-brand animate-pulse shrink-0" />
          <div className="flex items-center gap-1.5 text-xs font-black truncate">
            <span className="text-slate-400">Viendo:</span>
            <span className="text-brand">
              {lugarActual?.nombre || "Todos los lugares"}
            </span>
            {obraSeleccionada && (
              <>
                <span className="text-white/30">/</span>
                <span className="text-white font-bold">{obraSeleccionada.nombre}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-bold text-slate-300">
            {obrasFiltradas.length} {obrasFiltradas.length === 1 ? "foto" : "fotos"}
          </span>

          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20 transition-colors cursor-pointer border border-white/10"
            >
              <RotateCcw className="size-3" />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Grid de Fotografías Limpias ── */}
      {obrasFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {obrasFiltradas.map((obra, index) => (
            <TarjetaObra
              key={obra.id}
              obra={obra}
              onAbrir={() => {
                setSeleccionada(index);
                setZoomActivado(false);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <MapPin className="mx-auto size-10 text-muted-foreground/40 mb-3" />
          <h3 className="text-lg font-black text-foreground">No se encontraron obras</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            No hay fotos con los filtros seleccionados. Intenta cambiar de ubicación o tipología.
          </p>
          <button
            type="button"
            onClick={limpiarFiltros}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary/90 cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Ver todas las obras</span>
          </button>
        </div>
      )}

      {/* ── VISOR MASTERCLASS A PANTALLA COMPLETA (LIGHTBOX) ── */}
      {seleccionada !== null && obraActual && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/96 backdrop-blur-xl select-none"
          onClick={() => {
            setSeleccionada(null);
            setZoomActivado(false);
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label="Visor fotográfico de obra"
        >
          {/* ── BARRA SUPERIOR DE HERRAMIENTAS (HUD) ── */}
          <div
            className="flex w-full items-center justify-between p-4 sm:p-5 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Contador de posición */}
            <div className="flex items-center gap-2 rounded-full bg-black/70 px-3.5 py-1.5 text-xs font-black text-white backdrop-blur-md border border-white/15">
              <span>{seleccionada + 1}</span>
              <span className="text-white/30">/</span>
              <span className="text-slate-400">{obrasFiltradas.length}</span>
            </div>

            {/* Controles de visualización */}
            <div className="flex items-center gap-2">
              {/* Botón Zoom */}
              <button
                type="button"
                onClick={() => setZoomActivado(!zoomActivado)}
                className={cn(
                  "flex size-10 items-center justify-center rounded-full backdrop-blur-md border transition-all cursor-pointer",
                  zoomActivado
                    ? "bg-brand text-slate-950 border-brand-linea"
                    : "bg-white/10 text-white border-white/15 hover:bg-white/20"
                )}
                title={zoomActivado ? "Reducir zoom (Z)" : "Ampliar imagen (Z)"}
                aria-label="Alternar zoom"
              >
                {zoomActivado ? <ZoomOut className="size-4.5" /> : <ZoomIn className="size-4.5" />}
              </button>

              {/* Botón Alternar Información */}
              <button
                type="button"
                onClick={() => setMostrarInfo(!mostrarInfo)}
                className={cn(
                  "flex size-10 items-center justify-center rounded-full backdrop-blur-md border transition-all cursor-pointer",
                  mostrarInfo
                    ? "bg-white/20 text-brand border-white/30"
                    : "bg-white/10 text-white/60 border-white/10 hover:text-white"
                )}
                title={mostrarInfo ? "Ocultar información (I)" : "Mostrar información (I)"}
                aria-label="Alternar información"
              >
                <Info className="size-4.5" />
              </button>

              {/* Botón Cerrar */}
              <button
                type="button"
                onClick={() => {
                  setSeleccionada(null);
                  setZoomActivado(false);
                }}
                className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/15 hover:bg-red-500/80 hover:border-red-500 transition-colors cursor-pointer"
                title="Cerrar visor (Esc)"
                aria-label="Cerrar"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* ── LIENZO CENTRAL DE LA FOTOGRAFÍA ── */}
          <div
            className="relative flex flex-1 items-center justify-center w-full px-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón Anterior */}
            {seleccionada > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSeleccionada(seleccionada - 1);
                  setZoomActivado(false);
                }}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 flex size-12 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 transition-all hover:bg-white hover:text-slate-900 z-30 cursor-pointer shadow-xl hover:scale-105 active:scale-95"
                aria-label="Obra anterior"
              >
                <ChevronLeft className="size-6" />
              </button>
            )}

            {/* Imagen Principal en Alta Resolución */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={obraActual.src}
              alt={`${obraActual.obraNombre} · ${obraActual.titulo}`}
              onDoubleClick={() => setZoomActivado(!zoomActivado)}
              className={cn(
                "rounded-2xl object-contain shadow-2xl transition-all duration-300 max-w-full",
                zoomActivado
                  ? "scale-140 max-h-[90vh] cursor-zoom-out"
                  : "max-h-[75vh] md:max-h-[82vh] cursor-zoom-in"
              )}
            />

            {/* Botón Siguiente */}
            {seleccionada < obrasFiltradas.length - 1 && (
              <button
                type="button"
                onClick={() => {
                  setSeleccionada(seleccionada + 1);
                  setZoomActivado(false);
                }}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 flex size-12 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 transition-all hover:bg-white hover:text-slate-900 z-30 cursor-pointer shadow-xl hover:scale-105 active:scale-95"
                aria-label="Obra siguiente"
              >
                <ChevronRight className="size-6" />
              </button>
            )}
          </div>

          {/* ── BARRA INFERIOR DE INFORMACIÓN FLOTANTE (HUD) ── */}
          <div
            className={cn(
              "w-full max-w-4xl p-4 sm:p-5 transition-all duration-300 z-20",
              mostrarInfo
                ? "translate-y-0 opacity-100 pointer-events-auto"
                : "translate-y-6 opacity-0 pointer-events-none"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl bg-[#0A1118]/95 border border-white/15 p-4 sm:p-5 text-white backdrop-blur-xl shadow-2xl">
              
              {/* Información del Proyecto */}
              <div className="text-center md:text-left min-w-0 flex-1">
                {(obraActual.lugar || obraActual.anio) && (
                  <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-brand uppercase tracking-wider mb-1">
                    <MapPin className="size-3.5" />
                    <span>{[obraActual.lugar, obraActual.anio].filter(Boolean).join(" · ")}</span>
                  </div>
                )}

                <h3 className="text-base sm:text-lg font-black text-white leading-tight font-sans truncate">
                  {obraActual.obraNombre} · {obraActual.titulo}
                </h3>
              </div>

              {/* Botones de Acción (Cotizar & Compartir) */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
                {/* Copiar enlace */}
                <button
                  type="button"
                  onClick={() => copiarEnlace(urlObraActual)}
                  className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/15 cursor-pointer"
                  title="Copiar enlace directo"
                  aria-label="Copiar enlace"
                >
                  {copiado ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                </button>

                {/* Compartir WhatsApp */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Mira esta foto de la obra ${obraActual.obraNombre}: ${urlObraActual}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/15"
                  title="Compartir por WhatsApp"
                  aria-label="Compartir por WhatsApp"
                >
                  <Share2 className="size-4 text-slate-300" />
                </a>

                {/* Cotizar Directo por WhatsApp */}
                <a
                  href={`https://wa.me/${siteConfig.whatsapp.numero}?text=${encodeURIComponent(mensajeWhatsApp)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-500 transition-all shadow-md active:scale-98"
                >
                  <WhatsAppIcon className="size-4 text-white" />
                  <span>Cotizar este Acabado</span>
                </a>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
