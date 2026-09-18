"use client";

import { useState, useEffect, useCallback, type CSSProperties } from "react";
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
      style={{ "--duracion-plano": `${SLIDE_DURATION_MS}ms` } as CSSProperties}
    >
      {/*
        DOS COLUMNAS, Y EL ORDEN SE INVIERTE CON EL ANCHO.

        Escritorio: 30 % de texto a la izquierda sobre azul noche, 70 % de imagen a la derecha.
        Movil: se apilan y la imagen va PRIMERO — es la obra la que vende, el texto la explica.

        La galeria de miniaturas que habia debajo se retiro el 2026-09-12: repetia las tres fotos
        que ya estan en el carrusel y se comia ~110 px de altura. Ese espacio es ahora del hero.
        La navegacion vive en las flechas y en el contador, que no ocupan fila propia.
      */}
      <div className="relative grid md:grid-cols-[3fr_7fr] md:min-h-[clamp(560px,78vh,820px)]">

        {/* ── 30 % · el texto, sobre el azul del footer ───────────────────── */}
        <div className="order-2 md:order-1 flex flex-col justify-center gap-5 bg-superficie-profunda px-5 sm:px-7 lg:px-9 py-10 md:py-12">
          {/*
            SOLO EL ROTULO SE REMONTA CON CADA PLANO.

            `key={activeIdx}` es lo que reinicia la animacion de entrada, y remontar destruye los
            nodos. Cuando la clave envolvia la columna entera, «Obra siguiente» se destruia al
            pulsarlo y el foco del teclado caia a `<body>` —medido en el navegador el 2026-09-12—,
            y el CTA lo perdia ademas cada 12 s con el pase automatico. El CTA y la navegacion
            quedan fuera: cambian de destino, no de nodo.
          */}
          <div key={activeIdx} className="gms-rotulo flex flex-col gap-5">
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
          </div>

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

        {/* ── 70 % · el plano ─────────────────────────────────────────────── */}
        <div className="order-1 md:order-2 relative overflow-hidden bg-superficie-profunda h-[46vh] min-h-[300px] md:h-auto">
          {/*
            TRES PLANOS SUPERPUESTOS, NO UNO QUE CAMBIA DE `src`.

            Los tres estan en el DOM y solo cambia la opacidad, que es lo que da el fundido de
            montaje en vez del corte seco de antes. Cuestan 563 KB entre las tres y solo la
            primera lleva `priority`: las otras dos entran despues del LCP.

            Cada plano trae SU PROPIA caja con `aspect-ratio`, porque las tres obras tienen
            proporciones distintas (0,50 · 1,34 · 1,33) y una sola caja deformaria dos de ellas.
          */}
          {SLIDES.map((slide, idx) => {
            const activo = idx === activeIdx;
            return (
              <div
                key={slide.id}
                aria-hidden={!activo}
                className={`absolute inset-4 md:inset-6 flex items-center justify-center transition-opacity duration-[900ms] ease-in-out ${
                  activo ? "opacity-100" : "opacity-0"
                }`}
              >
                <div
                  className="relative h-full max-h-full w-auto max-w-full"
                  style={{ aspectRatio: `${slide.ancho} / ${slide.alto}` }}
                >
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    priority={idx === 0}
                    sizes="(max-width: 768px) 100vw, 70vw"
                    /*
                      EL ETALONAJE, EN UNA LINEA.
                      Las tres obras se fotografiaron en dias distintos: dos con cielo plomizo y
                      una con azul intenso. Bajar saturacion, subir contraste y aclarar un punto
                      las lleva al mismo registro, que es lo que hace que se lean como una serie
                      y no como tres fotos sueltas.
                    */
                    className={`object-contain [filter:saturate(0.88)_contrast(1.09)_brightness(1.03)] ${
                      activo ? (idx % 2 === 0 ? "gms-plano-a" : "gms-plano-b") : ""
                    }`}
                  />

                  {/* Etalonaje frio: tine las sombras hacia el azul de la marca sin apagar las luces. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-primary/20 mix-blend-soft-light"
                  />
                </div>
              </div>
            );
          })}

        </div>

        {/*
          LUZ DE ESCENA, SOBRE LAS DOS COLUMNAS.

          Antes esta vineta vivia solo dentro del 70 % y ahi estaba el defecto: oscurecia el borde
          que toca la columna de texto, asi que las dos mitades —del MISMO color— parecian dos
          contenedores pegados. Una costura que no existia en el dato, solo en la luz.

          Ahora cubre el hero entero. La luz no respeta divisiones de layout: hunde las cuatro
          esquinas de la escena y deja el centro limpio, que es lo que hace que se lea como un
          plano y no como dos cajas.
        */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 [background:radial-gradient(125%_105%_at_50%_45%,transparent_50%,rgba(6,14,28,0.38)_100%)]"
        />
      </div>

      {/* Progreso del pase automatico */}
      <div className="relative z-30 w-full h-[3px] bg-border/40 overflow-hidden">
        <div key={activeIdx} className="h-full bg-primary animate-gms-progress" />
      </div>

    </section>
  );
}
