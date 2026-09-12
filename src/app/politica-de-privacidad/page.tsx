import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/landing/social-icons";
import { enlaceDeWhatsApp } from "@/config/site-config";

export const metadata: Metadata = {
  title: "Política de Privacidad y Tratamiento de Datos | GMS Integra",
  description:
    "Política de privacidad sobre la navegación y recopilación de datos en el portal de GMS Integra E.I.R.L. Para consultas sobre datos, la atención es directa y personalizada.",
  alternates: {
    canonical: "/politica-de-privacidad",
  },
};

export default function PoliticaPrivacidadPage() {
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
            <Lock className="size-4 text-brand" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-brand">
              Privacidad Web & Ley N° 29733 (Perú)
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight font-sans text-white">
            Política de Privacidad y Tratamiento de Datos
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

          {/* Banner de Atención y Derechos Directos */}
          <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 text-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xs">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary block">
                Atención Directa para Gestión de Datos y Privacidad
              </span>
              <p className="text-sm sm:text-base font-semibold leading-snug">
                Para solicitar información sobre el tratamiento de tus datos personales o ejercer tus derechos ARCO, contáctate directamente con nuestro equipo de atención.
              </p>
            </div>
            <Button asChild className="rounded-xl font-bold text-xs h-10 px-5 shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm">
              <a
                href={enlaceDeWhatsApp("Hola GMS Integra, tengo una consulta sobre la privacidad y el tratamiento de mis datos personales.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <WhatsAppIcon className="size-4 text-white" />
                <span>Contactar por WhatsApp</span>
              </a>
            </Button>
          </div>

          {/* 01. Tratamiento de Datos en la Web */}
          <section className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-xs">
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground font-sans mb-3 flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-mono font-bold">
                01
              </span>
              <span>Datos Recopilados en la Plataforma Web</span>
            </h2>
            <p>
              En este sitio web únicamente recopilamos la información básica que tú decides compartir de forma voluntaria al hacer clic en los enlaces de contacto, solicitar una cotización inicial o comunicarte vía WhatsApp (nombre, teléfono y detalles generales de tu proyecto).
            </p>
            <p className="mt-3">
              No solicitamos datos sensibles, información financiera ni contraseñas a través de la navegación pública del portal.
            </p>
          </section>

          {/* 02. Finalidad Exclusiva y No Comercialización */}
          <section className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-xs">
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground font-sans mb-3 flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-mono font-bold">
                02
              </span>
              <span>Finalidad de Contacto y Confidencialidad</span>
            </h2>
            <p>
              Toda la información que nos proporciones se utiliza de forma exclusiva para:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm">
              <li>Responder tus consultas y elaborar propuestas técnicas preliminares.</li>
              <li>Coordinar visitas técnicas de medición in-situ con distanciómetro láser en tu obra.</li>
              <li>Brindarte asesoramiento arquitectónico y seguimiento directo de tu proyecto.</li>
            </ul>
            <p className="mt-3 font-semibold text-foreground">
              GMS INTEGRA garantiza que no comercializa, no cede y no comparte tus datos con terceros para fines publicitarios ajenos a la empresa.
            </p>
          </section>

          {/* 03. Derivación a Asesoría Personal y Derechos ARCO */}
          <section className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-xs">
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground font-sans mb-3 flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-mono font-bold">
                03
              </span>
              <span>Atención Personalizada y Ejercicio de Derechos ARCO</span>
            </h2>
            <p>
              Conforme a la Ley N° 29733 (Ley de Protección de Datos Personales), tienes derecho a acceder, rectificar, cancelar u oponerte al tratamiento de tus datos personales en cualquier momento.
            </p>
            <p className="mt-3">
              Para cualquier solicitud, actualización o consulta específica sobre tus datos, la atención se realiza de forma directa y personalizada a través de:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs font-mono bg-secondary/50 p-4 rounded-xl border border-border text-foreground">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Atención WhatsApp</span>
                <strong>+51 958 413 806</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Correo Electrónico</span>
                <strong>contacto@gmsintegra.com</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Atención Presencial</span>
                <span>Jr. Huánuco Nro. 1389, Huancayo, Junín</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Horario de Atención</span>
                <span>Lun–Sáb: 8:00 AM – 7:00 PM</span>
              </div>
            </div>
          </section>

          {/* 04. Cookies y Almacenamiento Local */}
          <section className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-xs">
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground font-sans mb-3 flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-mono font-bold">
                04
              </span>
              <span>Cookies y Tecnologías del Sitio Web</span>
            </h2>
            <p>
              Este portal web utiliza únicamente cookies técnicas y almacenamiento local (<em>localStorage</em>) para optimizar la velocidad de carga y recordar tus preferencias de navegación. No empleamos herramientas de rastreo invasivo de terceros.
            </p>
          </section>

        </div>

        {/* Banner Inferior de Contacto */}
        <div className="mt-12 p-6 rounded-2xl bg-secondary border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black uppercase text-foreground font-sans">
              ¿Tienes alguna duda sobre tus datos o deseas atención directa?
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Conversa directamente con nuestro equipo de atención y soporte.
            </p>
          </div>
          <Button asChild className="rounded-xl font-bold text-xs shrink-0 bg-primary text-white hover:bg-primary/90">
            <a
              href={enlaceDeWhatsApp("Hola GMS Integra, tengo una consulta para el equipo de atención.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <span>Conversar con Soporte</span>
              <ArrowLeft className="size-3.5 rotate-180" />
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}
