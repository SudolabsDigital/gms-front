import type { Cliente, Etapa, Meta } from "@/features/proyectos/types";

/**
 * Una fila de `GET clientes` (`clientes/50-api` § lista): el cliente, cuántos proyectos tiene y, solo con `costeo:ver`,
 * cuánto debe, con la misma cuenta que la ficha (SEC.9d)
 */
export type ClienteFila = Cliente & { proyectos_count: number; debe?: number };

export type ListaClientesConRecuento = { datos: ClienteFila[]; meta: Meta };

type Contacto = Pick<Cliente, "documento" | "telefono" | "email" | "direccion">;

/** `GET clientes/resumen`, la portada de Clientes (SEC.10, decisión 78). `deben` solo viaja con `costeo:ver` */
export type ResumenDeClientes = {
  total: number;
  nuevos_30_dias: number;
  con_obra_en_curso: number;
  deben?: { clientes: number; total: number };
  por_completar: {
    total: number;
    clientes: (Pick<Cliente, "id" | "nombre"> & Contacto & { obra: { id: string; codigo: string; etapa: Etapa } })[];
  };
  recientes: (Pick<Cliente, "id" | "nombre" | "telefono"> & { created_at: string })[];
};

/**
 * Lo que le falta a un cliente, en el orden en que se pide (`52-brief-clientes` § 4): el documento primero, que es lo
 * que la cotización necesita. Una regla para la ficha y para «Por completar» de la portada
 */
export function datosQueFaltan(cliente: Contacto): string[] {
  return [
    !cliente.documento && "DNI o RUC",
    !cliente.telefono && "teléfono",
    !cliente.email && "email",
    !cliente.direccion && "dirección",
  ].filter((dato): dato is string => typeof dato === "string");
}

/** `GET clientes/{id}`. `debe` y `saldo` solo viajan con `costeo:ver`; `saldo`, además, desde `aprobado` */
export type ClienteFicha = Cliente & {
  debe?: number;
  proyectos: { id: string; codigo: string; nombre: string; etapa: Etapa; saldo?: number }[];
};

/** El largo dice el tipo (decisión 52): por eso no es un dato aparte */
export function documentoLegible(documento: string | null): string | null {
  if (!documento) return null;
  return `${documento.length === 11 ? "RUC" : "DNI"} ${documento}`;
}
