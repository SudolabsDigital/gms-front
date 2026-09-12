"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { WhatsAppIcon } from "./social-icons";
import { Button } from "@/components/ui/button";
import { enlaceDeWhatsApp } from "@/config/site-config";

const INTERVALO_CARRUSEL_MS = 5000;

const PROYECTOS_COLLAGE = [
  {
    id: "san-carlos",
    titulo: "Residencial San Carlos",
    subtitulo: "Mamparas Panorámicas Serie 80 & Línea Spazio",
    ubicacion: "San Carlos, Huancayo",
    span: "col-span-12 lg:col-span-6 row-span-2 min-h-[360px] lg:min-h-[580px]",
    wa: "Hola GMS Integra, vi las obras de Residencial San Carlos y deseo cotizar acabados similares.",
    fotos: [
      "/catalogo/obras-ejecutadas/obras2025-sancarlosjhon25-433.webp",
      "/catalogo/obras-ejecutadas/obras2025-sancarlosjhon25-434.webp",
      "/catalogo/obras-ejecutadas/obras2025-sancarlosjhon25-435.webp",
      "/catalogo/obras-ejecutadas/obras2025-sancarlosjhon25-436.webp",
      "/catalogo/obras-ejecutadas/obras2025-sancarlosjhon25-437.webp",
    ],
  },
  {
    id: "uncp",
    titulo: "Universidad Nacional del Centro (UNCP)",
    subtitulo: "Sistemas Vidriados, Puertas & Divisiones Institucionales",
    ubicacion: "Ciudad Universitaria, Huancayo",
    span: "col-span-12 sm:col-span-6 lg:col-span-3 min-h-[260px] lg:min-h-[290px]",
    wa: "Hola GMS Integra, vi las obras de la UNCP y solicito cotización para proyecto institucional.",
    fotos: [
      "/catalogo/obras-ejecutadas/obras-hyo-sist-uncp-213.webp",
      "/catalogo/obras-ejecutadas/obras-hyo-sist-uncp-214.webp",
      "/catalogo/obras-ejecutadas/obras-hyo-sist-uncp-215.webp",
      "/catalogo/obras-ejecutadas/obras-hyo-sist-uncp-216.webp",
      "/catalogo/obras-ejecutadas/obras-hyo-sist-uncp-217.webp",
    ],
  },
  {
    id: "usil-lima",
    titulo: "Campus USIL Lima",
    subtitulo: "Divisiones Acústicas & Carpintería de Aluminio",
    ubicacion: "Lima Metropolitana",
    span: "col-span-12 sm:col-span-6 lg:col-span-3 min-h-[260px] lg:min-h-[290px]",
    wa: "Hola GMS Integra, solicito cotización para proyecto institucional similar a USIL Lima.",
    fotos: [
      "/catalogo/obras-ejecutadas/obras-lima-u-san-ignacio-de-loyola-350.webp",
      "/catalogo/obras-ejecutadas/obras-lima-u-san-ignacio-de-loyola-351.webp",
      "/catalogo/obras-ejecutadas/obras-lima-u-san-ignacio-de-loyola-352.webp",
      "/catalogo/obras-ejecutadas/obras-lima-u-san-ignacio-de-loyola-353.webp",
      "/catalogo/obras-ejecutadas/obras-lima-u-san-ignacio-de-loyola-354.webp",
    ],
  },
  {
    id: "la-huaycha",
    titulo: "Estación & Grifo La Huaycha",
    subtitulo: "Muros Cortina, Fachadas Integrales & Coberturas",
    ubicacion: "La Huaycha, Junín",
    span: "col-span-12 sm:col-span-6 lg:col-span-3 min-h-[260px] lg:min-h-[290px]",
    wa: "Hola GMS Integra, vi las obras del Grifo La Huaycha y deseo cotizar cerramientos.",
    fotos: [
      "/catalogo/obras-ejecutadas/la-huaycha25-1.webp",
      "/catalogo/obras-ejecutadas/la-huaycha25-2.webp",
      "/catalogo/obras-ejecutadas/la-huaycha25-3.webp",
      "/catalogo/obras-ejecutadas/la-huaycha25-4.webp",
      "/catalogo/obras-ejecutadas/la-huaycha25-5.webp",
    ],
  },
  {
    id: "la-cantuta",
    titulo: "Edificio Residencial La Cantuta",
    subtitulo: "Ventanas Herméticas & Cerramientos Vidriados",
    ubicacion: "San Carlos, Huancayo",
    span: "col-span-12 sm:col-span-6 lg:col-span-3 min-h-[260px] lg:min-h-[290px]",
    wa: "Hola GMS Integra, vi el Edificio La Cantuta y deseo cotizar ventanas herméticas.",
    fotos: [
      "/catalogo/obras-ejecutadas/obras-hyo-edif-la-cantuta-130.webp",
      "/catalogo/obras-ejecutadas/obras-hyo-edif-la-cantuta-147.webp",
      "/catalogo/obras-ejecutadas/obras-hyo-santa-rosa-201.webp",
      "/catalogo/obras-ejecutadas/obras-hyo-santa-rosa-202.webp",
      "/catalogo/obras-ejecutadas/obras-hyo-santa-rosa-203.webp",
    ],
  },
  {
    id: "jauja",
    titulo: "Complejo Hospitalario Jauja",
    subtitulo: "Ventanas Herméticas & Divisiones de Alta Higiene",
    ubicacion: "Jauja, Junín",
    span: "col-span-12 sm:col-span-6 lg:col-span-3 min-h-[260px] lg:min-h-[290px]",
    wa: "Hola GMS Integra, solicito cotización para proyecto similar al Hospital de Jauja.",
    fotos: [
      "/catalogo/obras-ejecutadas/obras-hyo-h-jauja-156.webp",
      "/catalogo/obras-ejecutadas/obras-hyo-h-jauja-157.webp",
      "/catalogo/obras-ejecutadas/obras-hyo-h-jauja-158.webp",
      "/catalogo/obras-ejecutadas/obras-hyo-h-jauja-159.webp",
      "/catalogo/obras-ejecutadas/obras-hyo-h-jauja-160.webp",
    ],
  },
  {
    id: "huallhuas",
    titulo: "Residencial Huallhuas",
    subtitulo: "Techos de Policarbonato & Cerramientos Panorámicos",
    ubicacion: "Huallhuas, Huancayo",
    span: "col-span-12 sm:col-span-6 lg:col-span-3 min-h-[260px] lg:min-h-[290px]",
    wa: "Hola GMS Integra, vi las obras en Huallhuas y solicito cotización.",
    fotos: [
      "/catalogo/obras-ejecutadas/obrahuallhuas25-13.webp",
      "/catalogo/obras-ejecutadas/obrahuallhuas25-14.webp",
      "/catalogo/obras-ejecutadas/obrahuallhuas25-15.webp",
      "/catalogo/obras-ejecutadas/obrahuallhuas25-16.webp",
      "/catalogo/obras-ejecutadas/obrahuallhuas25-17.webp",
    ],
  },
  {
    id: "el-tambo",
    titulo: "Edificios Av. Evitamiento",
    subtitulo: "Ventanas Serie 25 / 38 & Barandas Inox 304",
    ubicacion: "El Tambo, Huancayo",
    span: "col-span-12 lg:col-span-6 row-span-2 min-h-[360px] lg:min-h-[580px]",
    wa: "Hola GMS Integra, solicito cotización para edificio multifamiliar en El Tambo.",
    fotos: [
      "/catalogo/obras-ejecutadas/obras-hyo-evitamiento-136.webp",
      "/catalogo/obras-ejecutadas/obras-hyo-evitamiento-137.webp",
      "/catalogo/obras-ejecutadas/obras-hyo-evitamiento-138.webp",
      "/catalogo/obras-ejecutadas/obras-hyo-evitamiento-139.webp",
      "/catalogo/obras-ejecutadas/obras-hyo-evitamiento-140.webp",
    ],
  },
  {
    id: "primavera",
    titulo: "Residencial Primavera 2025",
    subtitulo: "Mamparas Panorámicas & Fachadas Integrales",
    ubicacion: "Huancayo Metropolitano",
    span: "col-span-12 sm:col-span-6 lg:col-span-3 min-h-[260px] lg:min-h-[290px]",
    wa: "Hola GMS Integra, vi Residencial Primavera 2025 y solicito cotización.",
    fotos: [
      "/catalogo/obras-ejecutadas/obras2025-primavera25-415.webp",
      "/catalogo/obras-ejecutadas/obras2025-primavera25-416.webp",
      "/catalogo/obras-ejecutadas/obras2025-primavera25-417.webp",
      "/catalogo/obras-ejecutadas/obras2025-primavera25-418.webp",
      "/catalogo/obras-ejecutadas/obras2025-primavera25-419.webp",
    ],
  },
  {
    id: "raez",
    titulo: "Estructuras & Coberturas Ráez",
    subtitulo: "Ingeniería en Fierro Estructural & Policarbonato Alveolar",
    ubicacion: "Chilca, Huancayo",
    span: "col-span-12 sm:col-span-6 lg:col-span-3 min-h-[260px] lg:min-h-[290px]",
    wa: "Hola GMS Integra, solicito cotización para estructuras y techos de policarbonato.",
    fotos: [
      "/catalogo/obras-ejecutadas/obras-hyo-raez-estructura-metalica-162.webp",
      "/catalogo/obras-ejecutadas/obras-hyo-raez-estructura-metalica-163.webp",
      "/catalogo/obras-ejecutadas/obras-hyo-raez-estructura-metalica-164.webp",
      "/catalogo/obras-ejecutadas/obras-hyo-raez-estructura-metalica-165.webp",
      "/catalogo/obras-ejecutadas/obras-hyo-raez-estructura-metalica-166.webp",
    ],
  },
];

export function AboutWorkshop() {
  const [slideGlobalIdx, setSlideGlobalIdx] = useState(0);

  // Transición sincronizada en grupo (Efecto cortina simultáneo)
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideGlobalIdx((prev) => (prev + 1) % 5);
    }, INTERVALO_CARRUSEL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <section id="obras" className="relative border-b border-border overflow-hidden bg-slate-950">
      
      {/* ── Barra Superior Integrada en el Collage ── */}
      <div className="w-full bg-[#0A1118] px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="size-2.5 rounded-full bg-brand animate-pulse" />
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white font-sans">
            Proyectos Ejecutados
          </h2>
          <span className="text-xs text-slate-400 hidden sm:inline">
            · Obras en Huancayo, Junín y Lima
          </span>
        </div>

        {/* Indicadores Sincronizados de Cortina */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4].map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSlideGlobalIdx(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === slideGlobalIdx
                    ? "w-7 bg-brand"
                    : "w-2 bg-white/30 hover:bg-white/60"
                }`}
                aria-label={`Ver secuencia ${idx + 1}`}
              />
            ))}
          </div>

          <Button
            size="sm"
            asChild
            className="rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 text-white h-8 px-3.5"
          >
            <Link href="/obras">
              <span>Ver todas las obras</span>
              <ArrowRight className="size-3 ml-1" />
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Collage Fotográfico de Ancho Completo (10 Grandes Proyectos) ── */}
      <div className="grid grid-cols-12 auto-rows-fr w-full gap-[2px] bg-white/10">
        {PROYECTOS_COLLAGE.map((proyecto) => {
          return (
            <div
              key={proyecto.id}
              className={`group relative overflow-hidden bg-slate-950 flex flex-col justify-end ${proyecto.span}`}
            >
              {/* Fotos en Transición Sincronizada */}
              {proyecto.fotos.map((foto, fIdx) => {
                const esActiva = fIdx === slideGlobalIdx;
                return (
                  <div
                    key={fIdx}
                    className={`absolute inset-0 size-full transition-opacity duration-1000 ease-in-out ${
                      esActiva ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-104 pointer-events-none"
                    }`}
                  >
                    <Image
                      src={foto}
                      alt={`${proyecto.titulo} - Toma ${fIdx + 1}`}
                      fill
                      priority={fIdx === 0}
                      className="size-full object-cover object-center transition-transform duration-1000 group-hover:scale-106 brightness-[0.93]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    />
                  </div>
                );
              })}

              {/* Scrim Oscuro Sutil en la Base */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent z-20 pointer-events-none" />

              {/* Badge de Ubicación Superior */}
              <div className="absolute top-3.5 left-3.5 z-30">
                <div className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-0.8 text-[10px] font-mono font-bold text-white backdrop-blur-md border border-white/15">
                  <MapPin className="size-2.5 text-brand" />
                  <span>{proyecto.ubicacion}</span>
                </div>
              </div>

              {/* Contenido Limpio y Acciones Rápidas en la Base */}
              <div className="relative z-30 p-4 sm:p-5">
                <h3 className="text-base sm:text-lg lg:text-xl font-black uppercase tracking-tight text-white leading-tight font-sans drop-shadow-md">
                  {proyecto.titulo}
                </h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                  {proyecto.subtitulo}
                </p>

                {/* Acciones en Hover */}
                <div className="mt-3 flex items-center gap-2 max-h-0 opacity-0 group-hover:max-h-12 group-hover:opacity-100 transition-all duration-300 overflow-hidden">
                  <a
                    href={enlaceDeWhatsApp(proyecto.wa)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-md transition-all active:scale-95"
                  >
                    <WhatsAppIcon className="size-3.5 text-white" />
                    <span>Cotizar</span>
                  </a>

                  <Link
                    href="/obras"
                    className="inline-flex items-center gap-1 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1.5 text-[11px] font-bold text-white transition-colors"
                  >
                    <span>Ver Galería</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
}
