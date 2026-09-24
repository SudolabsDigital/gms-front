import { Badge } from "@/components/ui/badge";
import { ETAPAS, esCerrada } from "@/features/proyectos/textos";
import type { Etapa } from "@/features/proyectos/types";

/**
 * La etapa como insignia. Sin colores propios por etapa: el sistema no los tiene declarados y una
 * paleta inventada aquí sería una decisión de marca tomada por una pieza (dreamdesign, las tres
 * capas). Distingue lo único que la lista necesita distinguir de un vistazo: en curso o cerrado.
 */
export function InsigniaEtapa({ etapa }: { etapa: Etapa }) {
  return (
    <Badge variant={esCerrada(etapa) ? "outline" : "secondary"} className="shrink-0">
      {ETAPAS[etapa]}
    </Badge>
  );
}
