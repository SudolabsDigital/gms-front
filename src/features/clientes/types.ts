import type { Cliente, Etapa, Meta } from "@/features/proyectos/types";

/** Una fila de `GET clientes` (`clientes/50-api` § lista): el cliente y cuántos proyectos tiene */
/** `GET clientes`. `debe` solo viaja con `costeo:ver`: la misma cuenta que la ficha (SEC.9d) */
export type ClienteFila = Cliente & { proyectos_count: number; debe?: number };

export type ListaClientesConRecuento = { datos: ClienteFila[]; meta: Meta };

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
