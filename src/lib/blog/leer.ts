import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import {
  DIRECTORIO_CONTENIDO,
  PALABRAS_POR_MINUTO,
  type Articulo,
  type Encabezado,
  type Etiqueta,
} from "./esquema";
import { slugDeArchivo } from "./slug";

/**
 * EL LECTOR — construye el índice del blog leyendo el disco, sin compilar MDX.
 *
 * Esta es la pieza que decide si el blog escala. La alternativa evidente
 * —importar cada `.mdx` para leer su título— empaqueta el contenido de TODOS
 * los artículos en la página que solo quiere pintar una lista de enlaces. Con
 * veinte artículos se nota; con doscientos, el índice pesa más que el sitio.
 *
 * Aquí se lee el archivo como texto, se extrae la cabecera YAML con gray-matter
 * y se cuentan los encabezados con una expresión regular. El MDX solo se compila
 * en la página del artículo, y solo el que se está viendo.
 *
 * Solo servidor: usa `node:fs`.
 */

const RAIZ = path.join(/*turbopackIgnore: true*/ process.cwd(), DIRECTORIO_CONTENIDO);

/**
 * Encabezados de nivel 2 y 3 en el cuerpo del artículo, para el índice lateral.
 *
 * ⚠️ Los `id` se calculan con **la misma librería que los genera**: `rehype-slug`
 * usa `github-slugger` por debajo, y ese slugger **conserva los acentos** —
 * «Por qué…» produce `por-qué-…`, con la tilde dentro—. La normalización de
 * `slug.ts`, que sí los quita, daría `por-que-…` y el enlace no saltaría a
 * ninguna parte.
 *
 * Se midió: con la versión anterior, **cinco de los ocho enlaces** del índice
 * del primer artículo apuntaban a un ancla inexistente. Un `href="#…"` roto no
 * da error ni se ve en el build: simplemente no hace nada al pulsarlo.
 *
 * El slugger se instancia por artículo, no una vez, porque lleva cuenta de los
 * títulos repetidos para desambiguarlos (`-1`, `-2`) — igual que hace
 * `rehype-slug` con cada archivo.
 */
function extraerEncabezados(cuerpo: string): Encabezado[] {
  const encabezados: Encabezado[] = [];
  const slugger = new GithubSlugger();

  // Los bloques de código pueden contener almohadillas al principio de línea
  // (comentarios de shell, por ejemplo). Se retiran antes de buscar títulos, o
  // el índice acaba con entradas que no existen en la página.
  const sinCodigo = cuerpo.replace(/```[\s\S]*?```/g, "");

  for (const linea of sinCodigo.split("\n")) {
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(linea);
    if (!m) continue;

    const texto = m[2]
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

    encabezados.push({
      id: slugger.slug(texto),
      texto,
      nivel: m[1].length === 2 ? 2 : 3,
    });
  }

  return encabezados;
}

function contarPalabras(cuerpo: string): number {
  return cuerpo
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function leerArchivo(nombreDeArchivo: string): Articulo {
  const crudo = fs.readFileSync(path.join(/*turbopackIgnore: true*/ RAIZ, nombreDeArchivo), "utf8");

  let data: Record<string, unknown>;
  let content: string;
  try {
    const parseado = matter(crudo);
    data = parseado.data;
    content = parseado.content;
  } catch (causa) {
    // El fallo más frecuente al escribir un artículo, y el que peor se explica
    // solo: un `: ` dentro de un valor sin comillas. YAML lo interpreta como
    // una clave nueva y revienta con un volcado del búfer que no dice qué hacer.
    throw new Error(
      `No se pudo leer la cabecera de content/blog/${nombreDeArchivo}.\n` +
        `Causa habitual: un valor contiene «: » y no está entre comillas. ` +
        `Escribe titulo y descripcion siempre entre comillas dobles.\n` +
        `Detalle de YAML: ${causa instanceof Error ? causa.message.split("\n")[0] : String(causa)}`,
    );
  }

  const palabras = contarPalabras(content);

  return {
    ...(data as Omit<Articulo, "slug" | "encabezados" | "minutosDeLectura" | "palabras">),
    // gray-matter convierte las fechas YAML sin comillas a Date. Se normalizan a
    // ISO corto para que el orden, la URL y el sitemap hablen el mismo idioma.
    fecha: aFechaISO(data.fecha),
    actualizado: data.actualizado ? aFechaISO(data.actualizado) : undefined,
    slug: slugDeArchivo(nombreDeArchivo),
    encabezados: extraerEncabezados(content),
    palabras,
    minutosDeLectura: Math.max(1, Math.round(palabras / PALABRAS_POR_MINUTO)),
  };
}

function aFechaISO(valor: unknown): string {
  if (valor instanceof Date) return valor.toISOString().slice(0, 10);
  return String(valor ?? "").slice(0, 10);
}

/** Todos los artículos del disco, borradores incluidos. Para el validador. */
export function leerTodos(): Articulo[] {
  if (!fs.existsSync(RAIZ)) return [];

  return fs
    .readdirSync(RAIZ)
    .filter((f) => f.endsWith(".mdx"))
    .map(leerArchivo)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/**
 * Los artículos publicados, del más reciente al más antiguo.
 *
 * Un artículo con fecha futura no aparece hasta que llega el día. Con el
 * `revalidate` diario de la página, eso lo publica solo — es el único caso en
 * el que ISR hace algo real en un blog con el contenido en el repositorio.
 */
export function leerPublicados(): Articulo[] {
  const hoy = new Date().toISOString().slice(0, 10);
  return leerTodos().filter((a) => !a.borrador && a.fecha <= hoy);
}

/**
 * Las rutas que hay que prerrenderizar: todo lo que no es borrador, **incluidos
 * los de fecha futura**.
 *
 * Esto es sutil y decide si un artículo programado llega a publicarse.
 * `generateStaticParams` solo corre en el build, y con `dynamicParams = false`
 * una ruta que no salga de ahí es un 404 permanente. Así que la ruta se crea
 * hoy; la página devuelve `notFound()` hasta que llega la fecha, y el
 * `revalidate` diario es lo que la abre sola. Si aquí se filtrara por fecha, un
 * artículo programado no aparecería nunca sin volver a desplegar.
 */
export function leerRutas(): Articulo[] {
  return leerTodos().filter((a) => !a.borrador);
}

export function leerPorSlug(slug: string): Articulo | undefined {
  return leerPublicados().find((a) => a.slug === slug);
}

/** Las etiquetas que tienen al menos un artículo publicado, con su cuenta. */
export function etiquetasUsadas(): { etiqueta: Etiqueta; total: number }[] {
  const cuenta = new Map<Etiqueta, number>();

  for (const articulo of leerPublicados()) {
    for (const etiqueta of articulo.etiquetas) {
      cuenta.set(etiqueta, (cuenta.get(etiqueta) ?? 0) + 1);
    }
  }

  return [...cuenta.entries()]
    .map(([etiqueta, total]) => ({ etiqueta, total }))
    .sort((a, b) => b.total - a.total || a.etiqueta.localeCompare(b.etiqueta));
}

export function leerPorEtiqueta(etiqueta: string): Articulo[] {
  return leerPublicados().filter((a) => a.etiquetas.includes(etiqueta as Etiqueta));
}

/**
 * Artículos relacionados: los que más etiquetas comparten, y a igualdad, los
 * más recientes. Se calcula al construir, así que no cuesta nada en ejecución.
 */
export function relacionados(articulo: Articulo, cuantos = 3): Articulo[] {
  return leerPublicados()
    .filter((a) => a.slug !== articulo.slug)
    .map((a) => ({
      articulo: a,
      comunes: a.etiquetas.filter((e) => articulo.etiquetas.includes(e)).length,
    }))
    .filter((x) => x.comunes > 0)
    .sort((a, b) => b.comunes - a.comunes || b.articulo.fecha.localeCompare(a.articulo.fecha))
    .slice(0, cuantos)
    .map((x) => x.articulo);
}

/** Los artículos de una serie, en su orden de lectura. */
export function serieDe(articulo: Articulo): Articulo[] {
  if (!articulo.serie) return [];
  return leerPublicados()
    .filter((a) => a.serie === articulo.serie)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
}
