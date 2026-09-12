import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { FloatingCta } from "@/components/landing/floating-cta";
import { CabeceraDePagina } from "@/components/layout/subhero-cabecera";
import { siteConfig, enlaceDeWhatsApp } from "@/config/site-config";
import { obtenerObraPorId, obtenerTodasLasObras } from "@/lib/obras/leer";
import { WhatsAppIcon } from "@/components/landing/social-icons";
import { MapPin, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import BreadcrumbSchema from "@/components/seo/breadcrumb-schema";
import ObraJsonLd from "@/components/seo/obra-json-ld";

export const revalidate = 86400;

export function generateStaticParams() {
  // Pre-renderizamos las obras más destacadas en el build estático
  return obtenerTodasLasObras()
    .filter((o) => o.destacado)
    .slice(0, 30)
    .map((o) => ({ id: o.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const obra = obtenerObraPorId(id);
  if (!obra) return {};

  const url = `${siteConfig.url}/obras/${obra.id}`;
  const titulo = `${obra.titulo} — ${obra.ubicacionDetalle} | GMS Integra`;
  const descripcion = `Proyecto de ${obra.tipoNombre.toLowerCase()} ejecutado en ${obra.ubicacionDetalle} (${obra.zonaNombre}), Huancayo. Acabados en ${obra.materiales?.join(", ") || "aluminio y cristal templado"}.`;

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${obra.titulo} | Obra Ejecutada en ${obra.ubicacionDetalle}`,
      description: descripcion,
      locale: "es_PE",
      images: [
        {
          url: `${siteConfig.url}${obra.src}`,
          width: obra.ancho || 1200,
          height: obra.alto || 800,
          alt: obra.titulo,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${obra.titulo} — GMS Integra`,
      description: descripcion,
      images: [`${siteConfig.url}${obra.src}`],
    },
  };
}

export default async function ObraIndividualPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const obra = obtenerObraPorId(id);

  if (!obra) {
    notFound();
  }

  const urlObra = `${siteConfig.url}/obras/${obra.id}`;
  const mensajeWhatsApp = `Hola GMS Integra, vi el proyecto «${obra.titulo}» en ${obra.ubicacionDetalle} (${urlObra}) y deseo solicitar una cotización para un acabado similar.`;
  const urlWhatsApp = enlaceDeWhatsApp(mensajeWhatsApp);

  const breadcrumbItems = [
    { name: "Inicio", item: "/" },
    { name: "Obras Ejecutadas", item: "/obras" },
    { name: obra.titulo, item: `/obras/${obra.id}` },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <BreadcrumbSchema items={breadcrumbItems} />
      <ObraJsonLd obra={obra} />

      <main className="flex-1">
        {/* ── Subhero del Proyecto ── */}
        <CabeceraDePagina
          migas={[
            { nombre: "Inicio", href: "/" },
            { nombre: "Obras Ejecutadas", href: "/obras" },
            { nombre: obra.titulo },
          ]}
          titulo={obra.titulo}
          antetitulo={`${obra.zonaNombre} · ${obra.tipoNombre}`}
          resumen={`Proyecto ejecutado con los más altos estándares de carpintería pesada de aluminio y cristal templado en ${obra.ubicacionDetalle}.`}
          imagen={obra.src}
          imagenAlt={obra.titulo}
          badge="Obra Concluida"
          meta={
            <>
              <span className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-1.5 backdrop-blur-xs border border-white/15">
                <MapPin className="size-3.5 text-[#00c9ff]" />
                <span>{obra.ubicacionDetalle}</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 px-3.5 py-1.5 backdrop-blur-xs border border-emerald-500/30">
                <ShieldCheck className="size-3.5" />
                <span>1 Año de Garantía Formal</span>
              </span>
            </>
          }
        />

        {/* ── Detalle del Proyecto & Fotografía Principal ── */}
        <section className="px-4 py-12 md:px-8 md:py-16">
          <div className="mx-auto max-w-5xl space-y-10">

            {/* Tarjeta de Fotografía en Gran Formato */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-slate-950 shadow-2xl">
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full max-h-[75vh]">
                <Image
                  src={obra.src}
                  alt={obra.titulo}
                  fill
                  priority
                  className="object-contain"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                />
              </div>

              <div className="p-6 sm:p-8 bg-card border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase tracking-wider">
                    <MapPin className="size-4" />
                    <span>{obra.ubicacionDetalle} · {obra.zonaNombre}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-foreground font-sans">
                    {obra.titulo}
                  </h2>
                  {obra.materiales && obra.materiales.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {obra.materiales.map((mat, i) => (
                        <span
                          key={i}
                          className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-foreground border border-border"
                        >
                          {mat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botón de Cotización Directa */}
                <div className="flex flex-wrap items-center gap-3 shrink-0 w-full md:w-auto">
                  <Button
                    asChild
                    size="lg"
                    className="w-full md:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md h-12 px-6"
                  >
                    <a
                      href={urlWhatsApp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2"
                    >
                      <WhatsAppIcon className="size-5 text-white" />
                      <span>Cotizar este Acabado</span>
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Botón de Retorno al Portafolio Completo */}
            <div className="flex items-center justify-between border-t border-border pt-6">
              <Link
                href="/obras"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                <ArrowLeft className="size-4" />
                <span>Explorar todas las 472 obras en el Portafolio</span>
              </Link>
            </div>

          </div>
        </section>
      </main>

      <SiteFooter />
      <FloatingCta />
    </div>
  );
}
