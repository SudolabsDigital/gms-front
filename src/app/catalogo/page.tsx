import type { Metadata } from "next";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { FloatingCta } from "@/components/landing/floating-cta";
import { CabeceraDePagina } from "@/components/layout/subhero-cabecera";
import { TarjetaCategoria } from "@/components/catalogo/tarjeta-categoria";
import { siteConfig } from "@/config/site-config";
import BreadcrumbSchema from "@/components/seo/breadcrumb-schema";
import { obtenerCategorias } from "@/lib/catalogo/leer";
import { exigirCatalogoValido } from "@/lib/catalogo/validar";

export const revalidate = 86400;

const DESCRIPCION =
  "Catálogo técnico y galería de obras ejecutadas en carpintería de aluminio, cristal templado, mamparas, ventanas, puertas y fachadas en Huancayo y el Valle del Mantaro.";

export const metadata: Metadata = {
  title: "Catálogo de Productos y Obras",
  description: DESCRIPCION,
  alternates: { canonical: `${siteConfig.url}/catalogo` },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/catalogo`,
    title: `Catálogo de Productos y Obras | ${siteConfig.name}`,
    description: DESCRIPCION,
    images: [{ url: `${siteConfig.url}/og-image.png`, width: 1200, height: 630 }],
  },
};

export default function CatalogoPage() {
  exigirCatalogoValido();

  const categorias = obtenerCategorias();
  const totalModelos = categorias.reduce((acc, c) => acc + c.totalItems, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Catálogo de Productos y Obras GMS Integra",
    description: DESCRIPCION,
    url: `${siteConfig.url}/catalogo`,
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
    hasPart: categorias.map((c) => ({
      "@type": "ItemList",
      name: c.nombre,
      description: c.descripcion,
      url: `${siteConfig.url}/catalogo/${c.slug}`,
    })),
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <BreadcrumbSchema
        items={[
          { name: "Inicio", item: "/" },
          { name: "Catálogo", item: "/catalogo" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1">
        {/* Hero de Catálogo */}
        <CabeceraDePagina
          migas={[{ nombre: "Inicio", href: "/" }, { nombre: "Catálogo" }]}
          titulo="Líneas de Producto & Sistemas"
          pregunta="¿Qué vas a cerrar en tu obra?"
          resumen="Catálogo técnico de carpintería de aluminio y cristal templado: ventanas herméticas, mamparas monumentales, muros cortina, barandas de acero y techos diseñados para alto aislamiento térmico y acústico."
          /* 1200x904 (1,33) = horizontal, que es lo que la cabecera asume por defecto.
             Enseña varias líneas en la misma foto —ventanal continuo, baranda, carpintería—, que es
             lo que esta página promete; la anterior era un muro cortina que además está duplicado en
             tres carpetas y se repetía en /obras. */
          imagen="/catalogo/ventanas/v-proyectantes-47.webp"
          imagenAlt="Fachada de dos plantas con ventanal continuo de aluminio, baranda de acero y cristal, ejecutada por GMS Integra en Huancayo"
          meta={
            <>
              <span className="rounded-xl bg-white/10 px-3.5 py-1.5 backdrop-blur-xs border border-white/15">
                {categorias.length} Líneas de Fabricación
              </span>
              <span className="rounded-xl bg-white/10 px-3.5 py-1.5 backdrop-blur-xs border border-white/15">
                +{totalModelos} Modelos Registrados
              </span>
              <span className="rounded-xl bg-emerald-500/20 text-emerald-300 px-3.5 py-1.5 backdrop-blur-xs border border-emerald-500/30">
                1 Año Garantía Escrita
              </span>
            </>
          }
        />

        {/* ── Grid de Categorías ── */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6 mb-10">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-primary">
                Categorías & Soluciones
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Selecciona una Línea para Explorar
              </h2>
            </div>
            <p className="text-xs text-muted-foreground max-w-md">
              Cada categoría incluye sub-filtros por series de aluminio, especificaciones técnicas de vidrio y botón de cotización directa.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categorias.map((cat, i) => (
              <TarjetaCategoria key={cat.slug} categoria={cat} prioridad={i < 3} />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
      <FloatingCta />
    </div>
  );
}
