import { Buscador } from "@/components/comunes/buscador";
import { PanelDeLista, type FilaDePanel, type GrupoDeLista } from "@/components/erp/panel-de-lista";
import type { ClienteFila, ListaClientesConRecuento } from "@/features/clientes/types";
import { moneda, plural } from "@/lib/formato";

/**
 * Lo que pide el panel: hasta 100, quien debe primero (`orden=debe`, `clientes/50-api` § lista), para que «Deben»
 * salga entero aunque haya más de los que caben. La página lo pide —con `adelantar`, antes de la sesión— y lo pasa
 */
export function rutaDelPanelDeClientes(buscar: string): string {
  return `/clientes?orden=debe&por_pagina=100${buscar ? `&buscar=${encodeURIComponent(buscar)}` : ""}`;
}

/**
 * La lista de clientes al lado (SEC.9d y SEC.10, decisiones 76 a 78): la misma en la portada de Clientes y en cada
 * ficha, para pasar de uno a otro sin volver. Quien debe arriba, el resto por nombre; su buscador filtra el panel y no
 * la ficha, y cada fila lleva la búsqueda para no perderla al cambiar de cliente. Toma el foco solo en la portada,
 * donde encontrar es la acción principal (`52-brief-clientes` § 2): en una ficha se lo robaría a cada visita.
 */
export function PanelDeClientes({
  lista,
  buscar,
  accion,
  enfocar = false,
}: {
  lista: ListaClientesConRecuento;
  buscar: string;
  /** La página que recibe la búsqueda: la portada o la ficha en la que se está */
  accion: string;
  enfocar?: boolean;
}) {
  const consulta = buscar ? `?buscar=${encodeURIComponent(buscar)}` : "";

  return (
    <PanelDeLista
      titulo="Clientes"
      buscador={
        <Buscador
          accion={accion}
          id="buscar-clientes"
          etiqueta="Buscar clientes"
          placeholder="Nombre, teléfono o DNI/RUC"
          valor={buscar}
          enfocar={enfocar}
        />
      }
      grupos={grupos(lista.datos, consulta)}
      vacio={buscar ? `Nadie coincide con «${buscar}».` : "Todavía no hay clientes. Nacen al crear un proyecto."}
      pie={
        lista.meta.total > lista.datos.length
          ? `Se ven ${lista.datos.length} de ${lista.meta.total}: busca para encontrar al resto.`
          : null
      }
    />
  );
}

/**
 * «Deben» y «Al día», en el orden en que llegan (el del servidor). Sin `costeo:ver` el dinero no viaja y la lista va en
 * un solo grupo: no se agrupa por lo que no se puede ver.
 */
function grupos(clientes: ClienteFila[], consulta: string): GrupoDeLista[] {
  const fila = (c: ClienteFila): FilaDePanel => ({
    href: `/clientes/${c.id}${consulta}`,
    titulo: c.nombre,
    detalle: c.telefono ?? plural(c.proyectos_count, "proyecto", "proyectos"),
    monto: (c.debe ?? 0) > 0 ? { etiqueta: "debe", texto: moneda(c.debe ?? 0), tono: "aviso" } : undefined,
  });

  if (!clientes.some((c) => c.debe !== undefined)) return [{ titulo: "Clientes", filas: clientes.map(fila) }];

  return [
    { titulo: "Deben", filas: clientes.filter((c) => (c.debe ?? 0) > 0).map(fila) },
    { titulo: "Al día", filas: clientes.filter((c) => !((c.debe ?? 0) > 0)).map(fila) },
  ];
}
