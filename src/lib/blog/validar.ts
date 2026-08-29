import fs from "node:fs";
import path from "node:path";
import { ETIQUETAS, type Articulo } from "./esquema";
import { aSlug } from "./slug";
import { leerTodos } from "./leer";

/**
 * LA PUERTA.
 *
 * Un frontmatter libre se degrada solo: un artículo sin descripción, otro con
 * una etiqueta escrita de dos formas, un tercero apuntando a una imagen que
 * alguien borró. Ninguno de esos tres rompe el build por su cuenta — se
 * publican, y el fallo lo descubre un lector.
 *
 * Por eso esto no avisa: FALLA. Un estándar que nadie comprueba es una
 * preferencia, y una preferencia no sobrevive a la tercera semana con prisa.
 */

export interface Problema {
  slug: string;
  campo: string;
  mensaje: string;
}

const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

function revisarArticulo(a: Articulo, vistos: Map<string, string>): Problema[] {
  const problemas: Problema[] = [];
  const falla = (campo: string, mensaje: string) =>
    problemas.push({ slug: a.slug, campo, mensaje });

  for (const campo of ["titulo", "descripcion", "portada", "portadaAlt", "autor"] as const) {
    if (!a[campo] || String(a[campo]).trim() === "") {
      falla(campo, "es obligatorio y está vacío");
    }
  }

  if (!FECHA_ISO.test(a.fecha)) {
    falla("fecha", `debe ser YYYY-MM-DD; se leyó «${a.fecha}»`);
  }
  if (a.actualizado && !FECHA_ISO.test(a.actualizado)) {
    falla("actualizado", `debe ser YYYY-MM-DD; se leyó «${a.actualizado}»`);
  }
  if (a.actualizado && a.actualizado < a.fecha) {
    falla("actualizado", "es anterior a la fecha de publicación");
  }

  // El slug es la llave de la ruta, del sitemap, de la carpeta de imágenes y de
  // la canónica. Repetirlo no rompe el build, pero deja dos artículos peleando
  // por una URL — y eso solo se nota cuando ya está indexado.
  const duplicado = vistos.get(a.slug);
  if (duplicado) {
    falla("slug", `repetido: ya lo usa «${duplicado}»`);
  } else {
    vistos.set(a.slug, a.titulo);
  }

  // El slug sale del nombre del archivo; el título es lo que el lector ve. Si
  // divergen, la URL deja de describir el contenido.
  const esperado = aSlug(a.titulo);
  if (a.slug !== esperado) {
    falla(
      "slug",
      `el archivo debería llamarse «${esperado}.mdx» para casar con el título «${a.titulo}»`,
    );
  }

  if (!Array.isArray(a.etiquetas) || a.etiquetas.length === 0) {
    falla("etiquetas", "hace falta al menos una");
  } else {
    for (const etiqueta of a.etiquetas) {
      if (!ETIQUETAS.includes(etiqueta)) {
        falla("etiquetas", `«${etiqueta}» no está en el vocabulario de esquema.ts`);
      }
    }
  }

  // Una portada rota no se ve en desarrollo si el navegador la tenía en caché,
  // y en el índice deja un hueco. Se comprueba contra el disco si existe el directorio public/.
  if (a.portada) {
    if (!a.portada.startsWith("/")) {
      falla("portada", "debe ser una ruta absoluta bajo public/, empezando por «/»");
    } else {
      const publicDir = path.join(process.cwd(), "public");
      if (fs.existsSync(publicDir) && !fs.existsSync(path.join(publicDir, a.portada))) {
        falla("portada", `no existe el archivo public${a.portada}`);
      }
    }
  }

  if (a.serie && (a.orden === undefined || a.orden === null)) {
    falla("orden", `es obligatorio cuando hay serie («${a.serie}»)`);
  }

  return problemas;
}

export function validarBlog(): Problema[] {
  const vistos = new Map<string, string>();
  return leerTodos().flatMap((a) => revisarArticulo(a, vistos));
}

/**
 * Se llama desde el índice del blog, que es servidor y se renderiza en cada
 * build. Así la puerta corre sin script aparte ni paso de CI que alguien pueda
 * olvidarse de añadir: si un artículo está mal, `next build` no termina.
 */
export function exigirBlogValido(): void {
  const problemas = validarBlog();
  if (problemas.length === 0) return;

  const detalle = problemas
    .map((p) => `  · ${p.slug} → ${p.campo}: ${p.mensaje}`)
    .join("\n");

  throw new Error(
    `El blog tiene ${problemas.length} problema(s) de frontmatter:\n${detalle}\n\n` +
      `El esquema está en src/lib/blog/esquema.ts.`,
  );
}
