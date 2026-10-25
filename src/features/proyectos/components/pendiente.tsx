import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Lo que aún no existe en una sección de la obra se ve rotulado, sin fingir que funciona (`51-ui`) */
export function Pendiente({ icono: Icono, titulo, children }: { icono: LucideIcon; titulo: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icono className="size-4" />
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">{children}</CardContent>
    </Card>
  );
}
