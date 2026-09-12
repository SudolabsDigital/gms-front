#!/usr/bin/env node
/**
 * Puerta del sistema de diseño para GMS INTEGRA: falla cuando el código se salta una pieza que ya
 * existe —el token de color, la fábrica de enlaces, el componente de imagen— y la reimplementa a
 * mano.
 *
 * Principio 14 DreamDev: "Un estándar sin puerta es una preferencia."
 *
 * Medido por esta misma puerta el 2026-09-10: los tokens `--brand` y `--primary` existían desde la
 * sesión 4 y convivían con 148 literales de esos dos colores en 29 archivos; `enlaceDeWhatsApp()`
 * existía con 0 usos frente a 35 enlaces construidos a mano. No fue desconocimiento: faltaba el
 * mecanismo que lo propaga.
 *
 * Los umbrales los cuenta el script, no un `grep` de fuera. Una auditoría previa había dicho
 * "138 y 6" contando el cian a solas y los `eslint-disable` en vez de las etiquetas: quien declara
 * el número tiene que ser quien lo va a comprobar, o el umbral y la puerta miden cosas distintas.
 *
 * CÓMO FUNCIONA EL TRINQUETE. Cada invariante lleva el número REAL de infracciones de hoy, no uno
 * cómodo: una puerta que no puede fallar no es una puerta. A partir de ahí solo puede bajar.
 *   - Si el recuento SUBE, es una regresión y el build se cae.
 *   - Si BAJA, el build también se cae, para obligar a apuntar el número nuevo en el mismo commit
 *     que lo consiguió. Un umbral que nadie baja vuelve a ser una preferencia, y la deuda que ya
 *     se pagó reaparecería sin que nadie lo note.
 *
 * Ejecución:
 *   node scripts/check-tokens.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const RAIZ = process.cwd();
const OBJETIVOS = ["src"];
const EXTENSIONES = [".ts", ".tsx", ".css"];

/**
 * Invariantes del sistema de diseño, con su umbral medido y su vía de salida.
 *
 * `umbral` es el recuento real del día que se declaró. `exentos` son los archivos donde el patrón
 * es legítimo: el que DEFINE el token, o el que ES la fábrica.
 */
const INVARIANTES = [
  {
    id: "INV-P02",
    nombre: "color de marca por token, no por literal",
    patron: /#(?:00c9ff|004aad)\b/gi,
    exentos: ["src/app/globals.css"],
    // 148 -> 143 al migrar las tres tarjetas al organismo unico (T3.2), que usa el token.
    // 143 -> 105 al borrar los 10 componentes sin importador (T6.4): 38 de las 143 infracciones
    // vivian en codigo que nadie renderizaba. El numero llevaba meses midiendo deuda inexistente.
    umbral: 105,
    salida: "Usa las utilidades del token: `text-brand` / `bg-brand` / `border-brand` para el cian, y `text-primary` / `bg-primary` para el azul. Los valores se declaran una sola vez en `globals.css`.",
  },
  {
    id: "INV-P03",
    nombre: "enlaces de WhatsApp por la fábrica única",
    patron: /wa\.me\//g,
    exentos: ["src/config/site-config.ts"],
    // 35 → 13 al migrar los CTA del portal (T2.2) → 10 al absorber `tarjeta-categoria` y el carril
    // del blog en `AccionesDeContenido` (T2.3).
    //
    // Los 10 que quedan tienen dueño y fecha, no son deuda anónima:
    //   · 5 viven dentro del visor de `galeria-catalogo` y `galeria-obras`. Ese visor son ~350
    //     líneas duplicadas entre ambos y se extrae en su propio tramo; migrarlos ahora es
    //     reescribir código que ese tramo va a borrar.
    //   · 5 están en componentes sin un solo importador, que se retiran en T6.4.
    //
    // 10 -> 5 al cerrarse T6.4: esos 5 se fueron con sus componentes. Los 5 que quedan son los del
    // visor duplicado, y ese sigue siendo su propio tramo.
    umbral: 5,
    salida: "Importa `enlaceDeWhatsApp()` de `@/config/site-config` en vez de concatenar la URL. El número y el formato viven ahí.",
  },
  {
    id: "INV-P04",
    nombre: "imágenes por next/image",
    // `\b` y no `[\s>]`: en JSX el atributo suele ir en la línea siguiente, así que la línea
    // termina justo después de `<img` y un patrón que exija un carácter más no la ve.
    patron: /<img\b/g,
    exentos: [],
    // 7 -> 6: `tarjeta-obra` deja de pintar con <img> crudo. Las 6 que quedan estan en los dos
    // visores y en la galeria del blog, que se unifican al extraer el lightbox.
    // Sigue en 6. El 2026-09-12 bajo a 3 al borrar `blog/galeria.tsx` y volvio a 6 al restaurarlo:
    // el archivo NO estaba muerto, lo importa `mdx-components.tsx` desde la raiz del proyecto.
    // Las 3 infracciones que aporta son reales y se ven en el blog; se pagan, no se descuentan.
    umbral: 6,
    salida: "Usa `next/image`. Si el caso exige control fino (visor, lightbox), decláralo aquí como exento con su motivo en vez de silenciar el linter con `eslint-disable`.",
  },
];

/**
 * INV-P05 — carpetas de trabajo interno que no pueden llegar al público.
 *
 * `catalogo-data.json` se genera recorriendo las carpetas de fotos del taller, y con las fotos
 * entraron carpetas de reclamaciones y de precios. El 2026-09-10, `/catalogo/catalogo-materiales`
 * estaba en el sitemap sirviendo «DEFECTOS PUERTAS», «VIDRIOS ROTOS» y «COSTO TEMPLADO» como
 * filtros visibles.
 *
 * `lib/catalogo/leer.ts` las filtra, pero el filtro es una lista escrita a mano: la próxima
 * regeneración del catálogo puede traer una carpeta nueva que nadie mire. Esta puerta cuenta
 * cuántas hay EN EL DATO; si aparece una más, el build se cae y alguien tiene que decidir.
 */
const PATRON_INTERNO = /^defectos|vidrios-rotos|precio-templado|costo-templado/i;
// 6 -> 0: las 6 carpetas internas se retiraron del dato y sus 50 archivos del disco el
// 2026-09-10. El umbral en 0 es el que corresponde: a partir de ahora CUALQUIERA que
// aparezca es nueva, y la regeneracion del catalogo desde las carpetas del taller puede
// traerla sin que nadie mire.
const SUBCATEGORIAS_INTERNAS_CONOCIDAS = 0;

function revisarCarpetasInternas() {
  const ruta = join(RAIZ, "src/config/catalogo-data.json");
  let datos;
  try {
    datos = JSON.parse(readFileSync(ruta, "utf8"));
  } catch {
    return null; // sin catálogo no hay nada que vigilar
  }
  const halladas = (datos.categorias ?? []).flatMap((c) =>
    (c.subcategorias ?? [])
      .filter((s) => PATRON_INTERNO.test(s.slug))
      .map((s) => `${c.slug}/${s.slug}`),
  );
  return halladas;
}

/**
 * INV-P06 — código que no importa nadie.
 *
 * Tercera aparición del mismo defecto y primera vez que se le pone puerta. T6.4 borró 1.913 líneas
 * sin importador; T7 descubrió que 38 de las 143 infracciones de color vivían en esos mismos
 * archivos muertos —el umbral llevaba semanas midiendo deuda inexistente—; y la migración de T3,
 * que arregló aquello, dejó otros tres: dos shims de retrocompatibilidad («mientras se completa la
 * migración gradual», ya completada) y una galería de 202 líneas.
 *
 * El patrón no es despiste: migrar deja el archivo viejo en pie y NADA lo comprueba. El linter no
 * lo ve —un módulo sin importar es válido—, y el build tampoco: si no entra en el grafo, no se
 * compila y no falla. Solo se nota cuando alguien mide, y medir no estaba en ninguna puerta.
 *
 * `src/components/ui/` queda exento: es shadcn instalado por CLI y se espera que sobre.
 */
// 2 -> 0 el 2026-09-12: borrados los dos shims de retrocompatibilidad del blog
// (`cabecera-blog`, `migas`), que anunciaban una "migracion gradual" ya terminada.
// `blog/galeria.tsx` NO entra: parecia huerfano y lo importa `mdx-components.tsx` desde la raiz.
const MODULOS_HUERFANOS_CONOCIDOS = 0;
const RAICES_VIGILADAS = ["src/components/", "src/features/"];
const HUERFANOS_EXENTOS = ["src/components/ui/"];
const PATRON_IMPORT = /(?:from|import)\s*\(?\s*["']([^"']+)["']/g;

/** `@/x/y` y `./y` a ruta del repo sin extensión. `null` para paquetes externos. */
function resolverEspecificador(especificador, desde) {
  if (especificador.startsWith("@/")) return `src/${especificador.slice(2)}`;
  if (!especificador.startsWith(".")) return null;
  const partes = desde.split("/").slice(0, -1);
  for (const parte of especificador.split("/")) {
    if (parte === "." || parte === "") continue;
    else if (parte === "..") partes.pop();
    else partes.push(parte);
  }
  return partes.join("/");
}

/**
 * Los importadores NO viven solo en `src/`.
 *
 * Esto lo enseñó un build roto el 2026-09-12: `blog/galeria.tsx` parecía huérfano en las dos
 * mediciones —la de fuera y la de esta misma puerta— y lo importa `mdx-components.tsx`, que vive
 * en la RAÍZ del proyecto porque `@next/mdx` lo exige ahí. Se borró, el build cayó, se restauró.
 *
 * Una puerta que solo mira `src/` da luz verde a un borrado que rompe la compilación. Por eso este
 * recorrido es propio y parte de la raíz, en vez de reutilizar el de los otros invariantes.
 */
function recolectarImportadores() {
  const IGNORADOS = new Set(["node_modules", ".next", ".git", "public", "dist"]);
  const EXT_IMPORTADORAS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".mdx"];
  const encontrados = [];
  const recorrerRaiz = (ruta) => {
    const st = statSync(ruta);
    if (st.isDirectory()) {
      for (const e of readdirSync(ruta)) {
        if (IGNORADOS.has(e)) continue;
        recorrerRaiz(join(ruta, e));
      }
    } else if (EXT_IMPORTADORAS.some((x) => ruta.endsWith(x))) {
      encontrados.push(ruta);
    }
  };
  recorrerRaiz(RAIZ);
  return encontrados;
}

function revisarModulosSinImportador(archivos, rutaRelativa) {
  const importados = new Set();
  for (const archivo of recolectarImportadores()) {
    const rel = rutaRelativa(archivo);
    for (const [, especificador] of readFileSync(archivo, "utf8").matchAll(PATRON_IMPORT)) {
      const destino = resolverEspecificador(especificador, rel);
      if (destino) importados.add(destino.replace(/\/index$/, ""));
    }
  }
  return archivos
    .map(rutaRelativa)
    .filter((rel) => /\.tsx?$/.test(rel))
    .filter((rel) => RAICES_VIGILADAS.some((raiz) => rel.startsWith(raiz)))
    .filter((rel) => !HUERFANOS_EXENTOS.some((raiz) => rel.startsWith(raiz)))
    .filter((rel) => !importados.has(rel.replace(/\.tsx?$/, "")));
}

const archivos = [];
const recorrer = (ruta) => {
  const st = statSync(ruta);
  if (st.isDirectory()) {
    for (const e of readdirSync(ruta)) {
      if (e === "node_modules" || e === ".next") continue;
      recorrer(join(ruta, e));
    }
  } else if (EXTENSIONES.some((x) => ruta.endsWith(x))) {
    archivos.push(ruta);
  }
};

for (const o of OBJETIVOS) {
  try {
    recorrer(join(RAIZ, o));
  } catch {
    /* objetivo ausente: ignorar */
  }
}

/** Normaliza a rutas con `/` para que los exentos funcionen igual en Windows y en CI. */
const rutaRelativa = (archivo) => relative(RAIZ, archivo).split("\\").join("/");

const resultados = INVARIANTES.map((inv) => {
  const porArchivo = new Map();
  let total = 0;

  for (const archivo of archivos) {
    const rel = rutaRelativa(archivo);
    if (inv.exentos.includes(rel)) continue;

    const lineas = readFileSync(archivo, "utf8").split("\n");
    lineas.forEach((linea, i) => {
      const coincidencias = linea.match(inv.patron);
      if (!coincidencias) return;
      total += coincidencias.length;
      if (!porArchivo.has(rel)) porArchivo.set(rel, []);
      porArchivo.get(rel).push(i + 1);
    });
  }

  return { inv, total, porArchivo };
});

const regresiones = resultados.filter((r) => r.total > r.inv.umbral);
const mejoras = resultados.filter((r) => r.total < r.inv.umbral);

for (const { inv, total, porArchivo } of resultados) {
  const signo = total === inv.umbral ? "=" : total > inv.umbral ? "+" : "-";
  console.log(
    `[check-tokens] ${inv.id}  ${String(total).padStart(4)} / ${String(inv.umbral).padEnd(4)} ${signo}  ${inv.nombre}` +
      (porArchivo.size ? `  (${porArchivo.size} archivo${porArchivo.size === 1 ? "" : "s"})` : ""),
  );
}

const internas = revisarCarpetasInternas();
const internasFuera = internas !== null && internas.length !== SUBCATEGORIAS_INTERNAS_CONOCIDAS;

if (internas !== null) {
  console.log(
    `[check-tokens] INV-P05  ${String(internas.length).padStart(4)} / ${String(SUBCATEGORIAS_INTERNAS_CONOCIDAS).padEnd(4)} ${internas.length === SUBCATEGORIAS_INTERNAS_CONOCIDAS ? "=" : internas.length > SUBCATEGORIAS_INTERNAS_CONOCIDAS ? "+" : "-"}  carpetas internas en el dato del catálogo`,
  );
}

const huerfanos = revisarModulosSinImportador(archivos, rutaRelativa);
const huerfanosFuera = huerfanos.length !== MODULOS_HUERFANOS_CONOCIDOS;

console.log(
  `[check-tokens] INV-P06  ${String(huerfanos.length).padStart(4)} / ${String(MODULOS_HUERFANOS_CONOCIDOS).padEnd(4)} ${huerfanos.length === MODULOS_HUERFANOS_CONOCIDOS ? "=" : huerfanos.length > MODULOS_HUERFANOS_CONOCIDOS ? "+" : "-"}  componentes que no importa nadie`,
);

if (regresiones.length === 0 && mejoras.length === 0 && !internasFuera && !huerfanosFuera) {
  console.log(`[check-tokens] OK: ${archivos.length} archivos revisados, ningún invariante empeora.`);
  process.exit(0);
}

console.error("");

for (const { inv, total, porArchivo } of regresiones) {
  console.error(
    `[check-tokens] REGRESIÓN ${inv.id}: ${total} infracciones, el umbral declarado es ${inv.umbral}.`,
  );
  console.error(`  ${inv.salida}`);
  console.error(
    `  La puerta cuenta totales: NO sabe cuál es la infracción nueva. Abajo van los mayores` +
      ` infractores, que casi nunca son la tuya — búscala con \`git diff\`.`,
  );
  for (const [archivo, lineas] of [...porArchivo].sort((a, b) => b[1].length - a[1].length).slice(0, 12)) {
    console.error(`    ${archivo}  líneas ${lineas.slice(0, 8).join(", ")}${lineas.length > 8 ? ` … (+${lineas.length - 8})` : ""}`);
  }
  console.error("");
}

if (internasFuera) {
  console.error(
    `[check-tokens] INV-P05: el catálogo trae ${internas.length} carpetas de trabajo interno y la lista conocida tiene ${SUBCATEGORIAS_INTERNAS_CONOCIDAS}.`,
  );
  console.error(
    "  Son carpetas del taller (reclamaciones, roturas, precios) que NO deben servirse al público.",
  );
  console.error(
    "  Revisa `SUBCATEGORIAS_INTERNAS` en src/lib/catalogo/leer.ts, decide qué hacer con la nueva y",
  );
  console.error("  ajusta SUBCATEGORIAS_INTERNAS_CONOCIDAS aquí en el mismo commit.");
  for (const s of internas) console.error(`    ${s}`);
  console.error("");
}

if (huerfanosFuera) {
  console.error(
    `[check-tokens] INV-P06: ${huerfanos.length} módulo(s) bajo src/components o src/features que no importa nadie; la lista conocida tiene ${MODULOS_HUERFANOS_CONOCIDOS}.`,
  );
  console.error("  Si acabas de migrar algo, el archivo viejo se quedó en pie: bórralo en el MISMO commit.");
  console.error("  Si es un componente nuevo sin montar, móntalo o déjalo fuera del árbol hasta que lo uses.");
  for (const h of huerfanos) console.error(`    ${h}`);
  console.error("");
}

for (const { inv, total } of mejoras) {
  console.error(
    `[check-tokens] TRINQUETE ${inv.id}: bajaste de ${inv.umbral} a ${total}. Escribe \`umbral: ${total}\` en scripts/check-tokens.mjs, en el MISMO commit que lo consiguió.`,
  );
  console.error("");
}

process.exit(1);
