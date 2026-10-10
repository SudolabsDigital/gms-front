import type { ReactNode } from "react";

import { CabeceraDeSeccion } from "@/components/comunes/cabecera-de-seccion";
import { CuerpoDeSeccion } from "@/components/comunes/cuerpo-de-seccion";
import { PestanasDeSubruta } from "@/components/comunes/pestanas-de-subruta";
import { SinAcceso } from "@/components/comunes/sin-acceso";
import { BarraDeContexto } from "@/components/erp/barra-de-contexto";
import { MarcoDeTrabajo } from "@/components/erp/marco-de-trabajo";
import { leerEspacio } from "@/features/series/datos";
import { subrutasDeLaSerie } from "@/features/series/subrutas";
import { adelantar } from "@/lib/api-server";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

/**
 * La serie como espacio (decisión 79; `03-sistema-de-diseno/arquitectura-del-erp` § 3, como la obra): lo que comparten
 * sus pestañas —el nombre, la descripción y las pestañas Tipos · Materiales · Parámetros—, pedido una vez con `cache`.
 * Al cambiar de pestaña Next conserva este layout y solo pide la pestaña.
 */
export default async function SerieLayout({ children, params }: { children: ReactNode; params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const peticion = adelantar(leerEspacio(codigo));

  const usuario = await exigirUsuario();
  if (!puede(usuario, "plantillas:ver")) {
    return (
      <MarcoDeTrabajo barra={<BarraDeContexto ruta={[{ etiqueta: "Series" }]} />}>
        <SinAcceso que="las series" />
      </MarcoDeTrabajo>
    );
  }

  const serie = await peticion;

  return (
    <MarcoDeTrabajo
      barra={<BarraDeContexto ruta={[{ etiqueta: "Series", href: "/series" }, { codigo: serie.codigo, etiqueta: serie.nombre }]} />}
    >
      <CuerpoDeSeccion ancho="amplio">
        <CabeceraDeSeccion
          volver={{ href: "/series", etiqueta: "Series" }}
          titulo={serie.nombre}
          descripcion={serie.descripcion ?? undefined}
        />
        <PestanasDeSubruta etiqueta={`Apartados de ${serie.nombre}`} prefetch opciones={subrutasDeLaSerie(serie.codigo, usuario)} />
        {children}
      </CuerpoDeSeccion>
    </MarcoDeTrabajo>
  );
}
