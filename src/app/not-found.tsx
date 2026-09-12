import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Compass, LayoutGrid, Building2, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/landing/social-icons";
import { enlaceDeWhatsApp } from "@/config/site-config";

/**
 * 404 global del portal.
 *
 * Antes de existir este archivo, Next servía su 404 por defecto, que HEREDA la metadata del layout
 * raíz — incluido su `alternates.canonical: "/"`. Cada URL inexistente se declaraba canónica de la
 * home, y con 2.027 páginas de detalle eso es mucha superficie diciéndole a Google que es la
 * portada. `noindex` corta eso; `follow` se mantiene para que los enlaces de salida de abajo
 * devuelvan al rastreador al contenido real en vez de dejarlo en un callejón.
 *
 * `alternates: { canonical: null }` es lo que de verdad corta la herencia: NO declararlo no basta
 * —comprobado en el HTML compilado, seguía emitiendo `<link rel="canonical" href=".../">`—. En la
 * metadata de Next, un campo a `null` se elimina; omitirlo lo hereda. Una página que no existe no
 * tiene URL canónica que reclamar.
 *
 * El `robots` se declara aunque Next ya emita un `noindex` propio en el límite de `not-found`: deja
 * la intención escrita en el código y sobrevive a un cambio de ese comportamiento por defecto. Los
 * dos `<meta name="robots">` del HTML dicen lo mismo y Google combina directivas por la más
 * restrictiva, así que no compiten.
 */
export const metadata: Metadata = {
  title: "Página no encontrada",
  description:
    "La dirección solicitada no existe en el portal de GMS Integra. Desde aquí se llega al catálogo, a las obras ejecutadas y al blog técnico.",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

const SALIDAS = [
  {
    href: "/catalogo",
    icono: LayoutGrid,
    titulo: "Catálogo",
    detalle: "Ventanas, mamparas, fachadas, barandas y techos",
  },
  {
    href: "/obras",
    icono: Building2,
    titulo: "Obras ejecutadas",
    detalle: "Proyectos instalados en el Valle del Mantaro",
  },
  {
    href: "/blog",
    icono: Newspaper,
    titulo: "Blog técnico",
    detalle: "Guías de especificación y cálculo",
  },
] as const;

export default function NoEncontrada() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <header className="border-b border-border bg-slate-950 py-12 text-white sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 font-mono text-xs text-brand hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            <span>Volver al Portal Principal</span>
          </Link>

          <div className="mb-3 flex items-center gap-2">
            <Compass className="size-4 text-brand" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
              Error 404 · Dirección no encontrada
            </span>
          </div>

          <h1 className="font-sans text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
            Esta página no existe
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            La dirección puede haber cambiado, o el modelo que buscabas se reorganizó dentro del
            catálogo. No es un fallo del sitio: abajo están las tres secciones donde está todo.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {SALIDAS.map(({ href, icono: Icono, titulo, detalle }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-lg border border-border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
            >
              <Icono className="size-5 text-primary" />
              <h2 className="mt-3 font-sans text-base font-bold uppercase tracking-tight group-hover:text-primary">
                {titulo}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{detalle}</p>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-center">
          <p className="flex-1 text-sm text-muted-foreground">
            Si llegaste buscando un modelo concreto, lo más rápido es preguntarlo directamente.
          </p>
          <Button asChild variant="brand" size="lg">
            <a
              href={enlaceDeWhatsApp(
                "Hola GMS Integra, buscaba algo en la web y no lo encontré. ¿Me orientan?",
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="size-4" />
              Escribir por WhatsApp
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}
