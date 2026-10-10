import type { Metadata } from "next";
import { Layers } from "lucide-react";

import { CabeceraDeSeccion } from "@/components/comunes/cabecera-de-seccion";
import { CuerpoDeSeccion } from "@/components/comunes/cuerpo-de-seccion";
import { EmptyState } from "@/components/comunes/empty-state";
import { SinAcceso } from "@/components/comunes/sin-acceso";
import { TarjetaEnlace } from "@/components/comunes/tarjeta-enlace";
import { BarraDeContexto } from "@/components/erp/barra-de-contexto";
import { MarcoDeTrabajo } from "@/components/erp/marco-de-trabajo";
import { adelantar, apiGet } from "@/lib/api-server";
import { plural } from "@/lib/formato";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Series · GMS Integra",
};

type DisenoListado = {
  id: string;
  codigo: string;
  nombre: string;
  serie: { codigo: string; nombre: string; descripcion: string | null };
  tipos_count: number;
};

type SerieListada = DisenoListado["serie"] & { disenos: DisenoListado[] };

/**
 * La portada de Series (`series/52-brief-espacio-de-la-serie` § 4, decisión 79): una tarjeta por serie, con sus diseños
 * y cuántos tipos tiene cada uno. Una serie aparece cuando tiene un diseño —es lo que la hace cotizable—, y con una sola
 * la portada se queda igual: aquí aparecerá la siguiente, sin tocar esta página.
 */
export default async function SeriesPage() {
  const peticion = adelantar(apiGet<DisenoListado[]>("/disenos"));

  const usuario = await exigirUsuario();
  const barra = <BarraDeContexto ruta={[{ etiqueta: "Series" }]} />;
  if (!puede(usuario, "plantillas:ver")) {
    return (
      <MarcoDeTrabajo barra={barra}>
        <SinAcceso que="las series" />
      </MarcoDeTrabajo>
    );
  }

  const series = porSerie(await peticion);

  return (
    <MarcoDeTrabajo barra={barra}>
      <CuerpoDeSeccion ancho="amplio">
        <CabeceraDeSeccion
          titulo="Series"
          descripcion="Cada serie con sus tipos de ventana, los materiales que lleva y los parámetros con que se calcula."
        />

        {series.length === 0 ? (
          <EmptyState
            icono={Layers}
            titulo="Todavía no hay series"
            descripcion="Una serie aparece aquí con su primer diseño. Las agrega Sudolabs, con los casos de su cuaderno."
          />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {series.map((serie) => (
              <li key={serie.codigo} className="flex">
                <TarjetaEnlace href={`/series/${encodeURIComponent(serie.codigo)}`} className="w-full flex-col items-stretch gap-1">
                  <p className="font-semibold">{serie.nombre}</p>
                  {serie.descripcion ? <p className="text-muted-foreground text-sm">{serie.descripcion}</p> : null}
                  <p className="text-sm">
                    {serie.disenos.map((d) => `${d.nombre} · ${plural(d.tipos_count, "tipo", "tipos")}`).join(" — ")}
                  </p>
                </TarjetaEnlace>
              </li>
            ))}
          </ul>
        )}
      </CuerpoDeSeccion>
    </MarcoDeTrabajo>
  );
}

/** Los diseños, agrupados por su serie y en el orden en que llegan (por nombre) */
function porSerie(disenos: DisenoListado[]): SerieListada[] {
  const series = new Map<string, SerieListada>();

  for (const diseno of disenos) {
    const serie = series.get(diseno.serie.codigo) ?? { ...diseno.serie, disenos: [] };
    serie.disenos.push(diseno);
    series.set(diseno.serie.codigo, serie);
  }

  return [...series.values()];
}
