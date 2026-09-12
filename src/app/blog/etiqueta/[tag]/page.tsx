import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { FloatingCta } from "@/components/landing/floating-cta";
import { CabeceraDePagina } from "@/components/layout/subhero-cabecera";
import { siteConfig } from "@/config/site-config";
import BreadcrumbSchema from "@/components/seo/breadcrumb-schema";
import { ETIQUETAS, NOMBRE_DE_ETIQUETA, type Etiqueta } from "@/lib/blog/esquema";
import { etiquetasUsadas, leerPorEtiqueta } from "@/lib/blog/leer";

export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return etiquetasUsadas().map(({ etiqueta }) => ({ tag: etiqueta }));
}

function esEtiqueta(valor: string): valor is Etiqueta {
  return (ETIQUETAS as readonly string[]).includes(valor);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  if (!esEtiqueta(tag)) return {};

  const nombre = NOMBRE_DE_ETIQUETA[tag];
  const descripcion = `Artículos de GMS Integra sobre ${nombre.toLowerCase()} para tu proyecto de carpintería de aluminio y vidrio templado.`;

  return {
    title: nombre,
    description: descripcion,
    alternates: { canonical: `${siteConfig.url}/blog/etiqueta/${tag}` },
    openGraph: {
      type: "website",
      url: `${siteConfig.url}/blog/etiqueta/${tag}`,
      title: `${nombre} | ${siteConfig.name}`,
      description: descripcion,
    },
  };
}

export default async function EtiquetaPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  if (!esEtiqueta(tag)) notFound();

  const articulos = leerPorEtiqueta(tag);
  if (articulos.length === 0) notFound();

  const otras = etiquetasUsadas().filter((e) => e.etiqueta !== tag);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <BreadcrumbSchema
        items={[
          { name: "Inicio", item: "/" },
          { name: "Blog", item: "/blog" },
          { name: NOMBRE_DE_ETIQUETA[tag], item: `/blog/etiqueta/${tag}` },
        ]}
      />

      <main className="flex-1">
        <CabeceraDePagina
          migas={[
            { nombre: "Inicio", href: "/" },
            { nombre: "Blog", href: "/blog" },
            { nombre: NOMBRE_DE_ETIQUETA[tag] },
          ]}
          titulo={NOMBRE_DE_ETIQUETA[tag]}
          resumen={`Guías técnicas y publicaciones sobre ${NOMBRE_DE_ETIQUETA[tag].toLowerCase()} para proyectos de aluminio y vidrio.`}
          imagen="/catalogo/mamparas/m-serie-49.webp"
          imagenAlt="Proyectos de aluminio y vidrio de GMS Integra"
          badge="Tema de Especialidad"
          meta={
            <span className="rounded-xl bg-white/10 px-3.5 py-1.5 backdrop-blur-xs border border-white/15">
              {articulos.length} {articulos.length === 1 ? "Artículo en este tema" : "Artículos en este tema"}
            </span>
          }
        />

        {otras.length > 0 && (
          <section className="border-b border-border/50 px-4 py-6 md:px-6">
            <div className="container mx-auto flex max-w-6xl flex-wrap gap-2.5">
              {otras.map(({ etiqueta }) => (
                <Link
                  key={etiqueta}
                  href={`/blog/etiqueta/${etiqueta}`}
                  className="rounded-full border border-border px-4 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  {NOMBRE_DE_ETIQUETA[etiqueta]}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="px-4 py-12 md:px-6 md:py-16">
          <div className="container mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articulos.map((articulo) => (
              <Link
                key={articulo.slug}
                href={`/blog/${articulo.slug}`}
                className="group relative flex min-h-[16rem] flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/30 shadow-md transition-all duration-300 hover:border-brand-linea/50"
              >
                <Image
                  src={articulo.portada}
                  alt={articulo.portadaAlt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Degradado sutil */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent transition-opacity duration-300 group-hover:from-black/85"
                />

                <div className="relative mt-auto flex flex-col gap-2 p-6 z-10">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-brand">
                    <Clock className="size-3.5 shrink-0" />
                    <span>{articulo.minutosDeLectura} min de lectura</span>
                  </div>

                  <h2 className="text-balance font-black leading-snug tracking-tight text-white transition-colors group-hover:text-brand text-lg sm:text-xl">
                    {articulo.titulo}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
      <FloatingCta />
    </div>
  );
}
