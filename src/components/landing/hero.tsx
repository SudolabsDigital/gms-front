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
import { enlaceDeWhatsApp } from "@/config/site-config";

const SLIDE_DURATION_MS = 12000;

const SLIDES = [
  {
    id: "fachadas",
    title: "Muros cortina y panel ACM",
    subtitle:
      "Fachada integral en panel compuesto de aluminio con paños de cristal fijados por silicona estructural. Ingenieria de junta y anclaje calculada por vano.",
    image: "/hero/muro-cortina-acm.webp",
    alt: "Edificio de fachada en panel compuesto de aluminio blanco con muro cortina de cristal azul",
    ancho: 961,
    alto: 1920,
    waMessage:
      "Hola GMS Integra, solicito cotizacion para Muro Cortina y fachada en panel ACM en Huancayo.",
  },
  {
    id: "curvas",
    title: "Ventanas curvas y mamparas de esquina",
    subtitle:
      "Perfil curvado en obra para vanos continuos de esquina, con cristal templado y rodaje de alta resistencia. El vano manda: no hay medida de catalogo.",
    image: "/hero/ventanas-curvas-esquina.webp",
    alt: "Edificio con ventanas curvas panoramicas de aluminio en la esquina, cuatro niveles",
    ancho: 1080,
    alto: 805,
    waMessage:
      "Hola GMS Integra, solicito cotizacion para Ventanas Curvas y mamparas de esquina en Huancayo.",
  },
  {
    id: "barandas",
    title: "Barandas y balcones en cristal templado",
    subtitle:
      "Cierre de balcon en cristal templado con perfileria vista de aluminio, medido piso a piso sobre la obra terminada.",
    image: "/hero/fachada-balcones-vidrio.webp",
    alt: "Edificio residencial blanco de siete niveles con barandas de cristal templado en los balcones",
    ancho: 1433,
    alto: 1080,
    waMessage:
      "Hola GMS Integra, solicito cotizacion para Barandas y cierres de balcon en cristal templado en Huancayo.",
  },
];

export function Hero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const current = SLIDES[activeIdx];
  /*
   * AQUI HUBO UN `orientacionDe()` Y SE RETIRO EL MISMO DIA.
   *
   * La idea era deducir la forma de la foto para decidir el encuadre, reutilizando el mecanismo
   * de las tarjetas. Al meter la imagen en su marco con `object-contain` dejo de decidir nada:
   * `contain` ya resuelve TODAS las proporciones sin clasificarlas. Se quita en vez de dejarlo
   * calculando un valor que nadie lee.
   */

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

      {/*
        DOS COLUMNAS, Y EL ORDEN SE INVIERTE CON EL ANCHO.

        Escritorio: 30 % de texto a la izquierda sobre azul noche, 70 % de imagen a la derecha.
        Movil: se apilan y la imagen va PRIMERO — es la obra la que vende, el texto la explica.

        La galeria de miniaturas que habia debajo se retiro el 2026-09-12: repetia las tres fotos
        que ya estan en el carrusel y se comia ~110 px de altura. Ese espacio es ahora del hero.
        La navegacion vive en las flechas y en el contador, que no ocupan fila propia.
      */}
      <div className="grid md:grid-cols-[3fr_7fr] md:min-h-[clamp(560px,78vh,820px)]">

        {/* ── 30 % · el texto, sobre el azul del footer ───────────────────── */}
        <div className="order-2 md:order-1 flex flex-col justify-center gap-5 bg-superficie-profunda px-5 sm:px-7 lg:px-9 py-10 md:py-12">
          <p className="flex items-baseline gap-2.5">
            <span className="font-marca text-xl font-semibold titular-contorno">GMS Integra</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
              Huancayo
            </span>
          </p>

          <h1 className="text-[clamp(1.75rem,2.6vw,2.6rem)] font-black uppercase tracking-tight leading-[1.05] font-sans titular-contorno text-balance">
            {current.title}
          </h1>

          <p className="text-sm lg:text-[0.95rem] text-slate-300 leading-relaxed">
            {current.subtitle}
          </p>

          <Button
            size="lg"
            className="h-12 px-6 text-xs font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-cta gap-2.5 transition-all cursor-pointer active:translate-y-0.5 self-stretch sm:self-start md:self-stretch"
            asChild
          >
            <a
              href={enlaceDeWhatsApp(current.waMessage)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="size-4.5" />
              <span>Cotizar esta Línea</span>
              <ArrowRight className="size-3.5" />
            </a>
          </Button>

          {/* Contador y flechas: la navegacion que antes ocupaba una fila entera */}
          <div className="flex items-center gap-4 pt-1">
            <span className="font-mono text-[11px] tracking-[0.2em] text-slate-400 tabular-nums">
              {String(activeIdx + 1).padStart(2, "0")}
              <span className="text-brand-linea"> / </span>
              {String(SLIDES.length).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                aria-label="Obra anterior"
                className="size-9 rounded-full border border-white/25 text-white hover:bg-white hover:text-superficie-profunda flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="size-4.5" />
              </button>
              <button
                onClick={nextSlide}
                aria-label="Obra siguiente"
                className="size-9 rounded-full border border-white/25 text-white hover:bg-white hover:text-superficie-profunda flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="size-4.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── 70 % · la imagen, a sangre sobre lienzo oscuro ─────────────── */}
        <div className="order-1 md:order-2 relative h-[46vh] min-h-[300px] md:h-auto bg-superficie-profunda">
          {/*
            PORTADA, NO CUADRO.

            El marco con escuadras se retiro el 2026-09-12: la ceremonia no aportaba y se comia
            espacio. Ahora la obra ocupa toda la altura del hero sobre el mismo azul del texto, de
            modo que las dos columnas son una sola pieza y no dos bloques pegados.

            Sigue en `object-contain`: la foto se ve ENTERA, toque el ancho o el alto. Lo que antes
            era aire blanco alrededor es ahora ese azul, asi que el espacio sobrante deja de leerse
            como hueco y pasa a ser fondo.
          */}
          <Image
            src={current.image}
            alt={current.alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 75vw"
            className="object-contain object-center p-3 md:p-4 transition-all duration-700"
          />
        </div>
      </div>

      {/* Progreso del pase automatico */}
      <div className="relative z-30 w-full h-[3px] bg-border/40 overflow-hidden">
        <div key={activeIdx} className="h-full bg-primary animate-gms-progress" />
      </div>

    </section>
  );
}
