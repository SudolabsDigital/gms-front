import type { Metadata } from "next";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { FloatingCta } from "@/components/landing/floating-cta";
import { CabeceraDePagina } from "@/components/layout/subhero-cabecera";
import { GaleriaObras } from "@/components/obras/galeria-obras";
import { siteConfig, enlaceDeWhatsApp } from "@/config/site-config";
import BreadcrumbSchema from "@/components/seo/breadcrumb-schema";
import { obtenerTodasLasObras, obtenerZonas } from "@/lib/obras/leer";
import { MessageSquare, ArrowRight, Wrench } from "lucide-react";

export const revalidate = 86400;

const DESCRIPCION =
  "Registro fotográfico y audiovisual de obras ejecutadas por GMS Integra: mamparas monumentales, muros cortina, ventanas herméticas y cerramientos en Huancayo, El Tambo, Huallhuas, La Huaycha, Jauja y Lima.";

export const metadata: Metadata = {
  title: "Obras Ejecutadas | Portafolio de Proyectos",
  description: DESCRIPCION,
  alternates: { canonical: `${siteConfig.url}/obras` },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/obras`,
    title: `Obras Ejecutadas | ${siteConfig.name}`,
    description: DESCRIPCION,
    images: [{ url: `${siteConfig.url}/og-image.png`, width: 1200, height: 630 }],
  },
};

export default function ObrasPage() {
  const obras = obtenerTodasLasObras();
  const zonas = obtenerZonas();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Obras y Proyectos Ejecutados — GMS Integra",
    description: DESCRIPCION,
    url: `${siteConfig.url}/obras`,
    /**
     * `publisher` por `@id`, no una Organization suelta.
     *
     * Repetir `{"@type":"Organization", name, url}` aquí crea a ojos de Google una SEGUNDA entidad
     * homónima, sin relación con la del grafo que emite `JsonLd` en el layout. Referenciar el `@id`
     * hace que esta página cuelgue de la organización que ya existe, con su dirección, su geo y sus
     * redes, en vez de competir con ella.
     */
    publisher: {
      "@id": `${siteConfig.url}/#organization`,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: obras.slice(0, 30).map((obra, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: obra.titulo,
        image: `${siteConfig.url}${obra.src}`,
      })),
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <BreadcrumbSchema
        items={[
          { name: "Inicio", item: "/" },
          { name: "Obras Ejecutadas", item: "/obras" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1">
        {/* ── Subhero Cinematográfico de Obras ── */}
        <CabeceraDePagina
          migas={[{ nombre: "Inicio", href: "/" }, { nombre: "Obras Ejecutadas" }]}
          titulo="Obras Ejecutadas & Proyectos Reales"
          /* SIN CIFRA, A PROPÓSITO (2026-09-12). `obras.length` cuenta FOTOS: 472, de las que 450
             son distintas, repartidas en 31 carpetas que corresponden a menos obras. Pintarlo como
             «472 proyectos» o «+472 obras registradas» afirmaba algo que el dato no dice. Antes el
             texto decía «más de 490»: dos versiones del mismo número, y ninguna contaba obras. */
          resumen="Portafolio fotográfico de proyectos entregados: viviendas unifamiliares, estaciones comerciales, edificios multifamiliares y campus universitarios en Huancayo, El Tambo, Jauja y Lima."
          imagen="/catalogo/fachadas-muros-cortina/general-1.webp"
          imagenAlt="Obras y proyectos arquitectónicos de GMS Integra"
          badge="Portafolio de Obras"
          meta={
            <>
              <span className="rounded-xl bg-white/10 px-3.5 py-1.5 backdrop-blur-xs border border-white/15">
                5 Zonas Geográficas
              </span>
              <span className="rounded-xl bg-emerald-500/20 text-emerald-300 px-3.5 py-1.5 backdrop-blur-xs border border-emerald-500/30">
                1 Año Garantía Escrita
              </span>
            </>
          }
          acciones={
            <a
              href={enlaceDeWhatsApp("Hola GMS Integra, vi el portafolio de obras ejecutadas y deseo cotizar un proyecto arquitectónico.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-emerald-500 transition-all"
            >
              <MessageSquare className="size-4" />
              <span>Cotizar Obra Similar</span>
            </a>
          }
        />

        {/* ── Galería Bento de Proyectos ── */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <GaleriaObras obras={obras} zonas={zonas} />
        </section>

        {/* ── Banner de Cotización para Constructoras / Propietarios ── */}
        <section className="border-t border-border bg-card py-16">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-sm">
              <Wrench className="size-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              ¿Deseas este nivel de acabado para tu construcción o vivienda?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Evaluamos tus planos de carpintería, medidas de vanos y requerimientos acústicos. Te entregamos una propuesta técnico-económica desglosada con perfiles de alta gama y vidrio templado certificado.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href={enlaceDeWhatsApp("Hola GMS Integra, vi las obras ejecutadas en la web y deseo cotizar la carpintería de aluminio y vidrio para mi proyecto.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-7 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-emerald-500 transition-all active:scale-98"
              >
                <MessageSquare className="size-4" />
                <span>Cotizar Proyecto por WhatsApp</span>
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <FloatingCta />
    </div>
  );
}
