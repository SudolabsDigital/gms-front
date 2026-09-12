import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/landing/social-icons";
import { enlaceDeWhatsApp } from "@/config/site-config";

export const metadata: Metadata = {
  title: "Términos y Condiciones de Uso del Sitio Web | GMS Integra",
  description:
    "Términos que regulan la navegación y uso del portal web de GMS Integra E.I.R.L. Para contratación de obras, presupuestos cerrados y garantías, la atención es personalizada y directa.",
  alternates: {
    canonical: "/terminos-y-condiciones",
  },
};

export default function TerminosCondicionesPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Cabecera Institucional */}
      <header className="border-b border-border bg-slate-950 text-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-brand hover:underline mb-6"
          >
            <ArrowLeft className="size-3.5" />
            <span>Volver al Portal Principal</span>
          </Link>

          <div className="flex items-center gap-2 mb-3">
            <Scale className="size-4 text-brand" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-brand">
              Términos de Uso del Sitio Web & Canales Digitales
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight font-sans text-white">
            Términos y Condiciones de Uso del Sitio Web
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
            <span>GMS INTEGRA E.I.R.L.</span>
            <span>·</span>
            <span>RUC: 10738604721</span>
            <span>·</span>
            <span>Versión Web 3.1.0</span>
          </div>
        </div>
      </header>

      {/* Cuerpo Principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-muted-foreground">

          {/* Banner de Atención Directa y Personalizada */}
          <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 text-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xs">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary block">
                Atención Personalizada y Contratación Directa
              </span>
              <p className="text-sm sm:text-base font-semibold leading-snug">
                Los contratos de obra, presupuestos vinculantes, anticipos y garantías formales se gestionan de forma personalizada con nuestros ingenieros y asesores.
              </p>
            </div>
            <Button asChild className="rounded-xl font-bold text-xs h-10 px-5 shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm">
              <a
                href={enlaceDeWhatsApp("Hola GMS Integra, deseo coordinar directamente con un asesor técnico para un proyecto.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <WhatsAppIcon className="size-4 text-white" />
                <span>Hablar con un Asesor</span>
              </a>
            </Button>
          </div>

          {/* 01. Ámbito de Aplicación del Sitio Web */}
          <section className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-xs">
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground font-sans mb-3 flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-mono font-bold">
                01
              </span>
              <span>Ámbito de Aplicación de este Sitio Web</span>
            </h2>
            <p>
              El presente sitio web (<strong>gmsintegra.com</strong>) tiene carácter informativo, técnico y de catálogo arquitectónico. Su propósito es exhibir las líneas de fabricación (mamparas, ventanas herméticas, puertas, muros cortina, barandas y coberturas), proyectos ejecutados y facilitar el contacto directo entre los usuarios y el equipo técnico de <strong>GMS INTEGRA E.I.R.L.</strong>
            </p>
            <p className="mt-3">
              El acceso y la navegación en este portal implican la aceptación de los presentes términos de uso digital.
            </p>
          </section>

          {/* 02. Cotizaciones Web y Carácter Referencial */}
          <section className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-xs">
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground font-sans mb-3 flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-mono font-bold">
                02
              </span>
              <span>Cotizaciones Web y Derivación a Asesoría Directa</span>
            </h2>
            <p>
              Toda información de precios, estimaciones o cotizaciones iniciales solicitadas mediante la web, formularios o mensajes rápidos tiene carácter <strong>estrictamente preliminar y referencial</strong>.
            </p>
            <div className="mt-4 p-4 rounded-xl bg-secondary/60 border border-border text-xs sm:text-sm space-y-2 text-foreground">
              <p className="font-semibold">
                ¿Cómo se formaliza un presupuesto y un contrato?
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li><strong>Visita Técnica In-Situ:</strong> Medición milimétrica con distanciómetro láser en la obra por personal especializado.</li>
                <li><strong>Presupuesto Cerrado Formal:</strong> Entrega del documento formal con despiece técnico, perfilería exacta y cronograma.</li>
                <li><strong>Acuerdo Personalizado:</strong> Firma de contrato de obra y condiciones de pago particulares con el Cliente.</li>
              </ul>
            </div>
          </section>

          {/* 03. Contratación, Fabricación y Garantías (Canal Personal) */}
          <section className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-xs">
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground font-sans mb-3 flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-mono font-bold">
                03
              </span>
              <span>Contratación, Fabricación a Medida y Garantías</span>
            </h2>
            <p>
              Todas las especificaciones técnicas particulares, plazos de fabricación en taller, políticas de anticipos para bienes a medida, actas de entrega de obra y el alcance detallado del <strong>1 Año de Garantía Escrita</strong> se establecen, acuerdan y suscriben <strong>de forma directa y personal con cada cliente</strong>.
            </p>
            <p className="mt-3">
              Para conocer las condiciones aplicables a su proyecto específico, comuníquese directamente con nuestra gerencia técnica o visite nuestra sede central.
            </p>
          </section>

          {/* 04. Propiedad Intelectual de Contenidos y Fotografías */}
          <section className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-xs">
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground font-sans mb-3 flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-mono font-bold">
                04
              </span>
              <span>Propiedad Intelectual del Catálogo y Diseños</span>
            </h2>
            <p>
              Las fotografías de obras ejecutadas, renders arquitectónicos, logotipos, textos y contenidos del blog son propiedad exclusiva de GMS INTEGRA E.I.R.L. o cuentan con autorizaciones correspondientes. Queda prohibida su copia, distribución o reproducción comercial no autorizada.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Las marcas comerciales de proveedores mencionadas (*Miyasato, Sika, Herralum, Furukawa, etc.*) son propiedad de sus respectivos titulares y se citan exclusivamente con fines descriptivos e informativos sobre la procedencia de los insumos.
            </p>
          </section>

          {/* 05. Canales Directos de Atención y Libro de Reclamaciones */}
          <section className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-xs">
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground font-sans mb-3 flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-mono font-bold">
                05
              </span>
              <span>Canales Directos de Contacto y Libro de Reclamaciones</span>
            </h2>
            <p>
              Para cualquier consulta legal, comercial, técnica o atención de quejas y reclamos conforme a la Ley N° 29571:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs font-mono bg-secondary/50 p-4 rounded-xl border border-border text-foreground">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Sede & Taller Central</span>
                <span>Jr. Huánuco Nro. 1389, Huancayo, Junín</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">WhatsApp / Teléfono Oficial</span>
                <span>+51 958 413 806</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Correo Electrónico</span>
                <span>contacto@gmsintegra.com</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Libro de Reclamaciones</span>
                <span>Físico en taller y canal virtual directo</span>
              </div>
            </div>
          </section>

        </div>

        {/* Banner Inferior de Contacto Directo */}
        <div className="mt-12 p-6 rounded-2xl bg-secondary border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black uppercase text-foreground font-sans">
              ¿Deseas una cotización personalizada o asesoría técnica para tu obra?
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Conversa directamente con nuestros especialistas en aluminio y cristal templado.
            </p>
          </div>
          <Button asChild className="rounded-xl font-bold text-xs shrink-0 bg-primary text-white hover:bg-primary/90">
            <a
              href={enlaceDeWhatsApp("Hola GMS Integra, solicito atención personalizada para un proyecto.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <span>Conversar por WhatsApp</span>
              <ArrowLeft className="size-3.5 rotate-180" />
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}
