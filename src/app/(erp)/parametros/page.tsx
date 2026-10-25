import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";

import { CabeceraDeSeccion } from "@/components/comunes/cabecera-de-seccion";
import { CuerpoDeSeccion } from "@/components/comunes/cuerpo-de-seccion";
import { EmptyState } from "@/components/comunes/empty-state";
import { SinAcceso } from "@/components/comunes/sin-acceso";
import { BarraDeContexto } from "@/components/erp/barra-de-contexto";
import { MarcoDeTrabajo } from "@/components/erp/marco-de-trabajo";
import { CambiarParametro } from "@/features/parametros/components/cambiar-parametro";
import { AYUDA, GRUPOS } from "@/features/parametros/textos";
import type { Parametro } from "@/features/parametros/types";
import { valorLegible } from "@/features/parametros/valor";
import type { Meta } from "@/features/proyectos/types";
import { adelantar, apiGet } from "@/lib/api-server";
import { diaDe, diaLegible } from "@/lib/formato";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Parámetros · GMS Integra",
};

/**
 * Los parámetros generales con que cotiza el sistema (`parametros/52-brief-parametros`, MAE.7, decisiones 49 y 79): los
 * comerciales y la mano de obra, en el orden en que cambian. El cálculo de cada diseño se consulta en su serie. Sin
 * `costeo:ver` el servidor no manda ninguno —son todos de dinero— y el menú no ofrece esta página; quien llega por la
 * URL lee dónde está lo suyo.
 */
export default async function ParametrosPage() {
  const peticion = adelantar(apiGet<{ datos: Parametro[]; meta: Meta }>("/variables?por_pagina=100"));
  const usuario = await exigirUsuario();
  const barra = <BarraDeContexto ruta={[{ etiqueta: "Parámetros" }]} />;
  if (!puede(usuario, "variables:ver")) {
    return (
      <MarcoDeTrabajo barra={barra}>
        <SinAcceso que="los parámetros" />
      </MarcoDeTrabajo>
    );
  }

  const { datos } = await peticion;

  return (
    <MarcoDeTrabajo barra={barra}>
      <CuerpoDeSeccion ancho="formulario">
        <CabeceraDeSeccion
          titulo="Parámetros"
          descripcion="Los valores generales con que cotiza el sistema: cuánto vale una cotización, qué margen y anticipo se sugieren, a cuánto se cobra la mano de obra. Los del cálculo de cada serie están en su espacio."
        />

        {datos.length === 0 ? (
          <EmptyState
            icono={SlidersHorizontal}
            titulo="Los parámetros generales se ven con permiso de costos"
            descripcion="Margen, vigencia, anticipo y mano de obra hablan de dinero. Los del cálculo de cada serie están en Series, en su pestaña Parámetros."
          />
        ) : null}

        {GRUPOS.map(({ grupo, titulo, frase }) => {
          const filas = datos.filter((p) => p.grupo === grupo);
          if (filas.length === 0) return null;

          return (
            <section key={grupo} aria-labelledby={`grupo-${grupo}`} className="flex flex-col gap-2">
              <div>
                <h2 id={`grupo-${grupo}`} className="font-semibold">
                  {titulo}
                </h2>
                <p className="text-muted-foreground text-sm">{frase}</p>
              </div>
              <ul className="bg-card divide-y rounded-md border shadow-sm">
                {filas.map((p) => {
                  const ultimo = p.historial[0];
                  return (
                    <li key={p.id} className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-medium">{p.nombre}</p>
                        {AYUDA[p.clave] ? <p className="text-muted-foreground text-sm">{AYUDA[p.clave]}</p> : null}
                        {ultimo ? (
                          <p className="text-muted-foreground text-xs">
                            cambiado el {diaLegible(diaDe(ultimo.at))}
                            {ultimo.por ? ` por ${ultimo.por}` : ""}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                        <span className="font-mono font-semibold tabular-nums">{valorLegible(Number(p.valor), p.unidad)}</span>
                        {p.editable ? <CambiarParametro parametro={p} /> : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </CuerpoDeSeccion>
    </MarcoDeTrabajo>
  );
}
