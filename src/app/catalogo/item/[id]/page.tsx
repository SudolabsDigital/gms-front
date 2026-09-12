import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { FloatingCta } from "@/components/landing/floating-cta";
import { CabeceraDePagina } from "@/components/layout/subhero-cabecera";
import { siteConfig, enlaceDeWhatsApp } from "@/config/site-config";
import { obtenerItemPorId, obtenerSlugsDeItems, obtenerCategoriaPorSlug } from "@/lib/catalogo/leer";
import { WhatsAppIcon } from "@/components/landing/social-icons";
import { ArrowLeft, ShieldCheck, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import BreadcrumbSchema from "@/components/seo/breadcrumb-schema";

export const revalidate = 86400;

export function generateStaticParams() {
  return obtenerSlugsDeItems().slice(0, 30);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = obtenerItemPorId(id);
  if (!item) return {};

  const cat = obtenerCategoriaPorSlug(item.categoria);
  const catNombre = cat ? cat.nombre : item.categoria;
  const url = `${siteConfig.url}/catalogo/item/${item.id}`;
  const titulo = `${item.titulo} — ${item.subcategoriaNombre} | Catálogo GMS Integra`;
  const descripcion = `Modelo de carpintería de aluminio y cristal templado: ${item.titulo} (${item.subcategoriaNombre}) en la línea de ${catNombre}. Fabricación a medida en Huancayo y el Valle del Mantaro.`;

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${item.titulo} — ${item.subcategoriaNombre} | GMS Integra`,
      description: descripcion,
      locale: "es_PE",
      images: [
        {
          url: `${siteConfig.url}${item.src}`,
          width: item.ancho || 1200,
          height: item.alto || 800,
          alt: item.titulo,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.titulo} — GMS Integra`,
      description: descripcion,
      images: [`${siteConfig.url}${item.src}`],
    },
  };
}

export default async function ItemCatalogoIndividualPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = obtenerItemPorId(id);

  if (!item) {
    notFound();
  }

  const cat = obtenerCategoriaPorSlug(item.categoria);
  const catNombre = cat ? cat.nombre : item.categoria;
  const urlItem = `${siteConfig.url}/catalogo/item/${item.id}`;
  const mensajeWhatsApp = `Hola GMS Integra, vi el modelo «${item.titulo}» (${item.subcategoriaNombre}) en el catálogo de ${catNombre} (${urlItem}) y deseo solicitar una cotización.`;
  const urlWhatsApp = enlaceDeWhatsApp(mensajeWhatsApp);

  const breadcrumbItems = [
    { name: "Inicio", item: "/" },
    { name: "Catálogo", item: "/catalogo" },
    { name: catNombre, item: `/catalogo/${item.categoria}` },
    { name: item.titulo, item: `/catalogo/item/${item.id}` },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${urlItem}#product`,
    name: `${item.titulo} — ${item.subcategoriaNombre}`,
    description: `Modelo de carpintería de aluminio y vidrio templado en la categoría de ${catNombre}. Fabricación a medida en Huancayo.`,
    image: `${siteConfig.url}${item.src}`,
    category: catNombre,
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    /**
     * SIN `offers` a propósito.
     *
     * Declaraba un `Offer` con `availability: InStock` y `priceCurrency: PEN` **sin `price`**.
     * Las tres cosas eran incorrectas a la vez: el esquema `Offer` exige `price` o
     * `priceSpecification`, así que sin importe no valida; `InStock` afirma stock de un producto que
     * se **fabrica a medida** y no se almacena; y una moneda sin cifra no dice nada.
     *
     * Lo honesto en carpintería a medida no es un precio: es que no hay precio de catálogo. El
     * `Product` se queda con lo verificable —nombre, imagen, categoría y marca—, que es lo que
     * Google puede mostrar sin que la ficha prometa una transacción que no existe.
     */
    manufacturer: {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
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
        {/* ── Subhero del Modelo ── */}
        <CabeceraDePagina
          migas={[
            { nombre: "Inicio", href: "/" },
            { nombre: "Catálogo", href: "/catalogo" },
            { nombre: catNombre, href: `/catalogo/${item.categoria}` },
            { nombre: item.titulo },
          ]}
          titulo={item.titulo}
          antetitulo={`${catNombre} · ${item.subcategoriaNombre}`}
          resumen={`Modelo arquitectónico fabricado con perfiles pesados de aluminio virgen y cristal templado de seguridad a medida exacta en Huancayo.`}
          imagen={item.src}
          imagenAlt={item.titulo}
          badge="Modelo de Catálogo"
          meta={
            <>
              <span className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-1.5 backdrop-blur-xs border border-white/15">
                <Tag className="size-3.5 text-[#00c9ff]" />
                <span>{item.subcategoriaNombre}</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 px-3.5 py-1.5 backdrop-blur-xs border border-emerald-500/30">
                <ShieldCheck className="size-3.5" />
                <span>Fabricación a Medida</span>
              </span>
            </>
          }
        />

        {/* ── Detalle del Modelo & Fotografía ── */}
        <section className="px-4 py-12 md:px-8 md:py-16">
          <div className="mx-auto max-w-5xl space-y-10">

            {/* Tarjeta de Fotografía en Gran Formato */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-slate-950 shadow-2xl">
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full max-h-[75vh]">
                <Image
                  src={item.src}
                  alt={item.titulo}
                  fill
                  priority
                  className="object-contain"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                />
              </div>

              <div className="p-6 sm:p-8 bg-card border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase tracking-wider">
                    <Tag className="size-4" />
                    <span>{catNombre} · {item.subcategoriaNombre}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-foreground font-sans">
                    {item.titulo}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Código de Referencia: <span className="font-mono font-bold text-foreground">{item.id}</span>
                  </p>
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
                      <span>Cotizar este Modelo</span>
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Botón de Retorno a la Categoría */}
            <div className="flex items-center justify-between border-t border-border pt-6">
              <Link
                href={`/catalogo/${item.categoria}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                <ArrowLeft className="size-4" />
                <span>Volver al Catálogo de {catNombre}</span>
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
