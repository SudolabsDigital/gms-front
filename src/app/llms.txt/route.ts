import { direccionCompleta, horarioVisible, siteConfig } from "@/config/site-config";
import { obtenerCategorias } from "@/lib/catalogo/leer";
import { obtenerTodasLasObras } from "@/lib/obras/leer";
import { leerPublicados } from "@/lib/blog/leer";

/**
 * `/llms.txt` — Índice del sitio en formato Markdown para motores generativos y agentes IA.
 *
 * Sigue la convención https://llmstxt.org: título, resumen ejecutivo y enlaces con
 * descripción concisa. Se genera desde la fuente de verdad (catálogo, obras y blog)
 * con export force-static para no impactar tiempo de respuesta ni cómputo en cliente.
 */
export const dynamic = "force-static";

const linea = (titulo: string, ruta: string, desc?: string) =>
  `- [${titulo}](${siteConfig.url}${ruta})${desc ? `: ${desc}` : ""}`;

export async function GET() {
  const categorias = obtenerCategorias();
  const obras = obtenerTodasLasObras();
  const articulos = leerPublicados();

  const cuerpo = [
    `# ${siteConfig.name}`,
    "",
    "> Especialistas en ingeniería, fabricación e instalación de ventanas herméticas, mamparas de cristal templado, fachadas integrales y carpintería de aluminio de alta prestación en Huancayo y la región centro del Perú.",
    "",
    `Empresa industrial y taller de arquitectura en aluminio y vidrio con sede en ${direccionCompleta()}, Perú.`,
    "Cumplimiento de norma técnica peruana NTP 399.012, perfilería aleación AA6063-T5, cristal de seguridad templado de 6 a 12 mm y sistemas termoacústicos herméticos.",
    "",
    "## Páginas Principales",
    linea("Inicio", "/", "Soluciones arquitectónicas en aluminio y cristal"),
    linea("Catálogo de Soluciones", "/catalogo", "Ventanas, mamparas, fachadas, barandas y techos"),
    linea("Obras Ejecutadas", "/obras", "Proyectos residenciales, comerciales e institucionales en Junín"),
    linea("Blog Técnico", "/blog", "Guías de especificación, aislamiento acústico y cálculo"),
    linea("Términos y Condiciones", "/terminos-y-condiciones", "Condiciones de servicio y garantías de instalación"),
    linea("Política de Privacidad", "/politica-de-privacidad", "Tratamiento de datos personales"),
    "",
    "## Catálogo de Soluciones Arquitectónicas",
    ...categorias.map((cat) =>
      linea(
        cat.nombre,
        `/catalogo/${cat.slug}`,
        cat.descripcion || `${cat.totalItems} modelos y configuraciones en ${cat.nombre.toLowerCase()}`
      )
    ),
    "",
    "## Obras Destacadas en el Valle del Mantaro",
    ...obras
      .filter((o) => o.destacado)
      .map((o) =>
        linea(
          o.titulo,
          `/obras/${o.id}`,
          `${o.tipoNombre} en ${o.zonaNombre} (${o.materiales.join(", ")})`
        )
      ),
    "",
    "## Artículos y Documentación Técnica",
    ...articulos.map((art) =>
      linea(
        art.titulo,
        `/blog/${art.slug}`,
        art.descripcion || `Publicado el ${art.fecha}`
      )
    ),
    "",
    "## Contacto Directo",
    `- Teléfono / WhatsApp: +${siteConfig.whatsapp.numero}`,
    `- Dirección: ${direccionCompleta()}, Perú`,
    `- Horario: ${horarioVisible()}`,
    `- Web Oficial: ${siteConfig.url}`,
    "",
  ].join("\n");

  return new Response(cuerpo, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
