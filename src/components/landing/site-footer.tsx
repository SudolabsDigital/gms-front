import Image from "next/image";
import Link from "next/link";
import { Phone, MapPin, ArrowRight, ShieldCheck, Clock } from "lucide-react";

import logo from "@/assets/gms-logo.webp";
import { Button } from "@/components/ui/button";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from "./social-icons";
import { SdlFooter } from "@/components/layout/sdl-footer";
import { enlaceDeWhatsApp } from "@/config/site-config";

export function SiteFooter() {
  return (
    <>
      <footer className="bg-superficie-profunda text-slate-300 border-t border-slate-700">
        {/* Línea superior de acento de marca */}
        <div className="h-1 w-full bg-primary" />

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">

            {/* Columna 1: Marca & Misión (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Image src={logo} alt="GMS Integra - Ventanas y Mamparas" className="size-11 object-contain" />
                <div className="flex flex-col">
                  <span className="text-lg font-black text-white leading-none font-sans">
                    GMS <span className="text-brand">INTEGRA</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                    Carpintería de Aluminio & Vidrio
                  </span>
                </div>
              </div>

              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm font-normal">
                Fabricantes directos de mamparas panorámicas Serie 80, ventanas herméticas anti-frío, muros cortina y carpintería de aluminio en Huancayo y el Valle del Mantaro.
              </p>

              {/* Redes Sociales Oficiales */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://www.facebook.com/profile.php?id=100089261427668"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-9 items-center justify-center rounded bg-[#1877F2] text-white hover:bg-[#166FE5] shadow-[0_3px_0px_#1251A8] active:translate-y-0.5 active:shadow-none transition-all"
                  aria-label="Facebook Oficial GMS Integra"
                >
                  <FacebookIcon className="size-4" />
                </a>
                <a
                  href="https://www.instagram.com/gms_integra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-9 items-center justify-center rounded bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#FD1D1D] text-white hover:brightness-110 shadow-[0_3px_0px_#9B27AF] active:translate-y-0.5 active:shadow-none transition-all"
                  aria-label="Instagram Oficial GMS Integra"
                >
                  <InstagramIcon className="size-4" />
                </a>
                <a
                  href="https://www.tiktok.com/@GMS_INTEGRA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-9 items-center justify-center rounded bg-slate-900 border border-slate-700 text-white hover:bg-black shadow-[0_3px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all"
                  aria-label="TikTok Oficial GMS Integra"
                >
                  <TikTokIcon className="size-4" />
                </a>
                <a
                  href={enlaceDeWhatsApp("Hola GMS Integra, quisiera solicitar información para un proyecto.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-9 items-center justify-center rounded bg-emerald-600 border border-emerald-500/50 text-white hover:bg-emerald-700 shadow-[0_3px_0px_#15803d] active:translate-y-0.5 active:shadow-none transition-all"
                  aria-label="WhatsApp Oficial GMS Integra"
                >
                  <WhatsAppIcon className="size-4" />
                </a>
              </div>
            </div>

            {/* Columna 2: Líneas de Fabricación (3 cols) */}
            <div className="lg:col-span-3 flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-700 pb-2 font-sans">
                Líneas de Fabricación
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs text-slate-400">
                <li><Link href="/catalogo" className="hover:text-white transition-colors text-brand font-bold">→ Ver Catálogo Completo (18 Líneas)</Link></li>
                <li><Link href="/catalogo/mamparas" className="hover:text-white transition-colors">Mamparas Panorámicas Serie 80</Link></li>
                <li><Link href="/catalogo/ventanas" className="hover:text-white transition-colors">Ventanas Herméticas S-20/25/38</Link></li>
                <li><Link href="/catalogo/puertas" className="hover:text-white transition-colors">Línea Spazio & Cabinas de Ducha</Link></li>
                <li><Link href="/catalogo/fachadas-muros-cortina" className="hover:text-white transition-colors">Muros Cortina & Fachadas ACP</Link></li>
                <li><Link href="/catalogo/barandas" className="hover:text-white transition-colors">Barandas de Acero Inox & Cristal</Link></li>
                <li><Link href="/catalogo/techos-policarbonato" className="hover:text-white transition-colors">Techos de Policarbonato & Coberturas</Link></li>
                <li><Link href="/catalogo/catalogo-materiales" className="hover:text-white transition-colors">Catálogo de Materiales & Perfiles</Link></li>
              </ul>
            </div>

            {/* Columna 3: Portafolio & Legal / Blog (2 cols) */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-700 pb-2 font-sans">
                Portafolio & Marco Legal
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs text-slate-400">
                <li><Link href="/obras" className="hover:text-white transition-colors text-slate-200 font-semibold">Galeria de 472 Obras</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors font-semibold text-sky-400">→ Blog & Guías Técnicas</Link></li>
                <li><Link href="/terminos-y-condiciones" className="hover:text-white transition-colors">Términos & Condiciones</Link></li>
                <li><Link href="/politica-de-privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
                <li><Link href="/blog/etiqueta/normativa" className="hover:text-white transition-colors text-amber-400/90 font-medium">Normativas NTP & Garantía</Link></li>
                <li><Link href="/#faq" className="hover:text-white transition-colors">Preguntas Frecuentes</Link></li>
              </ul>
            </div>

            {/* Columna 4: Datos de Taller & Atención (3 cols) */}
            <div className="lg:col-span-3 flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-700 pb-2 font-sans">
                Taller & Atención
              </h4>
              <div className="flex flex-col gap-2.5 text-xs text-slate-400">
                <span className="flex items-start gap-2 text-slate-300">
                  <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                  <span>Jr. Huánuco Nro. 1389, Huancayo, Junín</span>
                </span>
                <span className="flex items-center gap-2 text-slate-300">
                  <Phone className="size-4 text-emerald-400 shrink-0" />
                  <span>+51 958 413 806</span>
                </span>
                <span className="flex items-center gap-2 text-slate-300">
                  <Clock className="size-4 text-slate-400 shrink-0" />
                  <span>Lun–Sáb: 8:00 AM – 7:00 PM</span>
                </span>
              </div>

              <div className="pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-9 text-xs font-bold uppercase tracking-wider border-slate-600 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 hover:border-slate-500 rounded-xl justify-between"
                  asChild
                >
                  <a href="/login">
                    <span>Acceso Taller CAD</span>
                    <ArrowRight className="size-3.5" />
                  </a>
                </Button>
              </div>
            </div>

          </div>

          {/* Barra de Copyright y Links Legales Directos */}
          <div className="mt-12 pt-6 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>© {new Date().getFullYear()} GMS Integra E.I.R.L. · RUC: 10738604721.</span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <Link href="/terminos-y-condiciones" className="hover:text-white underline underline-offset-2">
                Términos
              </Link>
              <span className="text-slate-600">·</span>
              <Link href="/politica-de-privacidad" className="hover:text-white underline underline-offset-2">
                Privacidad & Datos
              </Link>
            </div>
            
            <Link
              href="/blog/terminos-de-contratacion-y-alcance-del-1-ano-de-garantia-formal-en-gms-integra"
              className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition-colors"
            >
              <ShieldCheck className="size-4 text-emerald-500" />
              <span>Garantía Escrita de 1 Año · Vidrio Templado & Aluminio Pesado</span>
            </Link>
          </div>
        </div>
      </footer>

      {/* Componente de Firma Sudolabs */}
      <SdlFooter
        tema="dark"
        tagline="Desarrollado por Sudolabs · Ingeniería de software, Huancayo, Perú"
      />
    </>
  );
}
