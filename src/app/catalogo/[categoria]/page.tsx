import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { FloatingCta } from "@/components/landing/floating-cta";
import { CabeceraDePagina } from "@/components/layout/subhero-cabecera";
import { FichaEspecificaciones } from "@/components/catalogo/ficha-especificaciones";
import { VistaCategoriaCliente } from "@/components/catalogo/vista-categoria-cliente";
import { siteConfig, enlaceDeWhatsApp } from "@/config/site-config";
import {
  obtenerCategoriaPorSlug,
  obtenerItemsPorCategoria,
  obtenerSlugsCategorias,
  obtenerCategorias,
} from "@/lib/catalogo/leer";
import { ArrowLeft } from "lucide-react";
import { WhatsAppIcon } from "@/components/landing/social-icons";
import BreadcrumbSchema from "@/components/seo/breadcrumb-schema";

export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return obtenerSlugsCategorias();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>;
}): Promise<Metadata> {
  const { categoria: slug } = await params;
  const cat = obtenerCategoriaPorSlug(slug);
  if (!cat) return {};

  const url = `${siteConfig.url}/catalogo/${slug}`;

  return {
    title: `${cat.nombre} | Catálogo`,
    description: cat.descripcion,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${cat.nombre} — GMS Integra Huancayo`,
      description: cat.descripcion,
      images: [{ url: `${siteConfig.url}${cat.portada}`, width: 1200, height: 800 }],
    },
  };
}

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria: slug } = await params;
  const cat = obtenerCategoriaPorSlug(slug);

  if (!cat) notFound();

  const items = obtenerItemsPorCategoria(slug);
  const todasCategorias = obtenerCategorias().filter((c) => c.slug !== slug);

  const breadcrumbItems = [
    { name: "Inicio", item: "/" },
    { name: "Catálogo", item: "/catalogo" },
    { name: cat.nombre, item: `/catalogo/${slug}` },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${siteConfig.url}/catalogo/${slug}#webpage`,
    name: `${cat.nombre} — GMS Integra`,
    description: cat.descripcion,
    url: `${siteConfig.url}/catalogo/${slug}`,
    isPartOf: { "@id": `${siteConfig.url}/#website` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.slice(0, 30).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.titulo,
        image: `${siteConfig.url}${item.src}`,
      })),
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <BreadcrumbSchema items={breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1">
        {/* Hero de Categoría */}
        <CabeceraDePagina
          migas={[
            { nombre: "Inicio", href: "/" },
            { nombre: "Catálogo", href: "/catalogo" },
            { nombre: cat.nombre },
          ]}
          titulo={cat.nombre}
          /* Sin `toLowerCase()`: dejaba «pvc» y «acm» en minúscula, y son siglas. El nombre de la
             línea se escribe como está en la tabla. */
          pregunta={`¿Necesitas ${cat.nombre} a medida?`}
          resumen={cat.descripcion}
          imagen={cat.portada}
          imagenAlt={cat.nombre}
          meta={
            <>
              <span className="rounded-xl bg-white/10 px-3.5 py-1.5 backdrop-blur-xs border border-white/15">
                {items.length} {items.length === 1 ? "foto" : "fotos"}
              </span>
              <span className="rounded-xl bg-white/10 px-3.5 py-1.5 backdrop-blur-xs border border-white/15">
                {cat.subcategorias?.length || 1} Series & Tipos
              </span>
              <span className="rounded-xl bg-emerald-500/20 text-emerald-300 px-3.5 py-1.5 backdrop-blur-xs border border-emerald-500/30">
                1 Año Garantía Escrita
              </span>
            </>
          }
          acciones={
            <a
              href={enlaceDeWhatsApp(`Hola GMS Integra, deseo solicitar una cotización técnica para la línea de ${cat.nombre}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-whatsapp px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-whatsapp-hover transition-all"
            >
              <WhatsAppIcon className="size-4" />
              <span>Cotizar {cat.nombre}</span>
            </a>
          }
        />

        {/* ── Contenedor Principal ── */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex flex-col gap-12">
          {/* Botón Volver y CTA Rápido */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="size-4" />
              <span>Volver a todas las categorías</span>
            </Link>

            <a
              href={enlaceDeWhatsApp(`Hola GMS Integra, deseo solicitar una cotización para la línea de ${cat.nombre}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-whatsapp px-4 py-2 text-xs font-bold text-white hover:bg-whatsapp-hover transition-colors shadow-xs"
            >
              <WhatsAppIcon className="size-3.5" />
              <span>Cotizar {cat.nombre}</span>
            </a>
          </div>

          {/* Galería Interactiva con Filtros y Lightbox */}
          <VistaCategoriaCliente categoria={cat} items={items} />

          {/* Ficha Técnica de la Categoría */}
          <FichaEspecificaciones slug={cat.slug} />

          {/* ── Otras Categorías Relacionadas ── */}
          <section className="border-t border-border pt-10">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-6">
              Explorar otras líneas del catálogo
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {todasCategorias.map((otra) => (
                <Link
                  key={otra.slug}
                  href={`/catalogo/${otra.slug}`}
                  className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-slate-700 hover:border-primary/50 hover:text-primary transition-all"
                >
                  <span>{otra.nombre}</span>
                  <span className="ml-2 text-[10px] text-muted-foreground">({otra.totalItems})</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
      <FloatingCta />
    </div>
  );
}
