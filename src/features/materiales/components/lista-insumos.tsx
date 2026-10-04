import { ListaDeRegistros, type Columna } from "@/components/comunes/lista-de-registros";
import type { InsumoFila } from "@/features/materiales/types";
import { haceDias, moneda, plural } from "@/lib/formato";

/*
 * La lista del repositorio (`materiales/52-brief-materiales`): tarjetas en el móvil, tabla en el escritorio, y en los
 * dos la fila entera abre la ficha (`ListaDeRegistros`). Un insumo a S/ 0 lleva la señal de advertencia —cotizarlo así
 * sale a costo cero (`G-01`)— y uno inactivo va atenuado. Sin `costeo:ver` no hay columna de precio: la pantalla lo
 * nota porque la clave no viaja.
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

  const columnas: Columna<InsumoFila>[] = [
    {
      clave: "codigo",
      titulo: "Código",
      celda: (fila) => fila.codigo,
      className: "font-mono text-xs font-semibold whitespace-nowrap",
    },
    {
      clave: "nombre",
      titulo: "Nombre",
      celda: (fila) => (
        <>
          {fila.nombre_comercial}
          {!fila.activo ? <span className="text-muted-foreground ml-2 text-xs">inactivo</span> : null}
        </>
      ),
      className: "font-medium",
    },
    { clave: "material", titulo: "Material", celda: (fila) => fila.material?.nombre ?? "—", className: "text-muted-foreground" },
    { clave: "presentacion", titulo: "Presentación", celda: (fila) => fila.presentacion ?? "—", className: "text-muted-foreground" },
    {
      clave: "reglas",
      titulo: "Reglas",
      celda: (fila) => fila.reglas_activas,
      alinear: "derecha",
      className: "font-mono tabular-nums",
    },
  ];

  if (conPrecio) {
    columnas.push({
      clave: "precio",
      titulo: "Precio",
      alinear: "derecha",
      className: "whitespace-nowrap",
      celda: (fila) => (
        <>
          <Precio fila={fila} />
          {fila.compra?.precio && fila.precio_actualizado_at ? (
            <span className="text-muted-foreground block text-xs">{haceDias(fila.precio_actualizado_at)}</span>
          ) : null}
        </>
      ),
    });
  }

  return (
    <ListaDeRegistros
      filas={filas}
      clave={(fila) => fila.id}
      enlace={(fila) => `/materiales/${fila.id}`}
      atenuada={(fila) => !fila.activo}
      principal="nombre"
      columnas={columnas}
      // Va dentro de `TablaDeDatos`, con el buscador arriba y el total abajo (SEC.9c)
      incrustada
      tarjeta={(fila) => (
        <>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-sm font-semibold">{fila.codigo}</span>
            <Precio fila={fila} />
          </div>
          <p className="leading-snug font-medium">{fila.nombre_comercial}</p>
          <p className="text-muted-foreground text-sm">
            {[fila.material?.nombre, fila.presentacion, plural(fila.reglas_activas, "regla", "reglas")]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </>
      )}
    />
  );
}
