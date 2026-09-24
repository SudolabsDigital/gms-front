"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InsigniaEtapa } from "@/features/proyectos/components/insignia-etapa";
import type { ListaProyectos, ProyectoFila } from "@/features/proyectos/types";
import { mensajeDeError, pedir } from "@/lib/api-cliente";
import { haceDias, moneda } from "@/lib/formato";

/**
 * La lista de trabajo (`proyectos/51-ui` § `/proyectos`): tarjetas en el móvil, tabla en el escritorio.
 *
 * El móvil pagina con «Cargar más», que AÑADE la página siguiente (se pide por el BFF); el escritorio,
 * con enlaces «Página N de M» que re-renderiza el servidor. La página que monta esto le pone `key` con
 * los filtros: cambiar de filtro empieza de cero y no mezcla filas de dos listas.
 *
 * El total solo aparece si llegó: sin `costeo:ver` la clave no viaja (`CAL-04`), y aquí no se inventa.
 */
export function ListaProyectos({
  inicial,
  consulta,
}: {
  inicial: ListaProyectos;
  /** Los filtros vigentes, sin `pagina`: se reutilizan para pedir la siguiente */
  consulta: string;
}) {
  const router = useRouter();
  const [filas, setFilas] = useState<ProyectoFila[]>(inicial.datos);
  const [pagina, setPagina] = useState(inicial.meta.pagina);
  const [cargando, setCargando] = useState(false);
  const [fallo, setFallo] = useState<string | null>(null);

  const { meta } = inicial;
  const quedanMas = pagina < meta.ultima_pagina;

  async function cargarMas() {
    setCargando(true);
    const respuesta = await pedir<ListaProyectos>(
      `/api/v1/proyectos?${consulta}${consulta ? "&" : ""}pagina=${pagina + 1}`,
    );
    setCargando(false);

    if (!respuesta.ok) {
      setFallo(mensajeDeError(respuesta.error));
      return;
    }

    setFilas((actuales) => [...actuales, ...respuesta.datos.datos]);
    setPagina(respuesta.datos.meta.pagina);
    setFallo(null);
  }

  const conTotales = inicial.datos.some((fila) => "total_vigente" in fila);
  // Una función no cruza del servidor al cliente: la URL de cada página se arma aquí
  const hrefPagina = (n: number) => `/proyectos?${consulta}${consulta ? "&" : ""}pagina=${n}`;

  return (
    <>
      {/* ── Móvil: tarjetas ─────────────────────────────────────────── */}
      <ul className="flex flex-col gap-2 md:hidden">
        {filas.map((fila) => (
          <li key={fila.id}>
            <Link
              href={`/proyectos/${fila.id}`}
              className="bg-card flex flex-col gap-1.5 rounded-md border p-3 shadow-sm active:bg-muted/60"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground font-mono text-xs">{fila.codigo}</span>
                <InsigniaEtapa etapa={fila.etapa} />
              </div>
              <p className="leading-snug font-medium">{fila.nombre}</p>
              <div className="text-muted-foreground flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{fila.cliente.nombre}</span>
                <span className="shrink-0">{haceDias(fila.etapa_desde)}</span>
              </div>
              {fila.total_vigente != null ? (
                <p className="font-mono text-sm tabular-nums">{moneda(fila.total_vigente)}</p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>

      {quedanMas ? (
        <div className="md:hidden">
          <Button variant="outline" className="h-11 w-full" onClick={cargarMas} disabled={cargando}>
            {cargando ? <Loader2 className="size-4 animate-spin" /> : null}
            Cargar más ({meta.total - filas.length} restantes)
          </Button>
          {fallo ? <p className="text-destructive mt-2 text-sm">{fallo}</p> : null}
        </div>
      ) : null}

      {/* ── Escritorio: tabla densa ─────────────────────────────────── */}
      <div className="bg-card hidden overflow-hidden rounded-md border shadow-sm md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground text-left text-xs">
            <tr>
              <th className="px-3 py-2 font-medium">Código</th>
              <th className="px-3 py-2 font-medium">Proyecto</th>
              <th className="px-3 py-2 font-medium">Cliente</th>
              <th className="px-3 py-2 font-medium">Etapa</th>
              <th className="px-3 py-2 font-medium">Responsable</th>
              {conTotales ? <th className="px-3 py-2 text-right font-medium">Total vigente</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y">
            {inicial.datos.map((fila) => (
              <tr
                key={fila.id}
                className="hover:bg-muted/40 cursor-pointer"
                onClick={() => router.push(`/proyectos/${fila.id}`)}
              >
                <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">
                  <Link href={`/proyectos/${fila.id}`} className="hover:underline">
                    {fila.codigo}
                  </Link>
                </td>
                <td className="px-3 py-2 font-medium">{fila.nombre}</td>
                <td className="px-3 py-2">
                  <span className="block">{fila.cliente.nombre}</span>
                  {fila.cliente.telefono ? (
                    <span className="text-muted-foreground text-xs">{fila.cliente.telefono}</span>
                  ) : null}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <InsigniaEtapa etapa={fila.etapa} />
                    <span className="text-muted-foreground text-xs">{haceDias(fila.etapa_desde)}</span>
                  </div>
                </td>
                <td className="text-muted-foreground px-3 py-2">{fila.responsable?.nombre ?? "—"}</td>
                {conTotales ? (
                  <td className="px-3 py-2 text-right font-mono tabular-nums">
                    {fila.total_vigente != null ? moneda(fila.total_vigente) : "—"}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta.ultima_pagina > 1 ? (
        <nav aria-label="Páginas" className="text-muted-foreground hidden items-center justify-between text-sm md:flex">
          <span>
            Página {meta.pagina} de {meta.ultima_pagina} · {meta.total} proyectos
          </span>
          <div className="flex gap-2">
            {meta.pagina > 1 ? (
              <Button asChild variant="outline" size="sm">
                <Link href={hrefPagina(meta.pagina - 1)}>Anterior</Link>
              </Button>
            ) : null}
            {meta.pagina < meta.ultima_pagina ? (
              <Button asChild variant="outline" size="sm">
                <Link href={hrefPagina(meta.pagina + 1)}>Siguiente</Link>
              </Button>
            ) : null}
          </div>
        </nav>
      ) : null}
    </>
  );
}
