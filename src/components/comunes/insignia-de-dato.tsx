import { cn } from "@/lib/utils";

/** El tono de un dato: los «fuertes» de la decisión 32. Nunca solo color: lo dice el texto */
export type Tono = "neutro" | "aviso" | "ok" | "peligro";

/** Lo que una entrada de navegación dice de su sección: «debe S/ 317.18», «por medir», «v2 aprobada» */
export type Dato = { texto: string; tono?: Tono };

const TONOS: Record<Tono, string> = {
  neutro: "bg-muted text-muted-foreground",
  aviso: "bg-warning/10 text-warning-fuerte",
  ok: "bg-success/10 text-success-fuerte",
  peligro: "bg-destructive/10 text-destructive-fuerte",
};

/**
 * El dato de una sección, junto a su nombre en el panel o en las pestañas (SEC.9b, `componentes-del-armazon` § 3).
 * Es lo que deja ver sin entrar qué pide atención: un saldo, una medición pendiente, la versión vigente.
 */
export function InsigniaDeDato({ dato, className }: { dato: Dato; className?: string }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-1.5 py-px text-[11px] font-semibold whitespace-nowrap tabular-nums",
        TONOS[dato.tono ?? "neutro"],
        className,
      )}
    >
      {dato.texto}
    </span>
  );
}
