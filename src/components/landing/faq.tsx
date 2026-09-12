"use client";

import Image from "next/image";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "./social-icons";
import { FAQS_VENDIBLES } from "@/config/faq-data";
import { enlaceDeWhatsApp, siteConfig } from "@/config/site-config";

export function Faq() {
  return (
    <section id="faq" className="relative border-b border-border overflow-hidden bg-background">

      {/* Layout de dos paneles equilibrados */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">

        {/* ── Panel Izquierdo (5 columnas): Imagen de Taller Real & Valores de Confianza ── */}
        <div className="lg:col-span-5 relative min-h-[380px] lg:min-h-full overflow-hidden bg-slate-950 flex flex-col justify-between p-6 sm:p-8 lg:p-10">
          
          {/* Imagen de Fondo del Taller */}
          <Image
            src="/catalogo/fachadas-muros-cortina/general-1.webp"
            alt="Taller de Manufactura GMS Integra Huancayo"
            fill
            priority
            className="absolute inset-0 size-full object-cover object-center brightness-[0.62] contrast-105"
            sizes="(max-width: 1024px) 100vw, 40vw"
          />

          {/* Degradado Oscuro Sutil para Legibilidad y Visibilidad del Taller */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/20 z-0 pointer-events-none" />

          {/* Encabezado del Panel */}
          <div className="relative z-10">
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-brand">
              Taller Propio · {siteConfig.direccion.corta}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mt-2 font-sans leading-tight">
              Preguntas Frecuentes
            </h2>
            <div className="mt-3 h-1 w-12 bg-primary rounded-full" />
            <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
              Conoce cómo trabajamos, plazos de entrega, calidades de perfiles y la garantía que protege tu inversión.
            </p>
          </div>

          {/* Bloque Inferior con Stats y Botón */}
          <div className="relative z-10 mt-8 flex flex-col gap-4">
            
            {/* 2 Indicadores de Confianza */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/15 bg-black/60 backdrop-blur-md p-3.5 flex items-center gap-2.5">
                <ShieldCheck className="size-5 text-brand shrink-0" />
                <div>
                  <span className="text-sm font-black text-white font-sans block leading-none">1 AÑO</span>
                  <span className="text-[10px] font-mono text-slate-300 block mt-0.5">Garantía Escrita</span>
                </div>
              </div>

              <div className="rounded-xl border border-white/15 bg-black/60 backdrop-blur-md p-3.5 flex items-center gap-2.5">
                <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-sm font-black text-white font-sans block leading-none">GRATIS</span>
                  <span className="text-[10px] font-mono text-slate-300 block mt-0.5">Medición In-Situ</span>
                </div>
              </div>
            </div>

            {/* CTA Directo a Asesoría por WhatsApp */}
            <Button
              size="lg"
              className="h-11 px-5 text-xs font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-cta gap-2 cursor-pointer w-full active:translate-y-0.5"
              asChild
            >
              <a
                href={enlaceDeWhatsApp("Hola GMS Integra, deseo hacer una consulta técnica para mi obra.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon className="size-4" />
                <span>Consultar por WhatsApp</span>
                <ArrowRight className="size-3.5 ml-auto" />
              </a>
            </Button>

          </div>

        </div>

        {/* ── Panel Derecho (7 columnas): Acordeón de Ventas & Respuestas Claras ── */}
        <div className="lg:col-span-7 bg-background flex flex-col justify-center py-8 sm:py-10 px-5 sm:px-8 lg:px-10">

          <Accordion type="single" collapsible defaultValue="item-01" className="w-full">
            {FAQS_VENDIBLES.map((faq) => (
              <AccordionItem
                key={faq.num}
                value={`item-${faq.num}`}
                className="border-b border-border last:border-b-0 group"
              >
                <AccordionTrigger className="text-left py-4 hover:no-underline gap-3 cursor-pointer">
                  <div className="flex items-start gap-3.5 text-left">
                    <span className="text-xs font-mono font-black text-primary shrink-0 pt-0.5 w-6">
                      {faq.num} {"//"}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-foreground leading-snug group-data-[state=open]:text-primary transition-colors">
                      {faq.q}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pb-4 pl-9.5 font-normal">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

        </div>

      </div>
    </section>
  );
}
