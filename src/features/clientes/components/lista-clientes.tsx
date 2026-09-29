import Link from "next/link";

import { documentoLegible, type ClienteFila } from "@/features/clientes/types";
import { plural } from "@/lib/formato";

/*
 * La agenda de clientes (`clientes/52-brief-clientes` § 3): tarjetas en el móvil, tabla en el escritorio, como
 * `/proyectos` y `/materiales`. Sin dinero: a quién cobrar lo responde «Por cobrar» de Proyectos (decisión 53).
 */

function contacto(fila: ClienteFila): string {
  return [fila.telefono, documentoLegible(fila.documento)].filter(Boolean).join(" · ") || "Sin datos de contacto";
}

function Recuento({ n }: { n: number }) {
  return <span className="text-muted-foreground shrink-0 text-sm">{plural(n, "proyecto", "proyectos")}</span>;
}

export function ListaClientes({ filas }: { filas: ClienteFila[] }) {
  return (
    <>
      <ul className="flex flex-col gap-2 md:hidden">
        {filas.map((fila) => (
          <li key={fila.id}>
            <Link href={`/clientes/${fila.id}`} className="bg-card active:bg-muted/60 flex flex-col gap-1 rounded-md border p-3 shadow-sm">
              <div className="flex items-baseline justify-between gap-2">
                <span className="leading-snug font-medium break-words">{fila.nombre}</span>
                <Recuento n={fila.proyectos_count} />
              </div>
              <p className="text-muted-foreground text-sm break-words">{contacto(fila)}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="bg-card hidden overflow-hidden rounded-md border shadow-sm md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground text-left text-xs">
            <tr>
              <th className="px-3 py-2 font-medium">Nombre</th>
              <th className="px-3 py-2 font-medium">Teléfono</th>
              <th className="px-3 py-2 font-medium">DNI / RUC</th>
              <th className="px-3 py-2 text-right font-medium">Proyectos</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filas.map((fila) => (
              <tr key={fila.id} className="hover:bg-muted/40">
                <td className="px-3 py-2 font-medium">
                  <Link href={`/clientes/${fila.id}`} className="hover:underline">
                    {fila.nombre}
                  </Link>
                </td>
                <td className="text-muted-foreground px-3 py-2 whitespace-nowrap">{fila.telefono ?? "—"}</td>
                <td className="text-muted-foreground px-3 py-2 font-mono text-xs whitespace-nowrap">{fila.documento ?? "—"}</td>
                <td className="px-3 py-2 text-right font-mono tabular-nums">{fila.proyectos_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
