"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { InsumoFicha } from "@/features/materiales/types";
import { mensajeDeError, pedir } from "@/lib/api-cliente";
import { notificar } from "@/lib/notificar";

/**
 * Desactivar o reactivar (decisión 46: nunca borrar). Si una regla viva lo usa, **no se ofrece para fallar**: se dice
 * por qué no se puede y cuáles son (`materiales/52-brief-materiales` § 6). El servidor lo exige igual (`MAT-I07`).
 */
export function ActividadInsumo({ insumo }: { insumo: InsumoFicha }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const vivas = insumo.reglas.filter((r) => r.activa).map((r) => r.codigo);

  async function cambiar() {
    setEnviando(true);
    const respuesta = await pedir<InsumoFicha>(`/api/v1/insumos/${insumo.id}/${insumo.activo ? "desactivar" : "activar"}`, { method: "POST" });
    setEnviando(false);

    if (!respuesta.ok) {
      notificar({ tono: "error", titulo: "No se pudo", descripcion: mensajeDeError(respuesta.error) });
      return;
    }
    notificar({
      tono: "exito",
      titulo: insumo.activo ? `${insumo.codigo} desactivado` : `${insumo.codigo} activo otra vez`,
      descripcion: insumo.activo ? "Lo ya cotizado y cortado sigue leyéndolo; deja de ofrecerse para lo nuevo." : undefined,
    });
    router.refresh();
  }

  if (insumo.activo && vivas.length > 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No se puede desactivar: lo usan {vivas.length === 1 ? "la regla" : "las reglas"} {vivas.join(", ")}, y el cálculo lo seguiría consumiendo.
      </p>
    );
  }

  return (
    <Button variant="outline" className="h-11 md:h-9" onClick={cambiar} disabled={enviando}>
      {enviando ? <Loader2 className="size-4 animate-spin" /> : null}
      {insumo.activo ? "Desactivar" : "Activar otra vez"}
    </Button>
  );
}
