import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { FloatingCta } from "@/components/landing/floating-cta";
import { CabeceraDePagina } from "@/components/blog/cabecera-blog";
import { IndiceDeArticulo } from "@/components/blog/indice-articulo";
import { Compartir } from "@/components/blog/compartir";
import { siteConfig } from "@/config/site-config";
import { NOMBRE_DE_ETIQUETA } from "@/lib/blog/esquema";
import { leerPorSlug, leerRutas, relacionados, serieDe } from "@/lib/blog/leer";

export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return leerRutas().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const articulo = leerPorSlug(slug);
  if (!articulo) return {};

  const url = `${siteConfig.url}/blog/${slug}`;

  return {
    title: articulo.titulo,
    description: articulo.descripcion,
    authors: [{ name: articulo.autor }],
    keywords: articulo.etiquetas.map((e) => NOMBRE_DE_ETIQUETA[e]),
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: articulo.titulo,
      description: articulo.descripcion,
      locale: "es_PE",
      publishedTime: articulo.fecha,
      modifiedTime: articulo.actualizado ?? articulo.fecha,
      authors: [articulo.autor],
      tags: articulo.etiquetas,
      images: [{ url: `${siteConfig.url}${articulo.portada}`, width: 1920, height: 1080 }],
    },
    twitter: {
      card: "summary_large_image",
      title: articulo.titulo,
      description: articulo.descripcion,
      images: [`${siteConfig.url}${articulo.portada}`],
    },
  };
}

function fechaLegible(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Dato({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/60">
        {rotulo}
      </span>
      <span className="text-[13px] font-semibold leading-snug text-foreground/75">{children}</span>
    </div>
  );
}

export default async function ArticuloPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const articulo = leerPorSlug(slug);

  if (!articulo) notFound();

  const { default: Contenido } = await import(`@/../content/blog/${slug}.mdx`);
  const url = `${siteConfig.url}/blog/${slug}`;
  const relacionadas = relacionados(articulo);
  const serie = serieDe(articulo);
  const posicionEnSerie = serie.findIndex((a) => a.slug === articulo.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: articulo.titulo,
    description: articulo.descripcion,
    image: `${siteConfig.url}${articulo.portada}`,
    datePublished: articulo.fecha,
    dateModified: articulo.actualizado ?? articulo.fecha,
    author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: "es-PE",
    wordCount: articulo.palabras,
    keywords: articulo.etiquetas.map((e) => NOMBRE_DE_ETIQUETA[e]).join(", "),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1">
        <CabeceraDePagina
          migas={[
            { nombre: "Inicio", href: "/" },
            { nombre: "Blog", href: "/blog" },
            { nombre: articulo.titulo },
          ]}
          antetitulo={articulo.serie ?? "Guía Técnica"}
          titulo={articulo.titulo}
          resumen={articulo.descripcion}
          imagen={articulo.portada}
          imagenAlt={articulo.portadaAlt}
          badge="Lectura Técnica"
          meta={
            <>
              <span className="rounded-xl bg-white/10 px-3.5 py-1.5 backdrop-blur-xs border border-white/15">
                Por {articulo.autor}
              </span>
              <span className="rounded-xl bg-white/10 px-3.5 py-1.5 backdrop-blur-xs border border-white/15">
                {fechaLegible(articulo.fecha)}
              </span>
              <span className="rounded-xl bg-[#00c9ff]/20 text-[#00c9ff] px-3.5 py-1.5 backdrop-blur-xs border border-[#00c9ff]/30">
                {articulo.minutosDeLectura} min de lectura
              </span>
            </>
          }
        />

        <div className="container mx-auto grid max-w-[92rem] grid-cols-1 gap-x-10 gap-y-10 px-4 py-14 md:px-6 xl:grid-cols-[15rem_minmax(0,1fr)_16rem] xl:py-20">
          <aside className="hidden xl:block">
            <div className="sticky top-28 flex flex-col gap-9">
              <IndiceDeArticulo encabezados={articulo.encabezados} />
              <Compartir url={url} titulo={articulo.titulo} />
            </div>
          </aside>

          <div className="mx-auto w-full min-w-0 max-w-3xl">
            {serie.length > 1 && (
              <aside className="mb-10 rounded-2xl border border-primary/25 bg-primary/[0.06] p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                  Serie · {articulo.serie}
                </p>
                <ol className="mt-4 flex flex-col gap-2.5">
                  {serie.map((paso, i) => (
                    <li key={paso.slug} className="flex items-baseline gap-3">
                      <span
                        className={
                          i === posicionEnSerie
                            ? "text-sm font-black text-primary"
                            : "text-sm font-bold text-muted-foreground/60"
                        }
                      >
                        {i + 1}
                      </span>
                      {i === posicionEnSerie ? (
                        <span className="text-sm font-bold text-foreground">{paso.titulo}</span>
                      ) : (
                        <Link
                          href={`/blog/${paso.slug}`}
                          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                          {paso.titulo}
                        </Link>
                      )}
                    </li>
                  ))}
                </ol>
              </aside>
            )}

            {articulo.encabezados.length > 2 && (
              <details className="mb-10 rounded-2xl border border-border bg-muted p-5 xl:hidden">
                <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                  En este artículo
                </summary>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {articulo.encabezados.map((h) => (
                    <li key={h.id} className={h.nivel === 3 ? "pl-4" : ""}>
                      <a
                        href={`#${h.id}`}
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                      >
                        {h.texto}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <Contenido />

            <div className="mt-16 rounded-3xl border border-border bg-gradient-to-b from-primary/15 to-muted p-8 md:p-10">
              <h2 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
                ¿Quieres este acabado en tu proyecto?
              </h2>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
                Escríbenos y te asesoramos con las medidas y el presupuesto de tu proyecto. Sin compromisos — te respondemos en menos de 4 horas.
              </p>
              <a
                href={`https://wa.me/${siteConfig.whatsapp.numero}?text=${encodeURIComponent(`Hola, leí «${articulo.titulo}» en el blog de GMS Integra y quiero asesoría para mi proyecto.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-block rounded-full border-2 border-foreground bg-foreground px-8 py-3.5 text-sm font-black uppercase tracking-wider text-background transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white"
              >
                Cotizar por WhatsApp
              </a>
            </div>

            <Compartir
              url={url}
              titulo={articulo.titulo}
              orientacion="horizontal"
              className="mt-12 border-t border-border pt-8 xl:hidden"
            />
          </div>

          <aside className="min-w-0">
            <div className="sticky top-28 flex flex-col gap-7 rounded-2xl border border-border bg-card p-6">
              <Dato rotulo="Escrito por">{articulo.autor}</Dato>
              <Dato rotulo="Publicado">{fechaLegible(articulo.fecha)}</Dato>
              {articulo.actualizado && (
                <Dato rotulo="Actualizado">{fechaLegible(articulo.actualizado)}</Dato>
              )}
              <Dato rotulo="Lectura">
                {articulo.minutosDeLectura} min · {articulo.palabras.toLocaleString("es-PE")}{" "}
                palabras
              </Dato>

              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/60">
                  Temas
                </span>
                <div className="flex flex-wrap gap-2">
                  {articulo.etiquetas.map((etiqueta) => (
                    <Link
                      key={etiqueta}
                      href={`/blog/etiqueta/${etiqueta}`}
                      className="rounded-full border border-border px-3 py-1.5 text-[11px] font-bold text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                    >
                      {NOMBRE_DE_ETIQUETA[etiqueta]}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {relacionadas.length > 0 && (
          <section className="border-t border-border/50 px-4 py-16 md:px-6">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                Seguir leyendo
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
                {relacionadas.map((otro) => (
                  <Link
                    key={otro.slug}
                    href={`/blog/${otro.slug}`}
                    className="group flex flex-col gap-3"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border bg-muted">
                      <Image
                        src={otro.portada}
                        alt={otro.portadaAlt}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    </div>
                    <h3 className="text-base font-black leading-tight text-foreground transition-colors group-hover:text-primary">
                      {otro.titulo}
                    </h3>
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {otro.minutosDeLectura} min
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
      <FloatingCta />
    </div>
  );
}
