"use client";

import { ArrowRight, CornerDownLeft, CheckCircle2 } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   1. VISITA IN-SITU & MEDICIÓN LÁSER EN OBRA
   ═══════════════════════════════════════════════════════════════════ */
function SvgMedicionDetallada() {
  return (
    <svg
      viewBox="0 0 440 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="size-full transition-transform duration-700 group-hover:scale-103"
    >
      <defs>
        <linearGradient id="skyGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0B1320" />
          <stop offset="100%" stopColor="#152033" />
        </linearGradient>
        <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--brand-linea)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--brand-linea)" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <rect width="440" height="260" rx="14" fill="url(#skyGrad1)" />

      {/* Montañas de fondo */}
      <path d="M 0 170 L 60 125 L 140 160 L 230 100 L 320 150 L 440 95 L 440 260 L 0 260 Z" fill="#0F172A" opacity="0.7" />
      <path d="M 40 170 L 120 135 L 200 165 L 300 120 L 380 155 L 440 130 L 440 260 L 0 260 Z" fill="#1E293B" opacity="0.5" />

      {/* Edificio en Construcción */}
      <g transform="translate(245, 30)">
        <rect x="0" y="15" width="180" height="185" fill="#1E293B" stroke="#334155" strokeWidth="2" rx="2" />
        <rect x="15" y="30" width="65" height="55" fill="#0A1118" stroke="var(--brand-linea)" strokeWidth="1.5" strokeDasharray="3 3" />
        <rect x="95" y="30" width="70" height="55" fill="#0A1118" stroke="var(--brand-linea)" strokeWidth="1.5" strokeDasharray="3 3" />
        <rect x="15" y="105" width="70" height="90" fill="#0A1118" stroke="var(--brand-linea)" strokeWidth="1.5" strokeDasharray="3 3" />
        <rect x="95" y="105" width="70" height="90" fill="#7C2D12" opacity="0.6" stroke="#9A3412" strokeWidth="1" />
        {[120, 135, 150, 165, 180].map((y, i) => (
          <line key={i} x1="95" y1={y} x2="165" y2={y} stroke="#451A03" strokeWidth="1.2" />
        ))}
        <line x1="-12" y1="40" x2="-12" y2="200" stroke="#94A3B8" strokeWidth="2" />
        <line x1="2" y1="40" x2="2" y2="200" stroke="#94A3B8" strokeWidth="2" />
        <line x1="-12" y1="75" x2="2" y2="75" stroke="#94A3B8" strokeWidth="1.5" />
        <line x1="-12" y1="130" x2="2" y2="130" stroke="#94A3B8" strokeWidth="1.5" />
      </g>

      <line x1="0" y1="225" x2="440" y2="225" stroke="#334155" strokeWidth="2" />

      {/* Camioneta GMS */}
      <g transform="translate(25, 135)">
        <path d="M 8 50 L 25 20 L 95 20 L 135 32 L 155 50 L 160 70 L 8 70 Z" fill="#0A1118" stroke="var(--brand-linea)" strokeWidth="1.8" />
        <rect x="10" y="50" width="148" height="20" fill="#0F172A" />
        <path d="M 98 25 L 130 35 L 130 48 L 98 48 Z" fill="var(--brand-linea)" fillOpacity="0.25" stroke="var(--brand-linea)" strokeWidth="1" />
        <rect x="42" y="26" width="50" height="22" rx="2" fill="var(--brand-linea)" fillOpacity="0.15" stroke="var(--brand-linea)" strokeWidth="1" />
        <rect x="25" y="53" width="70" height="13" rx="2" fill="#0A1118" stroke="var(--brand-linea)" strokeWidth="0.8" />
        <text x="60" y="62.5" fill="var(--brand-linea)" fontSize="7.5" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" dominantBaseline="middle">
          GMS INTEGRA
        </text>
        <line x1="20" y1="10" x2="125" y2="10" stroke="#F59E0B" strokeWidth="3" />
        {[30, 48, 66, 84, 102, 120].map((x, i) => (
          <line key={i} x1={x} y1="7" x2={x} y2="13" stroke="#1E293B" strokeWidth="2" />
        ))}
        <circle cx="40" cy="72" r="15" fill="#0A1118" stroke="#64748B" strokeWidth="3" />
        <circle cx="40" cy="72" r="6" fill="var(--brand-linea)" />
        <circle cx="128" cy="72" r="15" fill="#0A1118" stroke="#64748B" strokeWidth="3" />
        <circle cx="128" cy="72" r="6" fill="var(--brand-linea)" />
      </g>

      {/* Técnico con Trípode Láser */}
      <g transform="translate(195, 142)">
        <line x1="35" y1="60" x2="45" y2="83" stroke="#64748B" strokeWidth="2" />
        <line x1="45" y1="60" x2="45" y2="83" stroke="#64748B" strokeWidth="2" />
        <line x1="55" y1="60" x2="45" y2="83" stroke="#64748B" strokeWidth="2" />
        <rect x="38" y="52" width="14" height="10" rx="2" fill="#0A1118" stroke="var(--brand-linea)" strokeWidth="1.5" />
        <line x1="52" y1="57" x2="120" y2="57" stroke="var(--brand-linea)" strokeWidth="2" />
        <line x1="52" y1="57" x2="120" y2="57" stroke="url(#beamGrad)" strokeWidth="6" />
        <circle cx="120" cy="57" r="4" fill="var(--brand-linea)" />
        <circle cx="15" cy="20" r="7" fill="#F6D0B1" />
        <path d="M 6 18 C 6 10 24 10 24 18 Z" fill="#F8FAFC" />
        <ellipse cx="15" cy="45" rx="10" ry="16" fill="#0F172A" stroke="var(--brand-linea)" strokeWidth="1.2" />
        <line x1="12" y1="60" x2="10" y2="83" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" />
        <line x1="18" y1="60" x2="20" y2="83" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" />
        <line x1="18" y1="36" x2="38" y2="52" stroke="#F8FAFC" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   2. INGENIERÍA 3D, DESPIECE CAD & COTIZACIÓN FORMAL
   ═══════════════════════════════════════════════════════════════════ */
function SvgDisenoDetallado() {
  return (
    <svg
      viewBox="0 0 440 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="size-full transition-transform duration-700 group-hover:scale-103"
    >
      <defs>
        <linearGradient id="skyGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0B1320" />
          <stop offset="100%" stopColor="#152033" />
        </linearGradient>
      </defs>

      <rect width="440" height="260" rx="14" fill="url(#skyGrad2)" />

      {/* Ventanal */}
      <rect x="25" y="25" width="130" height="100" fill="#0A1118" stroke="#334155" strokeWidth="1.5" rx="3" />
      <line x1="90" y1="25" x2="90" y2="125" stroke="#1E293B" strokeWidth="1.5" />
      <line x1="25" y1="75" x2="155" y2="75" stroke="#1E293B" strokeWidth="1.5" />

      {/* Pizarra Técnica */}
      <g transform="translate(295, 25)">
        <rect x="0" y="0" width="120" height="100" rx="3" fill="#0A1118" stroke="#334155" strokeWidth="1.5" />
        <text x="10" y="18" fill="var(--brand-linea)" fontSize="8" fontFamily="monospace" fontWeight="bold">CORTE SERIE 80</text>
        <rect x="15" y="28" width="40" height="55" fill="none" stroke="var(--brand-linea)" strokeWidth="1.2" strokeDasharray="3 2" />
        <rect x="60" y="28" width="45" height="55" fill="none" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="3 2" />
      </g>

      {/* Escritorio */}
      <rect x="40" y="170" width="360" height="18" rx="3" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
      <line x1="70" y1="188" x2="70" y2="260" stroke="#0A1118" strokeWidth="8" />
      <line x1="370" y1="188" x2="370" y2="260" stroke="#0A1118" strokeWidth="8" />

      {/* Monitor 3D */}
      <g transform="translate(130, 60)">
        <rect x="0" y="0" width="150" height="95" rx="4" fill="#0A1118" stroke="var(--brand-linea)" strokeWidth="2" />
        <rect x="65" y="95" width="20" height="25" fill="#1E293B" />
        <rect x="50" y="118" width="50" height="5" rx="2" fill="#334155" />
        <polygon points="25,75 70,30 125,40 80,85" stroke="var(--brand-linea)" strokeWidth="1.8" fill="var(--brand-linea)" fillOpacity="0.1" />
        <polygon points="80,85 125,40 125,70 80,92" stroke="var(--brand-linea)" strokeWidth="1.8" fill="var(--brand-linea)" fillOpacity="0.2" />
      </g>

      {/* Ingeniero Diseñando */}
      <g transform="translate(245, 95)">
        <circle cx="25" cy="22" r="8" fill="#F6D0B1" />
        <path d="M 16 18 C 16 11 34 11 34 18 Z" fill="var(--brand-linea)" />
        <ellipse cx="25" cy="50" rx="13" ry="20" fill="#0F172A" stroke="var(--brand-linea)" strokeWidth="1.2" />
        <line x1="16" y1="42" x2="-10" y2="30" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" />
        <circle cx="-12" cy="29" r="2.5" fill="#F6D0B1" />
        <line x1="-13" y1="29" x2="-22" y2="25" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
      </g>

      {/* Plano y Cotización */}
      <g transform="translate(325, 105)">
        <polygon points="5,5 65,0 75,35 15,40" fill="#0A1118" stroke="var(--brand-linea)" strokeWidth="1.5" />
        <line x1="18" y1="12" x2="55" y2="8" stroke="#94A3B8" strokeWidth="1.2" />
        <circle cx="48" cy="26" r="7" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="1.2" />
        <path d="M 45 26 L 47 28 L 51 24" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   3. MANUFACTURA & CORTE POR MATRIZ EN TALLER HUANCAYO
   ═══════════════════════════════════════════════════════════════════ */
function SvgManufacturaDetallada() {
  return (
    <svg
      viewBox="0 0 440 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="size-full transition-transform duration-700 group-hover:scale-103"
    >
      <defs>
        <linearGradient id="skyGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0B1320" />
          <stop offset="100%" stopColor="#152033" />
        </linearGradient>
      </defs>

      <rect width="440" height="260" rx="14" fill="url(#skyGrad3)" />

      {/* Vigas y Estructura */}
      <line x1="0" y1="35" x2="440" y2="35" stroke="#334155" strokeWidth="4" />
      <line x1="110" y1="0" x2="110" y2="35" stroke="#334155" strokeWidth="2.5" />
      <line x1="330" y1="0" x2="330" y2="35" stroke="#334155" strokeWidth="2.5" />

      {/* Rack de Perfiles */}
      <g transform="translate(20, 50)">
        <rect x="0" y="0" width="75" height="135" fill="#0A1118" stroke="#334155" strokeWidth="1.5" rx="3" />
        <rect x="8" y="10" width="8" height="115" fill="var(--brand-linea)" />
        <rect x="22" y="10" width="8" height="115" fill="#0F172A" stroke="#334155" strokeWidth="0.8" />
        <rect x="36" y="10" width="8" height="115" fill="#F59E0B" />
        <rect x="50" y="10" width="8" height="115" fill="#94A3B8" />
      </g>

      <line x1="0" y1="225" x2="440" y2="225" stroke="#334155" strokeWidth="2" />

      {/* Mesa de Trabajo y Vidrio */}
      <g transform="translate(195, 120)">
        <rect x="0" y="25" width="220" height="45" rx="3" fill="#1E293B" stroke="#334155" strokeWidth="2" />
        <line x1="25" y1="70" x2="25" y2="105" stroke="#0A1118" strokeWidth="6" />
        <line x1="195" y1="70" x2="195" y2="105" stroke="#0A1118" strokeWidth="6" />
        <rect x="15" y="-18" width="190" height="55" rx="2" fill="var(--brand-linea)" fillOpacity="0.12" stroke="var(--brand-linea)" strokeWidth="2" />
        <circle cx="70" cy="8" r="9" fill="var(--brand-linea)" />
        <circle cx="150" cy="8" r="9" fill="var(--brand-linea)" />
      </g>

      {/* Operario Cortando */}
      <g transform="translate(100, 95)">
        <circle cx="45" cy="45" r="32" fill="#0A1118" stroke="#334155" strokeWidth="2" />
        <circle cx="45" cy="45" r="10" fill="var(--brand-linea)" />
        <path d="M 0 78 L 45 78 L 35 95 L 0 95 Z" fill="var(--brand-linea)" fillOpacity="0.3" stroke="var(--brand-linea)" strokeWidth="1.5" />
        <path d="M 50 78 L 95 78 L 95 95 L 40 95 Z" fill="var(--brand-linea)" fillOpacity="0.5" stroke="var(--brand-linea)" strokeWidth="1.5" />
        <circle cx="45" cy="80" r="2.5" fill="var(--brand-linea)" />
        <line x1="45" y1="80" x2="58" y2="68" stroke="var(--brand-linea)" strokeWidth="1.5" />
        <circle cx="68" cy="20" r="7" fill="#F6D0B1" />
        <path d="M 59 18 C 59 11 77 11 77 18 Z" fill="#F8FAFC" />
        <ellipse cx="68" cy="45" rx="11" ry="18" fill="#0F172A" stroke="var(--brand-linea)" strokeWidth="1.2" />
      </g>

      {/* Operario Ensamblando */}
      <g transform="translate(325, 95)">
        <circle cx="20" cy="20" r="7" fill="#F6D0B1" />
        <path d="M 11 18 C 11 11 29 11 29 18 Z" fill="var(--brand-linea)" />
        <ellipse cx="20" cy="45" rx="11" ry="18" fill="#0F172A" stroke="var(--brand-linea)" strokeWidth="1.2" />
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   4. INSTALACIÓN EN OBRA & ENTREGA CON 1 AÑO DE GARANTÍA
   ═══════════════════════════════════════════════════════════════════ */
function SvgInstalacionDetallada() {
  return (
    <svg
      viewBox="0 0 440 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="size-full transition-transform duration-700 group-hover:scale-103"
    >
      <defs>
        <linearGradient id="skyGrad4" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0B1320" />
          <stop offset="100%" stopColor="#152033" />
        </linearGradient>
      </defs>

      <rect width="440" height="260" rx="14" fill="url(#skyGrad4)" />

      {/* Residencia Moderna Terminada */}
      <g transform="translate(25, 20)">
        <rect x="0" y="10" width="390" height="190" fill="#1E293B" stroke="#334155" strokeWidth="2" rx="4" />
        <rect x="0" y="0" width="390" height="16" fill="#0A1118" />
        <rect x="35" y="30" width="320" height="155" fill="#0A1118" stroke="var(--brand-linea)" strokeWidth="2.5" rx="3" />
        <rect x="42" y="38" width="100" height="142" fill="var(--brand-linea)" fillOpacity="0.1" stroke="#38BDF8" strokeWidth="1.5" />
        <rect x="145" y="38" width="100" height="142" fill="var(--brand-linea)" fillOpacity="0.15" stroke="#38BDF8" strokeWidth="1.5" />
        <rect x="248" y="38" width="100" height="142" fill="var(--brand-linea)" fillOpacity="0.1" stroke="#38BDF8" strokeWidth="1.5" />
        <polygon points="55,42 85,42 50,175 45,175" fill="white" fillOpacity="0.15" />
        <polygon points="160,42 190,42 155,175 150,175" fill="white" fillOpacity="0.15" />
        <g transform="translate(190, 65)">
          <path d="M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z" fill="var(--brand-linea)" />
        </g>
      </g>

      <line x1="0" y1="225" x2="440" y2="225" stroke="#334155" strokeWidth="2" />

      {/* Instalador */}
      <g transform="translate(75, 130)">
        <circle cx="20" cy="20" r="7" fill="#F6D0B1" />
        <path d="M 11 18 C 11 11 29 11 29 18 Z" fill="#F8FAFC" />
        <ellipse cx="20" cy="45" rx="10" ry="18" fill="#0F172A" stroke="var(--brand-linea)" strokeWidth="1.2" />
        <line x1="24" y1="36" x2="40" y2="46" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" />
        <rect x="38" y="42" width="14" height="6" rx="1.5" fill="#0A1118" stroke="var(--brand-linea)" strokeWidth="1" />
      </g>

      {/* Sello de Garantía */}
      <g transform="translate(285, 125)">
        <rect x="0" y="0" width="130" height="85" rx="8" fill="#0A1118" stroke="var(--brand-linea)" strokeWidth="2" />
        <circle cx="32" cy="42" r="18" fill="var(--brand-linea)" fillOpacity="0.15" stroke="var(--brand-linea)" strokeWidth="1.5" />
        <path d="M 24 42 L 30 48 L 40 36" stroke="var(--brand-linea)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="60" y="36" fill="#F8FAFC" fontSize="10" fontFamily="sans-serif" fontWeight="900">
          OBRA 100%
        </text>
        <text x="60" y="48" fill="var(--brand-linea)" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
          CONFORME
        </text>
        <text x="60" y="60" fill="#94A3B8" fontSize="7.5" fontFamily="sans-serif">
          1 Año Garantía
        </text>
      </g>
    </svg>
  );
}

/* ─── DATOS DE LAS 4 ETAPAS EN MATRIZ [1-2] y [3-4] ───────────────── */
const ETAPAS_MATRIZ = [
  {
    num: "01",
    titulo: "Visita In-Situ & Medición",
    descripcion: "Llegamos a tu obra en nuestro transporte para verificar vanos, plomos y cotas milimétricas con distanciómetro láser.",
    entregable: "Medición 100% Gratuita",
    componenteSvg: SvgMedicionDetallada,
  },
  {
    num: "02",
    titulo: "Ingeniería 3D & Cotización",
    descripcion: "Modelamos la estructura en software 3D/CAD y te entregamos cotización formal y transparente sin costos ocultos.",
    entregable: "Plano de Corte & Presupuesto",
    componenteSvg: SvgDisenoDetallado,
  },
  {
    num: "03",
    titulo: "Manufactura en Taller",
    descripcion: "Corte milimétrico por matriz a 45°, troquelado de desagües y ensamble con perfiles pesados y cristal templado.",
    entregable: "Manufactura Propia Huancayo",
    componenteSvg: SvgManufacturaDetallada,
  },
  {
    num: "04",
    titulo: "Instalación & Garantía",
    descripcion: "Montaje limpio en una sola jornada, sellado hermético contra vientos andinos y entrega de 1 año de garantía escrita.",
    entregable: "1 Año de Garantía Escrita",
    componenteSvg: SvgInstalacionDetallada,
  },
];

export function ProcessSteps() {
  const paso1 = ETAPAS_MATRIZ[0];
  const paso2 = ETAPAS_MATRIZ[1];
  const paso3 = ETAPAS_MATRIZ[2];
  const paso4 = ETAPAS_MATRIZ[3];

  const Svg1 = paso1.componenteSvg;
  const Svg2 = paso2.componenteSvg;
  const Svg3 = paso3.componenteSvg;
  const Svg4 = paso4.componenteSvg;

  return (
    <section id="proceso" className="relative bg-background text-foreground border-b border-border py-12 sm:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera Editorial Limpia y Cohesiva */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-10 pb-4 border-b border-border">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-primary">
              Flujo Estandarizado de Ingeniería
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-foreground font-sans mt-1">
              Fabricación en 4 Pasos
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
            Desde la visita técnica en tu obra hasta la instalación y entrega de tu garantía formal.
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════
            MATRIZ DE FLUJO ARQUITECTÓNICO: FILA 1 [01 ──→ 02]
           ══════════════════════════════════════════════════════════ */}
        <div className="relative mb-6 lg:mb-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            
            {/* ── PASO 01 ── */}
            <div className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-primary/50">
              <div className="w-full h-[220px] sm:h-[250px] lg:h-[260px] rounded-xl overflow-hidden mb-4 flex items-center justify-center bg-slate-950 border border-white/10">
                <Svg1 />
              </div>

              <div className="flex items-baseline gap-2.5 mb-1.5">
                <span className="text-base font-mono font-black text-primary">
                  01 //
                </span>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-foreground font-sans leading-tight">
                  {paso1.titulo}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {paso1.descripcion}
              </p>

              <div className="mt-3.5 pt-3 border-t border-border flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-mono font-bold text-primary border border-primary/20">
                  <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                  <span>{paso1.entregable}</span>
                </span>
              </div>
            </div>

            {/* ── PASO 02 ── */}
            <div className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-primary/50">
              <div className="w-full h-[220px] sm:h-[250px] lg:h-[260px] rounded-xl overflow-hidden mb-4 flex items-center justify-center bg-slate-950 border border-white/10">
                <Svg2 />
              </div>

              <div className="flex items-baseline gap-2.5 mb-1.5">
                <span className="text-base font-mono font-black text-primary">
                  02 //
                </span>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-foreground font-sans leading-tight">
                  {paso2.titulo}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {paso2.descripcion}
              </p>

              <div className="mt-3.5 pt-3 border-t border-border flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-mono font-bold text-primary border border-primary/20">
                  <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                  <span>{paso2.entregable}</span>
                </span>
              </div>
            </div>

          </div>

          {/* Flecha Flotante Central entre 1 y 2 */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 size-11 rounded-full bg-card border border-primary/40 shadow-md items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
            <ArrowRight className="size-5" />
          </div>

        </div>

        {/* ── Conector Intermedio Compacto de Transición hacia Fila 2 ── */}
        <div className="relative flex items-center justify-center my-6">
          <div className="w-full h-[1px] bg-border" />
          <div className="absolute flex items-center gap-2 rounded-full bg-secondary px-4 py-1 border border-border text-xs font-mono font-bold text-muted-foreground shadow-xs">
            <CornerDownLeft className="size-3.5 text-primary" />
            <span>Fase de Taller & Montaje</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            MATRIZ DE FLUJO ARQUITECTÓNICO: FILA 2 [03 ──→ 04]
           ══════════════════════════════════════════════════════════ */}
        <div className="relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            
            {/* ── PASO 03 ── */}
            <div className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-primary/50">
              <div className="w-full h-[220px] sm:h-[250px] lg:h-[260px] rounded-xl overflow-hidden mb-4 flex items-center justify-center bg-slate-950 border border-white/10">
                <Svg3 />
              </div>

              <div className="flex items-baseline gap-2.5 mb-1.5">
                <span className="text-base font-mono font-black text-primary">
                  03 //
                </span>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-foreground font-sans leading-tight">
                  {paso3.titulo}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {paso3.descripcion}
              </p>

              <div className="mt-3.5 pt-3 border-t border-border flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-mono font-bold text-primary border border-primary/20">
                  <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                  <span>{paso3.entregable}</span>
                </span>
              </div>
            </div>

            {/* ── PASO 04 ── */}
            <div className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-primary/50">
              <div className="w-full h-[220px] sm:h-[250px] lg:h-[260px] rounded-xl overflow-hidden mb-4 flex items-center justify-center bg-slate-950 border border-white/10">
                <Svg4 />
              </div>

              <div className="flex items-baseline gap-2.5 mb-1.5">
                <span className="text-base font-mono font-black text-primary">
                  04 //
                </span>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-foreground font-sans leading-tight">
                  {paso4.titulo}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {paso4.descripcion}
              </p>

              <div className="mt-3.5 pt-3 border-t border-border flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-mono font-bold text-primary border border-primary/20">
                  <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                  <span>{paso4.entregable}</span>
                </span>
              </div>
            </div>

          </div>

          {/* Flecha Flotante Central entre 3 y 4 */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 size-11 rounded-full bg-card border border-primary/40 shadow-md items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
            <ArrowRight className="size-5" />
          </div>

        </div>

      </div>
    </section>
  );
}
