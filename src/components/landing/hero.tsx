"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { WhatsAppIcon } from "./social-icons";
import { Button } from "@/components/ui/button";

const SLIDE_DURATION_MS = 12000;

const SLIDES = [
  {
    id: "mamparas",
    title: "Mamparas Panorámicas Serie 80",
    subtitle:
      "Vanos monumentales piso a techo con cristal templado de 8mm a 10mm, perfiles pesados de aluminio y rodaje de alta resistencia.",
    image: "/catalogo/mamparas/m-vaiven-templado-80.webp",
    waMessage:
      "Hola GMS Integra, solicito cotización para Mamparas Monumentales Serie 80 en Huancayo.",
  },
  {
    id: "banos",
    title: "Línea Spazio & Puertas de Ducha",
    subtitle:
      "Divisiones y puertas de cristal templado de 8mm con herrajes en acero inoxidable 304 de seguridad, sellado hermético contra filtraciones.",
    image: "/catalogo/puertas/p-vidrio-templado-153.webp",
    waMessage:
      "Hola GMS Integra, solicito cotización para Mamparas de Baño Línea Spazio en Huancayo.",
  },
  {
    id: "fachadas",
    title: "Muros Cortina & Fachadas Integrales",
    subtitle:
      "Ingeniería estructural en vidrio laminado y templado con silicona estructural para edificios comerciales y residenciales.",
    image: "/catalogo/obras-ejecutadas/obras-hyo-edif-la-cantuta-130.webp",
    waMessage:
      "Hola GMS Integra, solicito cotización para Muros Cortina en Huancayo.",
  },
  {
    id: "ventanas",
    title: "Ventanas Herméticas Serie 20 / 25 / 38",
    subtitle:
      "Corte milimétrico por matriz con felpa perimetral y empaque EPDM para tolerancia cero al frío, viento y ruido exterior.",
    image: "/catalogo/obras-ejecutadas/obras-hyo-uncp-sistemas-ventanas-273.webp",
    waMessage:
      "Hola GMS Integra, solicito cotización para Ventanas Herméticas en Huancayo.",
  },
];

export function Hero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const current = SLIDES[activeIdx];

  const nextSlide = useCallback(() => {
    setActiveIdx((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = useCallback(() => {
    setActiveIdx((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  }, []);

  // Temporizador de 12 segundos para cambio de página automático
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION_MS);

    return () => clearInterval(timer);
  }, [nextSlide, activeIdx]);

  return (
    <section
      id="inicio"
      className="relative bg-background text-foreground border-b border-border overflow-hidden"
    >
      {/* Estilo para la animación lineal suave de 12 segundos */}
      <style>{`
        @keyframes gmsSlideProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-gms-progress {
          animation: gmsSlideProgress ${SLIDE_DURATION_MS}ms linear forwards;
        }
      `}</style>

      {/* Escenario Slider Principal Panorámico con Textos Abajo a la Izquierda */}
      <div className="relative min-h-[580px] lg:min-h-[660px] w-full flex items-end justify-start">
        
        {/* Fotografía de Fondo con Máxima Amplitud y Claridad */}
        <div className="absolute inset-0 size-full z-0">
          <Image
            src={current.image}
            alt={`${current.title} - GMS Integra`}
            fill
            priority
            className="size-full object-cover object-center transition-all duration-700 brightness-[0.97]"
            sizes="100vw"
          />
          {/* Degradado tenue de base y lateral inferior para legibilidad sin opacar la foto */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
        </div>

        {/* Contenido Anclado en la Esquina Inferior Izquierda */}
        <div className="relative z-20 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-14 pt-32">
          <div className="max-w-2xl text-left">
            
            <h1 className="text-3xl sm:text-5xl lg:text-[4rem] font-black uppercase tracking-tight text-white leading-[1.02] font-sans [text-shadow:0_3px_16px_rgba(0,0,0,0.85)]">
              {current.title}
            </h1>

            <p className="mt-3.5 text-sm sm:text-base lg:text-lg text-slate-100 font-normal leading-relaxed max-w-xl [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]">
              {current.subtitle}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Button
                size="lg"
                className="h-12 px-8 text-xs font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-cta gap-2.5 transition-all cursor-pointer active:translate-y-0.5"
                asChild
              >
                <a
                  href={`https://wa.me/51958413806?text=${encodeURIComponent(current.waMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon className="size-4.5" />
                  <span>Cotizar esta Línea</span>
                  <ArrowRight className="size-3.5" />
                </a>
              </Button>
            </div>

          </div>
        </div>

        {/* Flechas de Navegación Esquinadas a la Derecha */}
        <div className="hidden sm:flex absolute right-6 bottom-14 z-30 items-center gap-2">
          <button
            onClick={prevSlide}
            aria-label="Slide anterior"
            className="size-10 rounded-full border border-white/30 bg-black/50 hover:bg-primary text-white flex items-center justify-center transition-colors cursor-pointer backdrop-blur-md"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Slide siguiente"
            className="size-10 rounded-full border border-white/30 bg-black/50 hover:bg-primary text-white flex items-center justify-center transition-colors cursor-pointer backdrop-blur-md"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      {/* Línea de Progreso */}
      <div className="relative z-30 w-full h-[3px] bg-border/40 overflow-hidden">
        <div
          key={activeIdx}
          className="h-full bg-primary animate-gms-progress"
        />
      </div>

      {/* Galería Inferior de Miniaturas */}
      <div className="relative z-30 bg-background/95 px-4 sm:px-6 lg:px-8 py-3">
        <div className="mx-auto max-w-7xl grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SLIDES.map((slide, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={slide.id}
                onClick={() => setActiveIdx(idx)}
                className={`relative overflow-hidden p-2.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  isActive
                    ? "border-primary bg-accent shadow-xs"
                    : "border-border bg-secondary/50 hover:bg-secondary hover:border-border"
                }`}
              >
                <div className="relative size-11 rounded-lg overflow-hidden bg-muted shrink-0">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="size-full object-cover"
                    sizes="44px"
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/10 border-2 border-primary rounded-lg" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] font-mono text-primary font-bold block">
                    {`0${idx + 1} //`}
                  </span>
                  <span className="text-xs font-bold text-foreground uppercase truncate block">
                    {slide.title.split(" ")[0]} {slide.title.split(" ")[1] || ""}
                  </span>
                </div>

                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary/20 overflow-hidden">
                    <div
                      key={activeIdx}
                      className="h-full bg-primary animate-gms-progress"
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
