"use client";

import { useRouter } from "next/navigation";
import { RefreshCw, ServerCrash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Lo que ve el usuario del ERP cuando Laravel no responde: qué pasó y un botón para
 * reintentar, sin trazas ni detalles internos (a quien está delante no le sirven).
 *
 * Una sola pieza para los dos sitios donde ocurre: `(erp)/error.tsx`, cuando falla una
 * página, y `(erp)/layout.tsx`, cuando no se pudo ni comprobar la sesión. Ese segundo caso
 * no lo puede atrapar `error.tsx`, que solo envuelve lo que está DENTRO del layout: sin
 * esto, Next respondía su 500 desnudo.
 */
export function AvisoSinServidor({
  onReintentar,
  referencia,
}: {
  onReintentar: () => void;
  referencia?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-lg py-10">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 px-6 py-10 text-center">
          <div className="bg-muted text-muted-foreground rounded-full p-3">
            <ServerCrash className="size-6" />
          </div>

          <div className="space-y-1">
            <p className="font-medium">No se pudo cargar esta página</p>
            <p className="text-muted-foreground text-sm text-pretty">
              El sistema no obtuvo respuesta del servidor. Suele ser pasajero: vuelva a
              intentarlo. Si sigue igual, avise a soporte.
            </p>
          </div>

          <Button onClick={onReintentar} variant="brand">
            <RefreshCw className="size-4" />
            Reintentar
          </Button>

          {referencia ? (
            <p className="text-muted-foreground/70 font-mono text-xs">
              Referencia: {referencia}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

/** Para el layout, que es un Server Component y no puede pasar una función: reintenta refrescando. */
export function ErpSinServidor() {
  const router = useRouter();

  return <AvisoSinServidor onReintentar={() => router.refresh()} />;
}
