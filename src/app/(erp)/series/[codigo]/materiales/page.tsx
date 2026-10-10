import type { Metadata } from "next";

import { SinAcceso } from "@/components/comunes/sin-acceso";
import { ListaMaterialesDeSerie } from "@/features/series/components/lista-materiales-de-serie";
import { leerDeLaSerie } from "@/features/series/datos";
import type { MaterialDeSerie } from "@/features/series/types";
import { adelantar } from "@/lib/api-server";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Materiales · Series · GMS Integra",
};

/**
 * La pestaña Materiales (`series/52-brief-espacio-de-la-serie` § 4, `SER-I04`): sus perfiles —también el que ningún
 * diseño usa todavía— y los comunes que usa su diseño publicado, cada uno con las piezas que lo cortan. Todo el catálogo,
 * sus familias y los precios siguen en Materiales.
 */
export default async function MaterialesDeLaSeriePage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const peticion = adelantar(leerDeLaSerie<{ datos: MaterialDeSerie[] }>(codigo, "materiales"));

  const usuario = await exigirUsuario();
  if (!puede(usuario, "catalogo:ver")) return <SinAcceso que="los materiales" />;

  const { datos } = await peticion;

  return (
    <>
      <p className="text-muted-foreground text-sm">
        Lo que lleva esta serie y para qué. Cada material abre su ficha en Materiales, donde están su precio y cómo se compra.
      </p>
      <ListaMaterialesDeSerie titulo="Propios de la serie" filas={datos.filter((m) => m.propio)} />
      <ListaMaterialesDeSerie titulo="Comunes que usa" filas={datos.filter((m) => !m.propio)} />
    </>
  );
}
