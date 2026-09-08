#!/usr/bin/env node
/**
 * Puerta de comentarios para GMS INTEGRA: falla si un comentario del código fuente filtra
 * información que no debe salir en un repositorio público o bundle cliente.
 *
 * Principio 14 DreamDev: "Un estándar sin puerta es una preferencia."
 *
 * Solo analiza COMENTARIOS en `src/` y archivos de configuración raíz.
 * El contenido de `.mdx` y markdown público queda fuera a propósito.
 *
 * Ejecución:
 *   node scripts/check-comments.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const RAIZ = process.cwd();
const OBJETIVOS = ["src", "next.config.ts"];
const EXTENSIONES = [".ts", ".tsx", ".mjs", ".css"];

/** Patrones restringidos con su motivo técnico */
const PROHIBIDO = [
  [/search console/i, "métrica interna de tráfico"],
  [/google trends/i, "estudio de demanda privada"],
  [/\b(impresiones|clics|CTR|posición media)\b/i, "métrica de tráfico interno"],
  [/(?<!node_modules[\\/].*)\b(gms-docs|docs)[\\/]/i, "referencia a ruta documental privada"],
  [/auditor[ií]a_seo|spec_[a-z_]+\.md/i, "referencia a documento de auditoría"],
  [/\bdeuda D\d+\b/i, "código de deuda interna"],
  [/ (facturación de la empresa|presupuesto del cliente|cliente paga) /i, "dato financiero confidencial"],
  [/ (camino de conversión|tasa de conversión|embudo de venta) /i, "métrica comercial interna"],
  [/ cuenta que no existe | contraseña de prueba /i, "credencial o estado privado"],
];

const archivos = [];
const recorrer = (ruta) => {
  const st = statSync(ruta);
  if (st.isDirectory()) {
    for (const e of readdirSync(ruta)) {
      if (e === "node_modules" || e === ".next" || e === "content") continue;
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

const esComentario = (linea) => {
  const t = linea.trim();
  return t.startsWith("//") || t.startsWith("*") || t.startsWith("/*") || t.startsWith("{/*");
};

const hallazgos = [];
for (const archivo of archivos) {
  const lineas = readFileSync(archivo, "utf8").split("\n");
  lineas.forEach((linea, i) => {
    if (!esComentario(linea)) return;
    for (const [patron, motivo] of PROHIBIDO) {
      if (patron.test(linea)) {
        hallazgos.push({
          archivo: relative(RAIZ, archivo),
          linea: i + 1,
          motivo,
          texto: linea.trim(),
        });
        break;
      }
    }
  });
}

if (hallazgos.length === 0) {
  console.log(`[check-comments] OK: ${archivos.length} archivos revisados, 0 fugas detectadas.`);
  process.exit(0);
}

console.error(`[check-comments] ALERTA: ${hallazgos.length} hallazgo(s) en ${archivos.length} archivos revisados:\n`);
for (const h of hallazgos) {
  console.error(`  ${h.archivo}:${h.linea}  [${h.motivo}]`);
  console.error(`    ${h.texto.slice(0, 110)}`);
}
console.error("\nReescribe el comentario en el código fuente para exponer únicamente el motivo técnico sin filtrar datos privados.");
process.exit(1);
