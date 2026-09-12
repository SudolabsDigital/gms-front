"use client";

import Image from "next/image";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { WhatsAppIcon } from "./social-icons";
import { Button } from "@/components/ui/button";
import { enlaceDeWhatsApp } from "@/config/site-config";

const TODAS_LAS_MARCAS = [
  {
    id: "miyasato",
    nombre: "Corporación Miyasato",
    logoSrc: "/suppliers/miyasato.webp",
    categoria: "Aluminio Pesado",
    beneficio: "Perfiles Series 20, 25, 38 y 80 con máxima rigidez estructural.",
    origen: "Lima · Extrusión Nacional",
  },
  {
    id: "sika",
    nombre: "Sika Perú",
    logoSrc: "/suppliers/sika.webp",
    categoria: "Sellantes Estructurales",
    beneficio: "Siliconas y poliuretano 100% estanco contra lluvias andinas.",
    origen: "Planta Lurín, Lima",
  },
  {
    id: "herralum",
    nombre: "Herralum Industrial",
    logoSrc: "/suppliers/herralum.webp",
    categoria: "Acero Inoxidable 304",
    beneficio: "Rodamientos suspendidos y tiradores quirúrgicos anti-óxido.",
    origen: "Herrajes de Alta Gama",
  },
  {
    id: "furukawa",
    nombre: "Furukawa Glass",
    logoSrc: "/suppliers/furukawa.svg",
    categoria: "Cristales de Seguridad",
    beneficio: "Laminados acústicos y templados de alta resistencia térmica.",
    origen: "Certificación Internacional",
  },
  {
    id: "corp-huancayo",
    nombre: "Corporación Huancayo",
    logoSrc: "/suppliers/corp_huancayo.webp",
    categoria: "Suministro Regional",
    beneficio: "Stock permanente de perfiles y cristales para entrega sin demoras.",
    origen: "Huancayo · Junín",
  },
  {
    id: "vidrieria-centro",
    nombre: "Vidriería Centro",
    logoSrc: "/suppliers/vidrieria_centro.webp",
    categoria: "Distribución Regional",
    beneficio: "Flota propia de abastecimiento de cristal en el Valle del Mantaro.",
    origen: "Chilca · Huancayo",
  },
  {
    id: "santa-ana",
    nombre: "Santa Ana V&A",
    logoSrc: "/suppliers/santa_ana.webp",
    categoria: "Perfilería & Accesorios",
    beneficio: "Insumos y accesorios mayoristas con distribución continua.",
    origen: "Lima / Junín",
  },
  {
    id: "alumex",
    nombre: "Alumex Extrusiones",
    logoSrc: "/suppliers/alumex.svg",
    categoria: "Extrusión de Aluminio",
    beneficio: "Perfiles pesados con anodizado y acabados electrostáticos.",
    origen: "Planta Industrial",
  },
];

export function AnatomySection() {
  return (
    <section
      id="materiales"
      className="relative bg-background text-foreground border-b border-border py-12 sm:py-16 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Cabecera Limpia ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-border">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-primary">
              Garantía de Origen & Calidad de Insumos
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-foreground font-sans mt-1">
              Materiales & Proveedores
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md font-normal leading-relaxed">
            Sin perfiles reciclados ni selladores genéricos. Fabricamos exclusivamente con marcas líderes para garantizar durabilidad de por vida.
          </p>
        </div>

        {/* ── Cuadrícula de Todas las 8 Marcas con Escenario Oscuro y Máxima Jerarquía al Logo ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {TODAS_LAS_MARCAS.map((prov) => (
            <div
              key={prov.id}
              className="flex flex-col justify-between rounded-2xl bg-card border border-border/80 p-4 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
            >
              <div>
                {/* Escenario Oscuro Sólido de Alto Contraste para el Logo */}
                <div className="w-full h-[115px] sm:h-[125px] rounded-xl bg-slate-950 border border-slate-800/80 p-3.5 flex items-center justify-center mb-3.5 transition-all duration-300 group-hover:border-primary/50">
                  <Image
                    src={prov.logoSrc}
                    alt={`Logotipo de ${prov.nombre}`}
                    width={200}
                    height={70}
                    className="max-h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-108 brightness-105 contrast-105"
                  />
                </div>

                {/* Categoría y Título de Marca */}
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary truncate">
                    {prov.categoria}
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground truncate">
                    {prov.origen.split("·")[0]}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-black uppercase text-foreground font-sans leading-tight">
                  {prov.nombre}
                </h4>

                {/* Beneficio Comercial que Vende */}
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {prov.beneficio}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Banner de Cierre con Asesoría de Materiales ── */}
        <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-secondary border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shrink-0 shadow-xs">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-foreground font-sans">
                ¿Deseas conocer la ficha técnica o cotizar con materiales certificados?
              </p>
              <p className="text-[11px] text-muted-foreground">
                Te asesoramos con la serie de perfiles y cristales idóneos para tu obra en Huancayo.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            className="rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 h-9 px-5 gap-2 cursor-pointer active:translate-y-0.5 shadow-cta"
            asChild
          >
            <a
              href={enlaceDeWhatsApp("Hola GMS Integra, deseo cotizar ventanas y mamparas con materiales certificados para mi obra.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="size-4" />
              <span>Consultar Materiales</span>
              <ArrowRight className="size-3" />
            </a>
          </Button>
        </div>

      </div>
    </section>
  );
}
