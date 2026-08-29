import type { Metadata } from "next";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { FloatingCta } from "@/components/landing/floating-cta";
import { CabeceraDePagina } from "@/components/blog/cabecera-blog";
import { TarjetaCategoria } from "@/components/catalogo/tarjeta-categoria";
import { siteConfig } from "@/config/site-config";
import { obtenerCategorias } from "@/lib/catalogo/leer";
import { exigirCatalogoValido } from "@/lib/catalogo/validar";
import { ArrowRight, MessageSquare, Shield, CheckCircle2 } from "lucide-react";

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
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1">
        {/* Hero de Catálogo */}
        <CabeceraDePagina
          migas={[{ nombre: "Inicio", href: "/" }, { nombre: "Catálogo" }]}
          titulo="Líneas de Producto & Sistemas"
          resumen="Catálogo técnico de carpintería de aluminio y cristal templado: ventanas herméticas, mamparas monumentales, muros cortina, barandas de acero y techos diseñados para alto aislamiento térmico y acústico."
          imagen="/catalogo/fachadas-muros-cortina/general-1.webp"
          imagenAlt="Catálogo de carpintería de aluminio y vidrio GMS Integra"
          badge="Catálogo 2025"
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

        {/* ── Banner de Asesoría Técnica ── */}
        <section className="border-t border-border bg-card py-14">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
              <Shield className="size-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              ¿Tienes un plano o diseño personalizado para tu obra?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Envíanos tus medidas, planos de arquitectura o bocetos por WhatsApp. Nuestro maestro de taller evaluará la perfilería y el espesor de cristal adecuado con presupuesto formal en menos de 4 horas.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href={`https://wa.me/${siteConfig.whatsapp.numero}?text=${encodeURIComponent(
                  "Hola GMS Integra, tengo un proyecto en mente y deseo enviar medidas/planos para una cotización."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-7 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-emerald-500 transition-all active:scale-98"
              >
                <MessageSquare className="size-4" />
                <span>Consultar por WhatsApp</span>
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
