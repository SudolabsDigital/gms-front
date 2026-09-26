import type { ReactNode } from "react";

import { diaDe, diaDeHoy, diaLegible, numero } from "@/lib/formato";
import { cn } from "@/lib/utils";
import type { ItemDeCorte, ListaDeCorte } from "@/features/proyectos/types";

/*
 * La lista de corte en papel (brief `proyectos/53-brief-lista-de-corte`).
 *
 * Negro sobre blanco con los tokens de la tarjeta (#090d16 sobre #ffffff): la impresora del taller no tiene por
 * qué ser de color y un gris se pierde en la fotocopia, así que aquí no hay `muted-foreground` ni color de marca.
 * Las cifras van en mono tabular, más grandes que el resto: se leen de pie, a un metro, entre corte y corte.
 * Cuatro columnas caben igual a 358 px que en A4, por eso no hay una maqueta aparte para el móvil.
 */

/** Las cantidades llegan con hasta tres decimales (`numeric(12,3)`) y se muestran sin redondear */
const cifra = (valor: number) => numero(valor, 3);

const CIFRA = "font-mono tabular-nums font-medium text-lg whitespace-nowrap print:text-xl";

function Casilla() {
  // La casilla es de lápiz: nada vuelve al sistema
  return <span aria-hidden className="border-foreground inline-block size-5 border" />;
}

function Pieza({ codigo, nombre, detalle }: { codigo: string; nombre?: string; detalle: (string | null)[] }) {
  const pie = detalle.filter(Boolean).join(" · ");
  return (
    <>
      <span className="font-mono font-semibold">{codigo}</span>
      {nombre ? <span> · {nombre}</span> : null}
      {pie ? <span className="block text-xs">{pie}</span> : null}
    </>
  );
}

function Seccion({ titulo, columnas, children }: { titulo: string; columnas: string[]; children: ReactNode }) {
  return (
    <table className="mt-3 w-full border-collapse text-sm print:mt-1.5">
      <caption className="text-left text-xs font-semibold tracking-wide uppercase">{titulo}</caption>
      <thead className="print:table-header-group">
        <tr className="border-foreground border-b text-xs">
          {columnas.map((columna, i) => (
            <th key={columna} scope="col" className={cn("py-1 font-medium", i === 0 ? "text-left" : "pl-3 text-right")}>
              {columna}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

const FILA = "border-foreground border-b break-inside-avoid";
const CELDA = "py-2 align-middle print:py-1";
const CELDA_CIFRA = cn(CELDA, CIFRA, "pl-3 text-right");

function Item({ item, orden }: { item: ItemDeCorte; orden: number }) {
  return (
    <section className="border-foreground mt-6 border-t-2 pt-3 break-inside-avoid print:mt-3 print:pt-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-xl font-semibold print:text-2xl">{item.ubicacion?.trim() || `Ítem ${orden}`}</h2>
        <p className={cn(CIFRA, "text-base print:text-lg")}>
          {cifra(item.ancho_cm)} × {cifra(item.alto_cm)} cm · {item.cantidad} {item.cantidad === 1 ? "unidad" : "unidades"}
        </p>
      </div>
      <p className="text-sm">
        {item.tipo.nombre} <span className="font-mono">({item.tipo.codigo})</span>
      </p>

      {item.perfiles.length > 0 ? (
        <Seccion titulo="Perfiles y felpas" columnas={["Perfil", "Largo", "Piezas", "Cortado"]}>
          {item.perfiles.map((p) => (
            <tr key={`${p.insumo.codigo}-${p.largo_cm}`} className={FILA}>
              <td className={CELDA}>
                <Pieza codigo={p.insumo.codigo} nombre={p.insumo.nombre} detalle={[p.rol, p.regla]} />
              </td>
              <td className={CELDA_CIFRA}>{cifra(p.largo_cm)} cm</td>
              <td className={CELDA_CIFRA}>{cifra(p.piezas)}</td>
              <td className={cn(CELDA, "pl-3 text-right")}>
                <Casilla />
              </td>
            </tr>
          ))}
        </Seccion>
      ) : null}

      {item.vidrios.length > 0 ? (
        <Seccion titulo="Vidrios" columnas={["Vidrio", "Ancho × alto", "Piezas", "Cortado"]}>
          {item.vidrios.map((v) => (
            <tr key={`${v.insumo.codigo}-${v.ancho_cm}-${v.alto_cm}`} className={FILA}>
              <td className={CELDA}>
                <Pieza codigo={v.insumo.codigo} detalle={[v.rol, v.regla]} />
              </td>
              <td className={CELDA_CIFRA}>
                {cifra(v.ancho_cm)} × {cifra(v.alto_cm)}
              </td>
              <td className={CELDA_CIFRA}>{cifra(v.piezas)}</td>
              <td className={cn(CELDA, "pl-3 text-right")}>
                <Casilla />
              </td>
            </tr>
          ))}
        </Seccion>
      ) : null}

      {item.accesorios.length > 0 ? (
        <Seccion titulo="Accesorios" columnas={["Accesorio", "Unidades", "Listo"]}>
          {item.accesorios.map((a) => (
            <tr key={a.insumo.codigo} className={FILA}>
              <td className={CELDA}>
                <Pieza codigo={a.insumo.codigo} nombre={a.insumo.nombre} detalle={[a.rol]} />
              </td>
              <td className={CELDA_CIFRA}>{cifra(a.unidades)}</td>
              <td className={cn(CELDA, "pl-3 text-right")}>
                <Casilla />
              </td>
            </tr>
          ))}
        </Seccion>
      ) : null}
    </section>
  );
}

/**
 * La hoja entera. En pantalla es la vista previa: una hoja blanca sobre el fondo del ERP; en papel, lo único
 * que sale.
 */
export function HojaDeCorte({ lista }: { lista: ListaDeCorte }) {
  const { proyecto, cotizacion, medicion } = lista;
  const direccion = [proyecto.direccion_obra, proyecto.distrito].filter(Boolean).join(", ");

  return (
    <article className="bg-card text-card-foreground mx-auto w-full max-w-3xl p-4 sm:p-8 print:max-w-none print:p-0">
      {/* Sin raya inferior: la pone el primer ítem, que abre con la suya */}
      <header>
        <p className="text-xs font-semibold tracking-wide uppercase">Lista de corte</p>
        <h1 className="mt-1 text-xl font-semibold text-balance break-words print:text-2xl">
          <span className="font-mono">{proyecto.codigo}</span> · {proyecto.nombre}
        </h1>
        <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 text-sm print:grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
          <dt className="font-medium">Cliente</dt>
          <dd className="break-words">{proyecto.cliente}</dd>
          <dt className="font-medium">Obra</dt>
          <dd className="break-words">{direccion || "—"}</dd>
          <dt className="font-medium">Cotización</dt>
          <dd className="font-mono">
            {cotizacion.numero} · v{cotizacion.version}
          </dd>
          <dt className="font-medium">Medido en obra</dt>
          <dd className="font-mono">{medicion.registrada_at ? diaLegible(diaDe(medicion.registrada_at)) : "—"}</dd>
          <dt className="font-medium">Impreso</dt>
          <dd className="font-mono">{diaLegible(diaDeHoy())}</dd>
        </dl>
      </header>

      {lista.items.map((item, i) => (
        <Item key={item.id} item={item} orden={i + 1} />
      ))}
    </article>
  );
}
