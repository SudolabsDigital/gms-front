import type { Metadata } from "next";

import { Buscador } from "@/components/comunes/buscador";
import { Enlace } from "@/components/comunes/enlace";
import { PageHeader } from "@/components/comunes/page-header";
import { SinAcceso } from "@/components/comunes/sin-acceso";
import { RUTA_INICIO } from "@/components/erp/navegacion";
import { Button } from "@/components/ui/button";
import { ListaClientes } from "@/features/clientes/components/lista-clientes";
import type { ListaClientesConRecuento } from "@/features/clientes/types";
import { AltaProyecto } from "@/features/proyectos/components/alta-proyecto";
import { adelantar, apiGet } from "@/lib/api-server";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Clientes · GMS Integra",
};

type Parametros = Promise<{ [clave: string]: string | string[] | undefined }>;

/** Una agenda: 50 por página alcanzan para años de GMS; si un día no, la API ya pagina (`clientes/10-modelo` § escala) */
const POR_PAGINA = 50;

/**
 * Los clientes (`clientes/52-brief-clientes` § 3, MAE.9). La búsqueda y la página viven en la URL; el teléfono se
 * encuentra como se escriba (decisión 51). Sin «Nuevo cliente»: nacen con su proyecto (decisión 50).
 */
export default async function ClientesPage({ searchParams }: { searchParams: Parametros }) {
  const crudo = await searchParams;
  const buscar = typeof crudo.buscar === "string" ? crudo.buscar.trim().slice(0, 100) : "";
  const pagina = Math.max(1, Number.parseInt(typeof crudo.pagina === "string" ? crudo.pagina : "", 10) || 1);

  const consulta = buscar ? `buscar=${encodeURIComponent(buscar)}&` : "";
  const peticion = adelantar(apiGet<ListaClientesConRecuento>(`/clientes?${consulta}pagina=${pagina}&por_pagina=${POR_PAGINA}`));

  const usuario = await exigirUsuario();
  if (!puede(usuario, "proyectos:ver")) return <SinAcceso que="clientes" />;

  const lista = await peticion;
  const { meta } = lista;
  const hrefPagina = (n: number) => `/clientes?${consulta}pagina=${n}`;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:gap-5">
      <PageHeader
        migas={[{ etiqueta: "Inicio", href: RUTA_INICIO }, { etiqueta: "Clientes" }]}
        titulo="Clientes"
        descripcion="A quién se le ha hecho o se le está haciendo un trabajo: sus datos, sus proyectos y lo que debe."
      />

      <Buscador
        accion="/clientes"
        id="buscar-clientes"
        etiqueta="Buscar clientes"
        placeholder="Nombre, teléfono o DNI/RUC"
        valor={buscar}
      />

      {lista.datos.length === 0 ? (
        buscar ? (
          <p className="text-muted-foreground py-8 text-center text-sm">Nadie coincide con «{buscar}».</p>
        ) : (
          <div className="text-muted-foreground flex flex-col items-center gap-3 py-8 text-center text-sm">
            <p>Todavía no hay clientes. Nacen al crear un proyecto.</p>
            {puede(usuario, "proyectos:crear") ? <AltaProyecto /> : null}
          </div>
        )
      ) : (
        <ListaClientes filas={lista.datos} />
      )}

      {meta.ultima_pagina > 1 ? (
        <nav aria-label="Páginas" className="text-muted-foreground flex items-center justify-between gap-2 text-sm">
          <span>
            Página {meta.pagina} de {meta.ultima_pagina} · {meta.total} clientes
          </span>
          <div className="flex gap-2">
            {meta.pagina > 1 ? (
              <Button asChild variant="outline" className="h-11 md:h-8">
                <Enlace href={hrefPagina(meta.pagina - 1)}>Anterior</Enlace>
              </Button>
            ) : null}
            {meta.pagina < meta.ultima_pagina ? (
              <Button asChild variant="outline" className="h-11 md:h-8">
                <Enlace href={hrefPagina(meta.pagina + 1)}>Siguiente</Enlace>
              </Button>
            ) : null}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
