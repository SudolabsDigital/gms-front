"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WhatsAppIcon } from "./social-icons";
import { Button } from "@/components/ui/button";

const LINEAS_FABRICACION = [
  {
    id: "mamparas",
    titulo: "Mamparas Panorámicas Serie 80",
    categoriaSlug: "mamparas",
    descripcion: "Vanos monumentales piso a techo con cristal templado de 8mm a 10mm y riel pesado.",
    image: "/catalogo/mamparas/m-arenado-1.webp",
    span: "md:col-span-2 h-[320px] sm:h-[360px]",
    waMessage: "Hola GMS Integra, solicito cotización para Mamparas Monumentales Serie 80 en Huancayo.",
  },
  {
    id: "ventanas",
    titulo: "Ventanas Herméticas & Acústicas",
    categoriaSlug: "ventanas",
    descripcion: "Series 20, 25, 38 Batiente y PVC con felpa perimetral y empaques EPDM anti-frío.",
    image: "/catalogo/ventanas/serie80-3.webp",
    span: "md:col-span-1 h-[320px] sm:h-[360px]",
    waMessage: "Hola GMS Integra, solicito cotización para Ventanas Herméticas en Huancayo.",
  },
  {
    id: "puertas",
    titulo: "Línea Spazio & Cabinas de Ducha",
    categoriaSlug: "puertas",
    descripcion: "Cristal templado con herrajes en acero inoxidable 304 y perfilería de aluminio compuesto.",
    image: "/catalogo/puertas/p-aluminio-compuesto-3.webp",
    span: "md:col-span-1 h-[320px] sm:h-[360px]",
    waMessage: "Hola GMS Integra, solicito cotización para Cabinas de Ducha y Puertas Spazio en Huancayo.",
  },
  {
    id: "fachadas",
    titulo: "Fachadas Integrales & Muros Cortina",
    categoriaSlug: "fachadas-muros-cortina",
    descripcion: "Vidrio laminado estructural y panel de aluminio compuesto para frentes comerciales.",
    image: "/catalogo/fachadas-muros-cortina/general-3.webp",
    span: "md:col-span-1 h-[300px] sm:h-[340px]",
    waMessage: "Hola GMS Integra, solicito cotización para Muros Cortina y Fachadas en Huancayo.",
  },
  {
    id: "barandas",
    titulo: "Barandas de Acero & Cristal",
    categoriaSlug: "barandas",
    descripcion: "Sistemas en acero inoxidable 304 y cristal templado para balcones, escaleras y terrazas.",
    image: "/catalogo/barandas/b-acero-2.webp",
    span: "md:col-span-1 h-[300px] sm:h-[340px]",
    waMessage: "Hola GMS Integra, solicito cotización para Barandas de Acero y Cristal en Huancayo.",
  },
  {
    id: "techos",
    titulo: "Techos & Coberturas en Policarbonato",
    categoriaSlug: "techos-policarbonato",
    descripcion: "Policarbonato alveolar y compacto con protección UV y techos corredizos a medida.",
    image: "/catalogo/techos-policarbonato/techo-aluminio-2.webp",
    span: "md:col-span-2 h-[300px] sm:h-[340px]",
    waMessage: "Hola GMS Integra, solicito cotización para Techos de Policarbonato en Huancayo.",
  },
  {
    id: "divisiones",
    titulo: "Divisiones de Oficina & Panelería",
    categoriaSlug: "divisiones",
    descripcion: "Mamparas divisorias vidriadas y tabiquería acústica para espacios corporativos.",
    image: "/catalogo/divisiones/general-1.webp",
    span: "md:col-span-2 h-[280px] sm:h-[320px]",
    waMessage: "Hola GMS Integra, solicito cotización para Divisiones de Oficina en Huancayo.",
  },
  {
    id: "materiales",
    titulo: "Catálogo de Materiales & Perfiles",
    categoriaSlug: "catalogo-materiales",
    descripcion: "Perfiles pesados de aluminio en diversos acabados, cristales y herrajes certificados.",
    image: "/catalogo/catalogo-materiales/a-compuesto-1.webp",
    span: "md:col-span-2 h-[280px] sm:h-[320px]",
    waMessage: "Hola GMS Integra, solicito información del Catálogo de Materiales y Perfiles.",
  },
];

export function Products() {
  return (
    <section
      id="servicios"
      className="relative bg-background text-foreground border-b border-border overflow-hidden py-12 sm:py-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera Limpia */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-border">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-foreground font-sans">
              Líneas de Fabricación
            </h2>
          </div>
          <Button variant="outline" size="sm" asChild className="rounded-xl font-bold text-xs shrink-0">
            <Link href="/catalogo">
              <span>Ver Catálogo Completo</span>
              <ArrowRight className="size-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>

        {/* ── Cuadrícula Fotográfica Limpia (Bento Grid Visual-First) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {LINEAS_FABRICACION.map((linea) => (
            <div
              key={linea.id}
              className={`group relative overflow-hidden rounded-2xl border border-border/80 bg-slate-950 shadow-xs transition-all duration-500 hover:shadow-2xl hover:border-primary/50 flex flex-col justify-end ${linea.span}`}
            >
              {/* Fotografía en Alta Definición */}
              <Image
                src={linea.image}
                alt={linea.titulo}
                fill
                className="absolute inset-0 size-full object-cover object-center transition-transform duration-700 group-hover:scale-106 brightness-95"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />

              {/* Scrim Oscuro Sutil de Contraste */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-black/10 transition-opacity duration-300 group-hover:from-black/95" />

              {/* Contenido Limpio en la Base de la Tarjeta */}
              <div className="relative z-10 p-5 sm:p-6">
                
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white leading-tight font-sans drop-shadow-md">
                  {linea.titulo}
                </h3>

                <p className="text-xs text-slate-300 mt-1.5 line-clamp-1">
                  {linea.descripcion}
                </p>

                {/* Acciones Rápidas en la Tarjeta */}
                <div className="mt-4 flex items-center gap-2.5">
                  <Link
                    href={`/catalogo/${linea.categoriaSlug}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-3.5 py-1.5 text-xs font-bold text-white transition-colors"
                  >
                    <span>Ver Modelos</span>
                    <ArrowRight className="size-3" />
                  </Link>

                  <a
                    href={`https://wa.me/51958413806?text=${encodeURIComponent(linea.waMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center size-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95"
                    title="Cotizar por WhatsApp"
                    aria-label={`Cotizar ${linea.titulo} por WhatsApp`}
                  >
                    <WhatsAppIcon className="size-4 text-white" />
                  </a>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
