"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Enlace } from "@/components/comunes/enlace";
import { TablaDeRegistros, TarjetasDeRegistros, type Columna } from "@/components/comunes/lista-de-registros";
import { Button } from "@/components/ui/button";
import { InsigniaEtapa } from "@/features/proyectos/components/insignia-etapa";
import type { ListaProyectos, ProyectoFila } from "@/features/proyectos/types";
import { mensajeDeError, pedir } from "@/lib/api-cliente";
import { haceDias, moneda } from "@/lib/formato";

/**
 * La lista de trabajo (`proyectos/51-ui` § `/proyectos`): tarjetas en el móvil, tabla en el escritorio, y en los dos
 * la fila entera abre la ficha (`TablaDeRegistros`, `TarjetasDeRegistros`). Antes la fila navegaba con un `onClick` que
 * el teclado no alcanzaba y que no abría en otra pestaña.
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
  // En «Por cobrar» la cifra que importa es lo que falta, no el total de la cotización (V12)
  const conSaldo = inicial.datos.some((fila) => "saldo" in fila);
  const cifra = (fila: ProyectoFila) => (conSaldo ? fila.saldo : fila.total_vigente);
  // Una función no cruza del servidor al cliente: la URL de cada página se arma aquí
  const hrefPagina = (n: number) => `/proyectos?${consulta}${consulta ? "&" : ""}pagina=${n}`;
  const enlace = (fila: ProyectoFila) => `/proyectos/${fila.id}`;

  const columnas: Columna<ProyectoFila>[] = [
    { clave: "codigo", titulo: "Código", celda: (fila) => fila.codigo, className: "font-mono text-xs whitespace-nowrap" },
    { clave: "nombre", titulo: "Proyecto", celda: (fila) => fila.nombre, className: "font-medium" },
    {
      clave: "cliente",
      titulo: "Cliente",
      celda: (fila) => (
        <>
          <span className="block">{fila.cliente.nombre}</span>
          {fila.cliente.telefono ? <span className="text-muted-foreground text-xs">{fila.cliente.telefono}</span> : null}
        </>
      ),
    },
    {
      clave: "etapa",
      titulo: "Etapa",
      className: "whitespace-nowrap",
      celda: (fila) => (
        <div className="flex items-center gap-2">
          <InsigniaEtapa etapa={fila.etapa} />
          <span className="text-muted-foreground text-xs">{haceDias(fila.etapa_desde)}</span>
        </div>
      ),
    },
    {
      clave: "responsable",
      titulo: "Responsable",
      celda: (fila) => fila.responsable?.nombre ?? "—",
      className: "text-muted-foreground",
    },
  ];

  if (conTotales) {
    columnas.push({
      clave: "cifra",
      titulo: conSaldo ? "Por cobrar" : "Total vigente",
      celda: (fila) => (cifra(fila) != null ? moneda(cifra(fila)) : "—"),
      alinear: "derecha",
      className: "font-mono tabular-nums",
    });
  }

  return (
    <>
      {/* ── Móvil: tarjetas, con las páginas que «Cargar más» va añadiendo ── */}
      <TarjetasDeRegistros
        filas={filas}
        clave={(fila) => fila.id}
        enlace={enlace}
        tarjeta={(fila) => (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground font-mono text-xs">{fila.codigo}</span>
              <InsigniaEtapa etapa={fila.etapa} />
            </div>
            <p className="leading-snug font-medium">{fila.nombre}</p>
            <div className="text-muted-foreground flex items-center justify-between gap-2 text-sm">
              <span className="truncate">{fila.cliente.nombre}</span>
              <span className="shrink-0">{haceDias(fila.etapa_desde)}</span>
            </div>
            {cifra(fila) != null ? (
              <p className="font-mono text-sm tabular-nums">
                {conSaldo ? <span className="text-muted-foreground font-sans">Por cobrar </span> : null}
                {moneda(cifra(fila))}
              </p>
            ) : null}
          </>
        )}
      />

      {quedanMas ? (
        <div className="md:hidden">
          <Button variant="outline" className="h-11 w-full" onClick={cargarMas} disabled={cargando}>
            {cargando ? <Loader2 className="size-4 animate-spin" /> : null}
            Cargar más ({meta.total - filas.length} restantes)
          </Button>
          {fallo ? <p className="text-destructive-fuerte mt-2 text-sm">{fallo}</p> : null}
        </div>
      ) : null}

      {/* ── Escritorio: la tabla densa de la página que pidió el servidor ── */}
      <TablaDeRegistros
        filas={inicial.datos}
        clave={(fila) => fila.id}
        enlace={enlace}
        principal="nombre"
        columnas={columnas}
      />

      {meta.ultima_pagina > 1 ? (
        <nav aria-label="Páginas" className="text-muted-foreground hidden items-center justify-between text-sm md:flex">
          <span>
            Página {meta.pagina} de {meta.ultima_pagina} · {meta.total} proyectos
          </span>
          <div className="flex gap-2">
            {meta.pagina > 1 ? (
              <Button asChild variant="outline" size="sm">
                <Enlace href={hrefPagina(meta.pagina - 1)}>Anterior</Enlace>
              </Button>
            ) : null}
            {meta.pagina < meta.ultima_pagina ? (
              <Button asChild variant="outline" size="sm">
                <Enlace href={hrefPagina(meta.pagina + 1)}>Siguiente</Enlace>
              </Button>
            ) : null}
          </div>
        </nav>
      ) : null}
    </>
  );
}
