import type { Metadata } from "next";

import { Enlace } from "@/components/comunes/enlace";
import { SinAcceso } from "@/components/comunes/sin-acceso";
import { AYUDA } from "@/features/parametros/textos";
import { valorLegible } from "@/features/parametros/valor";
import { leerDeLaSerie, leerEspacio } from "@/features/series/datos";
import type { ParametrosDeSerie } from "@/features/series/types";
import { adelantar } from "@/lib/api-server";
import { numero } from "@/lib/formato";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Parámetros · Series · GMS Integra",
};

/**
 * La pestaña Parámetros (`series/52-brief-espacio-de-la-serie` § 4, `SER-I04`): con qué números calcula la serie —sus
 * límites y los parámetros de sus diseños— y por qué. **Solo los suyos**: los generales (margen, vigencia, mano de obra)
 * están en Parámetros. Se consultan: se calibraron contra el cuaderno y un error cambiaría en silencio todos los
 * despieces (decisión 49).
 */
export default async function ParametrosDeLaSeriePage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const peticion = adelantar(leerDeLaSerie<ParametrosDeSerie>(codigo, "parametros"));

  const usuario = await exigirUsuario();
  if (!puede(usuario, "variables:ver")) return <SinAcceso que="los parámetros" />;

  const [{ limites, parametros }, serie] = await Promise.all([peticion, leerEspacio(codigo)]);
  const porDuenio = Map.groupBy(parametros, (p) => p.de ?? serie.nombre);
  const sinConfirmar = "De referencia, sin confirmar en el taller: avisa y no impide.";

  const filasDeLimites: { nombre: string; valor: string; ayuda: string }[] = [
    ...(limites.ancho_max_cm !== null
      ? [
          {
            nombre: "Ancho máximo",
            valor: `${numero(limites.ancho_max_cm)} cm`,
            ayuda: `La barra del ${limites.ancho_max_por}, que no admite empalme: el cálculo no pasa de aquí.`,
          },
        ]
      : []),
    ...(limites.ancho_min_cm !== null ? [{ nombre: "Ancho mínimo", valor: `${numero(limites.ancho_min_cm)} cm`, ayuda: sinConfirmar }] : []),
    ...(limites.alto_min_cm !== null && limites.alto_max_cm !== null
      ? [{ nombre: "Alto", valor: `${numero(limites.alto_min_cm)} a ${numero(limites.alto_max_cm)} cm`, ayuda: sinConfirmar }]
      : []),
  ];

  return (
    <>
      <p className="text-muted-foreground text-sm">
        Con estos números calcula {serie.nombre}. Se calibraron contra su cuaderno y los ajusta Sudolabs, con su prueba: aquí
        se consultan. Los generales —margen, vigencia, mano de obra— están en{" "}
        {puede(usuario, "costeo:ver") ? (
          <Enlace href="/parametros" className="text-primary font-medium underline-offset-4 hover:underline">
            Parámetros
          </Enlace>
        ) : (
          "Parámetros"
        )}
        .
      </p>

      <Bloque titulo="Límites" filas={filasDeLimites} />

      {[...porDuenio.entries()].map(([duenio, filas]) => (
        <Bloque
          key={duenio}
          titulo={duenio}
          filas={filas.map((p) => ({ nombre: p.nombre, valor: valorLegible(Number(p.valor), p.unidad), ayuda: AYUDA[p.clave] ?? null }))}
        />
      ))}
    </>
  );
}

function Bloque({ titulo, filas }: { titulo: string; filas: { nombre: string; valor: string; ayuda: string | null }[] }) {
  if (filas.length === 0) return null;

  return (
    <section aria-label={titulo} className="flex flex-col gap-2">
      <h2 className="font-semibold">{titulo}</h2>
      <ul className="bg-card divide-y rounded-md border shadow-sm">
        {filas.map((fila) => (
          <li key={fila.nombre} className="flex items-start justify-between gap-4 px-3 py-2.5">
            <div className="min-w-0">
              <p className="font-medium">{fila.nombre}</p>
              {fila.ayuda ? <p className="text-muted-foreground text-sm">{fila.ayuda}</p> : null}
            </div>
            <span className="shrink-0 font-mono font-semibold tabular-nums">{fila.valor}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
