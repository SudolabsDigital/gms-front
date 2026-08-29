"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import type { ObraItem, ZonaInfo, ZonaSlug } from "@/lib/obras/esquema";
import { TarjetaObra } from "./tarjeta-obra";
import { FiltroZonas } from "./filtro-zonas";
import { siteConfig } from "@/config/site-config";
import { WhatsAppIcon, FacebookIcon } from "@/components/landing/social-icons";
import {
  X,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  MapPin,
  Building,
  RotateCcw,
  Info,
  ZoomIn,
  ZoomOut,
  Share2,
  Copy,
  Check,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function GaleriaObras({
  obras,
  zonas,
}: {
  obras: ObraItem[];
  zonas: ZonaInfo[];
}) {
  const [zonaActiva, setZonaActiva] = useState<ZonaSlug>("todas");
  const [subzonaActiva, setSubzonaActiva] = useState<string>("todas");
  const [tipoActivo, setTipoActivo] = useState<string>("todos");
  const [seleccionada, setSeleccionada] = useState<number | null>(null);

  // Estados del visor / lightbox
  const [mostrarInfo, setMostrarInfo] = useState(true);
  const [zoomActivado, setZoomActivado] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Soporte táctil móvil (Swipe)
  const touchStartX = useRef<number | null>(null);

  const obrasFiltradas = useMemo(() => {
    return obras.filter((o) => {
      const coincideZona = zonaActiva === "todas" || o.zona === zonaActiva;
      const coincideSubzona = subzonaActiva === "todas" || o.subzonaSlug === subzonaActiva;
      const coincideTipo = tipoActivo === "todos" || o.tipo === tipoActivo;
      return coincideZona && coincideSubzona && coincideTipo;
    });
  }, [obras, zonaActiva, subzonaActiva, tipoActivo]);

  const limpiarFiltros = () => {
    setZonaActiva("todas");
    setSubzonaActiva("todas");
    setTipoActivo("todos");
  };

  const hayFiltrosActivos = zonaActiva !== "todas" || subzonaActiva !== "todas" || tipoActivo !== "todos";

  // Objeto de zona y subzona actual para el recordatorio
  const zonaActual = zonas.find((z) => z.slug === zonaActiva);
  const subzonaActual = zonaActual?.subzonas.find((s) => s.slug === subzonaActiva);

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

  const copiarEnlace = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const obraActual = seleccionada !== null ? obrasFiltradas[seleccionada] : null;
  const urlObraActual = obraActual ? `${siteConfig.url}/obras#${obraActual.id}` : "";
  const mensajeWhatsApp = obraActual
    ? `Hola GMS Integra, vi la obra «${obraActual.titulo}» en ${obraActual.ubicacionDetalle} y deseo cotizar un proyecto similar.`
    : "";

  return (
    <div className="flex flex-col gap-8">
      
      {/* ── Panel de Filtros Jerárquicos ── */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
        <FiltroZonas
          zonas={zonas}
          zonaActiva={zonaActiva}
          subzonaActiva={subzonaActiva}
          tipoActivo={tipoActivo}
          onSeleccionarZona={setZonaActiva}
          onSeleccionarSubzona={setSubzonaActiva}
          onSeleccionarTipo={setTipoActivo}
        />
      </div>

      {/* ── Recordatorio Flotante / Barra de Estado de lo Seleccionado ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#0A1118] px-5 py-3.5 text-white shadow-md border border-white/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="size-2.5 rounded-full bg-[#00c9ff] animate-pulse shrink-0" />
          <div className="flex items-center gap-1.5 text-xs font-black truncate">
            <span className="text-slate-400">Viendo:</span>
            <span className="text-[#00c9ff]">
              {zonaActual?.nombre || "Todas las Zonas"}
            </span>
            {subzonaActiva !== "todas" && subzonaActual && (
              <>
                <span className="text-white/30">/</span>
                <span className="text-white font-bold">{subzonaActual.nombre}</span>
              </>
            )}
            {tipoActivo !== "todos" && (
              <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-emerald-400 border border-white/10 capitalize ml-1">
                {tipoActivo}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-bold text-slate-300">
            {obrasFiltradas.length} {obrasFiltradas.length === 1 ? "proyecto" : "proyectos"}
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
          <h3 className="text-lg font-black text-foreground">No se encontraron proyectos</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            No hay proyectos con los filtros seleccionados. Intenta cambiar de ubicación o tipología.
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
                    ? "bg-[#00c9ff] text-slate-950 border-[#00c9ff]"
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
                    ? "bg-white/20 text-[#00c9ff] border-white/30"
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
              alt={obraActual.titulo}
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
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-[#00c9ff] uppercase tracking-wider mb-1">
                  <MapPin className="size-3.5" />
                  <span>{obraActual.ubicacionDetalle}</span>
                  <span className="text-white/30">·</span>
                  <span className="text-slate-300">{obraActual.zonaNombre}</span>
                  <span className="rounded bg-white/10 px-2 py-0.2 text-[10px] font-bold text-white ml-1">
                    {obraActual.tipoNombre}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white leading-tight font-sans truncate">
                  {obraActual.titulo}
                </h3>

                {obraActual.materiales && obraActual.materiales.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-1.5">
                    {obraActual.materiales.map((mat, i) => (
                      <span
                        key={i}
                        className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-white/10"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>
                )}
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
                    `Mira este proyecto de ${obraActual.titulo} en ${obraActual.ubicacionDetalle}: ${urlObraActual}`
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
