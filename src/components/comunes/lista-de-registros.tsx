import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * La lista del ERP (sistema · `listas-y-filtros`): tarjetas en el móvil, tabla en el escritorio, y en los dos **la
 * fila es el enlace**. Antes cada lista iluminaba la fila entera y solo dejaba pulsar el código o el nombre —el 2, 4 y
 * 5 % de la fila, medido en SEC.0—, sin teclado.
 *
 * En la tabla, el enlace vive en la celda principal y se extiende sobre la fila (`after:absolute after:inset-0`, con
 * la fila `relative`): un solo enlace por fila, que se alcanza con `Tab`, se abre con `Enter` y en otra pestaña con
 * Ctrl o el botón central, porque es un `<a>`. Su nombre accesible es el de la celda principal. El anillo de foco va
 * pleno (8,6:1): el `ring-ring/50` de los botones mide 2,55:1 sobre blanco, poco para marcar una fila.
 *
 * Dentro de una fila no van otros controles: el enlace la cubre. Si alguno hiciera falta, va con `relative z-10`.
 * Sin estado ni efectos: sirve igual desde un componente de servidor que desde uno de cliente.
 */

export type Columna<T> = {
  clave: string;
  titulo: ReactNode;
  celda: (fila: T) => ReactNode;
  /** Las cifras, a la derecha */
  alinear?: "derecha";
  /** La tipografía de la celda: `font-mono`, `whitespace-nowrap`, el gris… */
  className?: string;
};

type Comunes<T> = {
  filas: readonly T[];
  clave: (fila: T) => string;
  enlace: (fila: T) => string;
  /** Un registro inactivo se ve al 60 % y sigue abriendo */
  atenuada?: (fila: T) => boolean;
};

type PropsTabla<T> = Comunes<T> & {
  columnas: Columna<T>[];
  /** La clave de la columna que nombra la fila: lleva el enlace */
  principal: string;
};

type PropsTarjetas<T> = Comunes<T> & {
  /** Lo que dice la tarjeta en el móvil; la tarjeta entera es el enlace */
  tarjeta: (fila: T) => ReactNode;
};

const ANILLO = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** El escritorio: la tabla densa (`TR-01`), con la fila entera enlazada */
export function TablaDeRegistros<T>({ filas, clave, enlace, atenuada, columnas, principal }: PropsTabla<T>) {
  return (
    <div className="bg-card hidden overflow-hidden rounded-md border shadow-sm md:block">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-muted-foreground text-left text-xs">
          <tr>
            {columnas.map((columna) => (
              <th
                key={columna.clave}
                scope="col"
                className={cn("px-3 py-2 font-medium", columna.alinear === "derecha" && "text-right")}
              >
                {columna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {filas.map((fila) => (
            <tr
              key={clave(fila)}
              className={cn("group hover:bg-muted/40 relative transition-colors", atenuada?.(fila) && "opacity-60")}
            >
              {columnas.map((columna) => (
                <td
                  key={columna.clave}
                  className={cn("px-3 py-2", columna.alinear === "derecha" && "text-right", columna.className)}
                >
                  {columna.clave === principal ? (
                    <Link
                      href={enlace(fila)}
                      className={cn(
                        "group-hover:underline after:absolute after:inset-0",
                        "focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset",
                      )}
                    >
                      {columna.celda(fila)}
                    </Link>
                  ) : (
                    columna.celda(fila)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** El móvil: tarjetas apiladas, cada una entera un enlace de al menos 44 px */
export function TarjetasDeRegistros<T>({ filas, clave, enlace, atenuada, tarjeta }: PropsTarjetas<T>) {
  return (
    <ul className="flex flex-col gap-2 md:hidden">
      {filas.map((fila) => (
        <li key={clave(fila)}>
          <Link
            href={enlace(fila)}
            className={cn(
              "bg-card active:bg-muted/60 flex min-h-11 flex-col gap-1.5 rounded-md border p-3 shadow-sm",
              ANILLO,
              atenuada?.(fila) && "opacity-60",
            )}
          >
            {tarjeta(fila)}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Las dos mitades con las mismas filas. La lista que enseña filas distintas en cada ancho —Proyectos: el móvil acumula
 * «Cargar más», el escritorio pagina— usa `TablaDeRegistros` y `TarjetasDeRegistros` por separado.
 */
export function ListaDeRegistros<T>(props: PropsTabla<T> & PropsTarjetas<T>) {
  return (
    <>
      <TarjetasDeRegistros {...props} />
      <TablaDeRegistros {...props} />
    </>
  );
}
