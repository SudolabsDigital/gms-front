import Link from "next/link";

import type { InsumoFila } from "@/features/materiales/types";
import { haceDias, moneda, plural } from "@/lib/formato";
import { cn } from "@/lib/utils";

/*
 * La lista del repositorio (`materiales/52-brief-materiales`): tarjetas en el móvil, tabla en el escritorio, como
 * `/proyectos`. Un insumo a S/ 0 lleva la señal de advertencia —cotizarlo así sale a costo cero (`G-01`)— y uno
 * inactivo va atenuado. Sin `costeo:ver` no hay columna de precio: la pantalla lo nota porque la clave no viaja.
 */

function SinPrecio() {
  return (
    <span className="border-warning-fuerte/50 text-warning-fuerte rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap">
      Sin precio
    </span>
  );
}

/** El precio del proveedor por su presentación de compra (decisión 48): es el que Miguel reconoce en la lista */
function Precio({ fila }: { fila: InsumoFila }) {
  const precio = fila.compra?.precio;
  if (precio === undefined) return null;
  if (precio === 0) return <SinPrecio />;
  return (
    <span className="font-mono tabular-nums">
      {moneda(precio)}
      <span className="text-muted-foreground font-sans text-xs"> /{fila.compra?.nombre}</span>
    </span>
  );
}

export function ListaInsumos({ filas }: { filas: InsumoFila[] }) {
  const conPrecio = filas.some((f) => f.compra?.precio !== undefined);

  return (
    <>
      <ul className="flex flex-col gap-2 md:hidden">
        {filas.map((fila) => (
          <li key={fila.id}>
            <Link
              href={`/materiales/${fila.id}`}
              className={cn("bg-card active:bg-muted/60 flex flex-col gap-1 rounded-md border p-3 shadow-sm", !fila.activo && "opacity-60")}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm font-semibold">{fila.codigo}</span>
                <Precio fila={fila} />
              </div>
              <p className="leading-snug font-medium">{fila.nombre_comercial}</p>
              <p className="text-muted-foreground text-sm">
                {[fila.material?.nombre, fila.presentacion, plural(fila.reglas_activas, "regla", "reglas")].filter(Boolean).join(" · ")}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="bg-card hidden overflow-hidden rounded-md border shadow-sm md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground text-left text-xs">
            <tr>
              <th className="px-3 py-2 font-medium">Código</th>
              <th className="px-3 py-2 font-medium">Nombre</th>
              <th className="px-3 py-2 font-medium">Material</th>
              <th className="px-3 py-2 font-medium">Presentación</th>
              <th className="px-3 py-2 text-right font-medium">Reglas</th>
              {conPrecio ? <th className="px-3 py-2 text-right font-medium">Precio</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filas.map((fila) => (
              <tr key={fila.id} className={cn("hover:bg-muted/40", !fila.activo && "opacity-60")}>
                <td className="px-3 py-2 font-mono text-xs font-semibold whitespace-nowrap">
                  <Link href={`/materiales/${fila.id}`} className="hover:underline">
                    {fila.codigo}
                  </Link>
                </td>
                <td className="px-3 py-2 font-medium">
                  <Link href={`/materiales/${fila.id}`} className="hover:underline">
                    {fila.nombre_comercial}
                  </Link>
                  {!fila.activo ? <span className="text-muted-foreground ml-2 text-xs">inactivo</span> : null}
                </td>
                <td className="text-muted-foreground px-3 py-2">{fila.material?.nombre ?? "—"}</td>
                <td className="text-muted-foreground px-3 py-2">{fila.presentacion ?? "—"}</td>
                <td className="px-3 py-2 text-right font-mono tabular-nums">{fila.reglas_activas}</td>
                {conPrecio ? (
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <Precio fila={fila} />
                    {fila.compra?.precio && fila.precio_actualizado_at ? (
                      <span className="text-muted-foreground block text-xs">{haceDias(fila.precio_actualizado_at)}</span>
                    ) : null}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
