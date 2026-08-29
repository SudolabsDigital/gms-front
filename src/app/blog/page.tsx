import type { Metadata } from "next";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { FloatingCta } from "@/components/landing/floating-cta";
import { CabeceraDePagina } from "@/components/blog/cabecera-blog";
import { BaldosaDeArticulo } from "@/components/blog/baldosa-articulo";
import { BuscadorDeBlog, type EntradaDeBusqueda } from "@/components/blog/buscador-blog";
import { siteConfig } from "@/config/site-config";
import { etiquetasUsadas, leerPublicados } from "@/lib/blog/leer";
import { exigirBlogValido } from "@/lib/blog/validar";
import { NOMBRE_DE_ETIQUETA } from "@/lib/blog/esquema";
import { componerMosaico } from "@/lib/blog/ranking";

export const revalidate = 86400;

const DESCRIPCION =
  "Guías, novedades y consejos para tu proyecto. Todo lo que necesitas saber sobre ventanas de aluminio, mamparas de vidrio templado, fachadas y acabados arquitectónicos.";

export const metadata: Metadata = {
  title: "Blog",
  description: DESCRIPCION,
  alternates: { canonical: `${siteConfig.url}/blog` },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/blog`,
    title: `Blog | ${siteConfig.name}`,
    description: DESCRIPCION,
  },
};

export default function BlogPage() {
  exigirBlogValido();

  const articulos = leerPublicados();
  const etiquetas = etiquetasUsadas();
  const mosaico = componerMosaico(articulos);

  const indice: EntradaDeBusqueda[] = articulos.map((a) => ({
    slug: a.slug,
    titulo: a.titulo,
    descripcion: a.descripcion,
    etiquetas: [...a.etiquetas],
    temas: a.etiquetas.map((e) => NOMBRE_DE_ETIQUETA[e]),
    encabezados: a.encabezados.map((h) => h.texto),
    autor: a.autor,
    serie: a.serie,
    fecha: a.fecha,
    minutos: a.minutosDeLectura,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <CabeceraDePagina
          migas={[{ nombre: "Inicio", href: "/" }, { nombre: "Blog" }]}
          titulo="Blog Técnico & Consejos de Obra"
          resumen="Guías prácticas, comparativas de series de aluminio, normativas acústicas y consejos de mantenimiento para tus ventanas y mamparas. Escrito por el equipo técnico de taller."
          imagen="/catalogo/mamparas/m-serie-49.webp"
          imagenAlt="Mamparas monumentales y proyectos de aluminio y vidrio de GMS Integra"
          badge="Guías & Consejos"
          meta={
            <>
              <span className="rounded-xl bg-white/10 px-3.5 py-1.5 backdrop-blur-xs border border-white/15">
                {articulos.length} {articulos.length === 1 ? "Artículo Publicado" : "Artículos Publicados"}
              </span>
              {etiquetas.length > 0 && (
                <span className="rounded-xl bg-white/10 px-3.5 py-1.5 backdrop-blur-xs border border-white/15">
                  {etiquetas.length} {etiquetas.length === 1 ? "Categoría Temática" : "Categorías Temáticas"}
                </span>
              )}
            </>
          }
        />

        <section className="border-b border-border/50 px-4 py-8 md:px-8 md:py-10">
          <div className="mx-auto w-full max-w-4xl">
            <BuscadorDeBlog
              indice={indice}
              accesos={etiquetas.map(({ etiqueta, total }) => ({
                etiqueta,
                nombre: NOMBRE_DE_ETIQUETA[etiqueta],
                total,
              }))}
            />
          </div>
        </section>

        {articulos.length === 0 ? (
          <section className="px-4 py-24 md:px-8">
            <p className="text-muted-foreground text-center">Todavía no hay artículos publicados.</p>
          </section>
        ) : (
          <section className="px-4 py-10 md:px-8 md:py-14">
            <div className="mx-auto grid w-full max-w-[110rem] grid-flow-dense grid-cols-1 gap-4 md:auto-rows-[15.5rem] md:grid-cols-6 md:gap-5">
              {mosaico.map(({ articulo, nivel }, i) => (
                <BaldosaDeArticulo
                  key={articulo.slug}
                  articulo={articulo}
                  nivel={nivel}
                  prioridad={i === 0}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
      <FloatingCta />
    </div>
  );
}
