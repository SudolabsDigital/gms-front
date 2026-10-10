import { ListaDeRegistros, type Columna } from "@/components/comunes/lista-de-registros";
import { CLASE } from "@/features/materiales/textos";
import { InsigniaDeCerteza } from "@/features/series/components/insignia-de-certeza";
import type { MaterialDeSerie } from "@/features/series/types";
import { moneda, plural } from "@/lib/formato";

/** Para qué lo usa la serie: cada pieza que lo corta, con su papel y su certeza; si nadie lo usa, se dice */
function Usos({ fila }: { fila: MaterialDeSerie }) {
  if (fila.usos.length === 0) return <span className="text-muted-foreground text-sm">No lo usa ningún diseño publicado</span>;

  return (
    <ul className="flex flex-col gap-1">
      {fila.usos.map((uso) => (
        <li key={`${uso.diseno}-${uso.pieza}`} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
          <span>
            <span className="font-mono text-xs font-semibold">{uso.pieza}</span>
            {uso.rol ? ` ${uso.rol}` : null}
          </span>
          <InsigniaDeCerteza certeza={uso.certeza} />
        </li>
      ))}
    </ul>
  );
}

/** El precio del proveedor por su presentación de compra, como en la lista general; sin `costeo:ver`, no viaja */
function Precio({ fila }: { fila: MaterialDeSerie }) {
  const precio = fila.compra?.precio;
  if (precio === undefined) return null;
  if (precio === 0) return <span className="text-warning-fuerte text-xs font-medium whitespace-nowrap">Sin precio</span>;

  return (
    <span className="font-mono tabular-nums whitespace-nowrap">
      {moneda(precio)}
      <span className="text-muted-foreground font-sans text-xs"> /{fila.compra?.nombre}</span>
    </span>
  );
}

/**
 * Los materiales de una serie (`series/52-brief-espacio-de-la-serie` § 4): una lista por origen —propios, comunes—, con
 * el uso de cada uno. La fila abre **la** ficha del insumo, en Materiales: la serie no la copia (decisión 79).
 */
export function ListaMaterialesDeSerie({ titulo, filas }: { titulo: string; filas: MaterialDeSerie[] }) {
  if (filas.length === 0) return null;

  const conPrecio = filas.some((f) => f.compra?.precio !== undefined);
  const columnas: Columna<MaterialDeSerie>[] = [
    { clave: "codigo", titulo: "Código", celda: (fila) => fila.codigo, className: "font-mono text-xs font-semibold whitespace-nowrap" },
    {
      clave: "nombre",
      titulo: "Nombre",
      celda: (fila) => (
        <>
          {fila.nombre_comercial}
          {!fila.activo ? <span className="text-muted-foreground ml-2 text-xs">inactivo</span> : null}
          <span className="text-muted-foreground block text-xs">{CLASE[fila.clase]}</span>
        </>
      ),
      className: "font-medium",
    },
    { clave: "usos", titulo: "Para qué", celda: (fila) => <Usos fila={fila} /> },
  ];

  if (conPrecio) {
    columnas.push({ clave: "precio", titulo: "Precio", alinear: "derecha", celda: (fila) => <Precio fila={fila} /> });
  }

  return (
    <section aria-label={titulo} className="flex flex-col gap-2">
      <h2 className="font-semibold">
        {titulo} <span className="text-muted-foreground font-normal">· {plural(filas.length, "insumo", "insumos")}</span>
      </h2>
      <ListaDeRegistros
        filas={filas}
        clave={(fila) => fila.id}
        enlace={(fila) => `/materiales/${fila.id}`}
        atenuada={(fila) => !fila.activo}
        principal="nombre"
        columnas={columnas}
        tarjeta={(fila) => (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-semibold">{fila.codigo}</span>
              <Precio fila={fila} />
            </div>
            <p className="leading-snug font-medium">{fila.nombre_comercial}</p>
            <Usos fila={fila} />
          </>
        )}
      />
    </section>
  );
}
