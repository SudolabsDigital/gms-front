import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Enlace } from "@/components/comunes/enlace";
import { SinAcceso } from "@/components/comunes/sin-acceso";
import { CambiarParametro } from "@/features/parametros/components/cambiar-parametro";
import { AYUDA } from "@/features/parametros/textos";
import { valorLegible } from "@/features/parametros/valor";
import { leerDeLaSerie, leerEspacio } from "@/features/series/datos";
import type { ParametrosDeSerie } from "@/features/series/types";
import { adelantar } from "@/lib/api-server";
import { diaDe, diaLegible, numero } from "@/lib/formato";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Parámetros · Series · GMS Integra",
};

type Fila = { clave: string; nombre: string; valor: string; ayuda: string | null; detalle?: string | null; accion?: ReactNode };

/**
 * La pestaña Parámetros (`series/52-brief-espacio-de-la-serie` § 4, `SER-I04`): con qué números calcula la serie —sus
 * límites y los parámetros de sus diseños— y por qué. **Solo los suyos**: los generales (margen, vigencia, mano de obra)
 * están en Parámetros. Quien gestiona los parámetros cambia el cálculo aquí, viendo antes qué cambia (decisión 82); el
 * resto lo consulta. Los límites se consultan siempre: el ancho máximo lo fija una barra, y los otros son de referencia.
 */
export default async function ParametrosDeLaSeriePage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const peticion = adelantar(leerDeLaSerie<ParametrosDeSerie>(codigo, "parametros"));

  const usuario = await exigirUsuario();
  if (!puede(usuario, "variables:ver")) return <SinAcceso que="los parámetros" />;

  const [{ limites, parametros }, serie] = await Promise.all([peticion, leerEspacio(codigo)]);
  const porDuenio = Map.groupBy(parametros, (p) => p.de ?? serie.nombre);
  const editables = parametros.some((p) => p.editable);
  const sinConfirmar = "De referencia, sin confirmar en el taller: avisa y no impide.";

  const filasDeLimites: Fila[] = [
    ...(limites.ancho_max_cm !== null
      ? [
          {
            clave: "ancho_max",
            nombre: "Ancho máximo",
            valor: `${numero(limites.ancho_max_cm)} cm`,
            ayuda: `La barra del ${limites.ancho_max_por}, que no admite empalme: el cálculo no pasa de aquí.`,
          },
        ]
      : []),
    ...(limites.ancho_min_cm !== null
      ? [{ clave: "ancho_min", nombre: "Ancho mínimo", valor: `${numero(limites.ancho_min_cm)} cm`, ayuda: sinConfirmar }]
      : []),
    ...(limites.alto_min_cm !== null && limites.alto_max_cm !== null
      ? [{ clave: "alto", nombre: "Alto", valor: `${numero(limites.alto_min_cm)} a ${numero(limites.alto_max_cm)} cm`, ayuda: sinConfirmar }]
      : []),
  ];

  return (
    <>
      <p className="text-muted-foreground text-sm">
        Con estos números calcula {serie.nombre}. Se calibraron contra su cuaderno
        {editables
          ? ": cambiar uno cambia el corte de sus tipos, y antes de guardar se ve qué cambia."
          : "; los cambia el administrador, aquí se consultan."}{" "}
        Los generales —margen, vigencia, mano de obra— están en{" "}
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
          filas={filas.map((p) => {
            const ultimo = p.historial[0];

            return {
              clave: p.clave,
              nombre: p.nombre,
              valor: valorLegible(Number(p.valor), p.unidad),
              ayuda: AYUDA[p.clave] ?? null,
              detalle: ultimo ? `cambiado el ${diaLegible(diaDe(ultimo.at))}${ultimo.por ? ` por ${ultimo.por}` : ""}` : null,
              accion: p.editable ? <CambiarParametro parametro={p} probar /> : null,
            };
          })}
        />
      ))}
    </>
  );
}

/** Un bloque de filas como las de Parámetros: el nombre y su porqué a la izquierda; el valor y, si se puede, «Cambiar» */
function Bloque({ titulo, filas }: { titulo: string; filas: Fila[] }) {
  if (filas.length === 0) return null;

  return (
    <section aria-label={titulo} className="flex flex-col gap-2">
      <h2 className="font-semibold">{titulo}</h2>
      <ul className="bg-card divide-y rounded-md border shadow-sm">
        {filas.map((fila) => (
          <li key={fila.clave} className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-medium">{fila.nombre}</p>
              {fila.ayuda ? <p className="text-muted-foreground text-sm">{fila.ayuda}</p> : null}
              {fila.detalle ? <p className="text-muted-foreground text-xs">{fila.detalle}</p> : null}
            </div>
            <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
              <span className="font-mono font-semibold tabular-nums">{fila.valor}</span>
              {fila.accion}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
