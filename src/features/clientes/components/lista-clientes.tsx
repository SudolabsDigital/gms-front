import { ListaDeRegistros } from "@/components/comunes/lista-de-registros";
import { documentoLegible, type ClienteFila } from "@/features/clientes/types";
import { plural } from "@/lib/formato";

/*
 * La agenda de clientes (`clientes/52-brief-clientes` § 3): tarjetas en el móvil, tabla en el escritorio, y en los dos
 * la fila entera abre la ficha (`ListaDeRegistros`). Sin dinero: a quién cobrar lo responde «Por cobrar» de Proyectos
 * (decisión 53).
 */

function contacto(fila: ClienteFila): string {
  return [fila.telefono, documentoLegible(fila.documento)].filter(Boolean).join(" · ") || "Sin datos de contacto";
}

export function ListaClientes({ filas }: { filas: ClienteFila[] }) {
  return (
    <ListaDeRegistros
      filas={filas}
      clave={(fila) => fila.id}
      enlace={(fila) => `/clientes/${fila.id}`}
      principal="nombre"
      columnas={[
        { clave: "nombre", titulo: "Nombre", celda: (fila) => fila.nombre, className: "font-medium" },
        {
          clave: "telefono",
          titulo: "Teléfono",
          celda: (fila) => fila.telefono ?? "—",
          className: "text-muted-foreground whitespace-nowrap",
        },
        {
          clave: "documento",
          titulo: "DNI / RUC",
          celda: (fila) => fila.documento ?? "—",
          className: "text-muted-foreground font-mono text-xs whitespace-nowrap",
        },
        {
          clave: "proyectos",
          titulo: "Proyectos",
          celda: (fila) => fila.proyectos_count,
          alinear: "derecha",
          className: "font-mono tabular-nums",
        },
      ]}
      tarjeta={(fila) => (
        <>
          <div className="flex items-baseline justify-between gap-2">
            <span className="leading-snug font-medium break-words">{fila.nombre}</span>
            <span className="text-muted-foreground shrink-0 text-sm">
              {plural(fila.proyectos_count, "proyecto", "proyectos")}
            </span>
          </div>
          <p className="text-muted-foreground text-sm break-words">{contacto(fila)}</p>
        </>
      )}
      // Va dentro de `TablaDeDatos`, con el buscador arriba y el total abajo (SEC.9d)
      incrustada
    />
  );
}
