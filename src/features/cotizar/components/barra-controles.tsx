"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Limites, Tipo } from "@/features/cotizar/types";
import { numero } from "@/lib/formato";
import { cn } from "@/lib/utils";

/**
 * Los controles del cotizador, en una fila.
 *
 * Antes vivían en una tarjeta titulada «Medidas» que ocupaba un tercio de la pantalla
 * para pedir dos números. Cotizar es iterativo —se prueba 300, se ve el plano, se prueba
 * 360— así que los controles se quedan fijos arriba y siguen accesibles desde cualquier
 * pestaña: se puede recalcular sin salir de la verificación de perfiles.
 */
export function BarraControles({
  tipos,
  tipoId,
  ancho,
  alto,
  calculando,
  alCambiarTipo,
  alCambiarAncho,
  alCambiarAlto,
  alCalcular,
}: {
  tipos: Tipo[];
  tipoId: string;
  ancho: string;
  alto: string;
  calculando: boolean;
  alCambiarTipo: (id: string) => void;
  alCambiarAncho: (valor: string) => void;
  alCambiarAlto: (valor: string) => void;
  alCalcular: () => void;
}) {
  const tipoActual = tipos.find((t) => t.id === tipoId);
  const limites = tipoActual?.limites;

  const juicioAncho = evaluarAncho(ancho, limites);
  const juicioAlto = evaluarAlto(alto, limites);

  // Solo lo DURO impide calcular. Un aviso es información, no una barrera.
  const bloqueado =
    juicioAncho.estado === "error" || juicioAlto.estado === "error";

  return (
    <div className="bg-background/95 sticky top-0 z-10 -mx-4 flex flex-wrap items-start gap-3 border-b px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
      <div className="min-w-52 flex-1 md:max-w-72">
        <Label htmlFor="tipo" className="sr-only">
          Tipo de ventana
        </Label>
        <Select value={tipoId} onValueChange={alCambiarTipo}>
          {/* 44 px en el móvil: cotizar en obra es operación de primera (decisión 18) */}
          <SelectTrigger id="tipo" className="w-full data-[size=default]:h-11 md:data-[size=default]:h-9">
            <SelectValue placeholder="Seleccione un tipo" />
          </SelectTrigger>
          <SelectContent>
            {tipos.map((tipo) => (
              <SelectItem key={tipo.id} value={tipo.id}>
                {tipo.codigo} · {tipo.composicion.join("-")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-start gap-2">
        <CampoMedida
          id="ancho"
          etiqueta="Ancho en centímetros"
          valor={ancho}
          juicio={juicioAncho}
          alCambiar={alCambiarAncho}
        />

        <span aria-hidden className="text-muted-foreground pt-2 text-sm">
          ×
        </span>

        <CampoMedida
          id="alto"
          etiqueta="Alto en centímetros"
          valor={alto}
          juicio={juicioAlto}
          alCambiar={alCambiarAlto}
        />
      </div>

      <Button onClick={alCalcular} disabled={calculando || bloqueado} variant="brand" className="h-11 md:h-9">
        {calculando ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Calculando…
          </>
        ) : (
          "Calcular"
        )}
      </Button>
    </div>
  );
}

function CampoMedida({
  id,
  etiqueta,
  valor,
  juicio,
  alCambiar,
}: {
  id: string;
  etiqueta: string;
  valor: string;
  juicio: Juicio;
  alCambiar: (valor: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <Label htmlFor={id} className="sr-only">
          {etiqueta}
        </Label>
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          min={1}
          value={valor}
          onChange={(evento) => alCambiar(evento.target.value)}
          aria-invalid={juicio.estado === "error"}
          aria-describedby={juicio.mensaje ? `${id}-nota` : undefined}
          className={cn(
            "h-11 w-28 pr-9 tabular-nums md:h-9",
            juicio.estado === "aviso" && "border-warning",
          )}
        />
        <span
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs"
        >
          cm
        </span>
      </div>

      {juicio.mensaje ? (
        <p
          id={`${id}-nota`}
          className={cn(
            "flex max-w-56 items-start gap-1 text-[11px] leading-tight",
            juicio.estado === "error" ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {juicio.estado !== "ok" ? (
            <AlertTriangle className="mt-px size-3 shrink-0" />
          ) : null}
          {juicio.mensaje}
        </p>
      ) : null}
    </div>
  );
}

type Juicio = {
  estado: "ok" | "aviso" | "error";
  mensaje: string | null;
};

/**
 * El ancho tiene un techo FÍSICO: la barra más corta entre los perfiles que no admiten
 * empalme. Pasarse no es una preferencia discutible, es que la pieza no existe en esa
 * longitud, así que bloquea.
 *
 * El mínimo, en cambio, sale de `series.ancho_min_cm`, que la base de conocimiento marca
 * como deducido y sin confirmar en taller. Avisa y deja seguir: negar una cotización por
 * una suposición sería peor que aceptarla.
 */
function evaluarAncho(valor: string, limites?: Limites): Juicio {
  const numeroValor = Number(valor);

  if (!limites || valor === "" || Number.isNaN(numeroValor)) {
    return { estado: "ok", mensaje: null };
  }

  const { duro_max: duroMax, sugerido_min: sugeridoMin } = limites.ancho;

  if (duroMax !== null && numeroValor > duroMax) {
    return {
      estado: "error",
      mensaje: `Máximo ${numero(duroMax)} cm: es el largo de barra disponible para un perfil sin empalme.`,
    };
  }

  if (
    sugeridoMin !== null &&
    numeroValor > 0 &&
    numeroValor < sugeridoMin &&
    !limites.sugeridos_confirmados
  ) {
    return {
      estado: "aviso",
      mensaje: `Por debajo de los ${numero(sugeridoMin)} cm habituales (medida sin confirmar en taller).`,
    };
  }

  return {
    estado: "ok",
    mensaje: duroMax !== null ? `Hasta ${numero(duroMax)} cm` : null,
  };
}

/**
 * El alto tiene un suelo duro: por debajo del puente no queda hueco para la hoja
 * corrediza, así que el sistema deja de ser un sistema.
 */
function evaluarAlto(valor: string, limites?: Limites): Juicio {
  const numeroValor = Number(valor);

  if (!limites || valor === "" || Number.isNaN(numeroValor)) {
    return { estado: "ok", mensaje: null };
  }

  const {
    duro_min: duroMin,
    sugerido_min: sugeridoMin,
    sugerido_max: sugeridoMax,
  } = limites.alto;

  if (duroMin !== null && numeroValor > 0 && numeroValor <= duroMin) {
    return {
      estado: "error",
      mensaje: `Debe superar los ${numero(duroMin)} cm del puente; si no, no cabe la hoja corrediza.`,
    };
  }

  if (!limites.sugeridos_confirmados) {
    if (sugeridoMax !== null && numeroValor > sugeridoMax) {
      return {
        estado: "aviso",
        mensaje: `Por encima de los ${numero(sugeridoMax)} cm habituales (medida sin confirmar en taller).`,
      };
    }

    if (sugeridoMin !== null && numeroValor > 0 && numeroValor < sugeridoMin) {
      return {
        estado: "aviso",
        mensaje: `Por debajo de los ${numero(sugeridoMin)} cm habituales (medida sin confirmar en taller).`,
      };
    }
  }

  return {
    estado: "ok",
    mensaje: duroMin !== null ? `Más de ${numero(duroMin)} cm` : null,
  };
}
