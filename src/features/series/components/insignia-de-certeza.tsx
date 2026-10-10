import { InsigniaDeDato, type Tono } from "@/components/comunes/insignia-de-dato";
import type { Certeza } from "@/features/series/types";

/** Lo que el plano sabe de la posición de una pieza (`disenos/51-ui` P4), dicho igual que en su pie */
const CERTEZAS: Record<Certeza, { texto: string; tono: Tono }> = {
  confirmada: { texto: "confirmada", tono: "ok" },
  deducida: { texto: "deducida", tono: "neutro" },
  hipotesis: { texto: "hipótesis", tono: "aviso" },
  sin_ubicar: { texto: "sin ubicar", tono: "aviso" },
};

/** La certeza de un uso: confirmada, deducida, hipótesis —se dibuja y no se corta— o sin ubicar en el plano */
export function InsigniaDeCerteza({ certeza }: { certeza: Certeza }) {
  return <InsigniaDeDato dato={CERTEZAS[certeza]} />;
}
