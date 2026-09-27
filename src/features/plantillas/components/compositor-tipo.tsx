"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Minus, Plus, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { COLOR_CORREDIZO } from "@/lib/catalogo-visual";
import { notificar } from "@/lib/notificar";
import { cn } from "@/lib/utils";
import { erroresPorCampo, pedir } from "@/lib/api-cliente";

/**
 * El compositor: crear un tipo nuevo escribiendo su secuencia de paneles.
 *
 * Materializa la promesa del sistema: «el octavo tipo cuesta cero horas de modelado».
 * El maestro alterna F↔D con un clic y el tipo nace calculable, heredando las reglas
 * del diseño.
 *
 * [AVISO] Este componente NO deriva NADA de la composición —ni bloques, ni juntas, ni
 * carriles— aunque en JavaScript sería trivial. Toda variable derivada vive en el motor
 * (PC-GMS-006). Aquí solo se edita una secuencia de letras.
 */

type Panel = "F" | "D";

const COMPOSICION_INICIAL: Panel[] = ["F", "D", "F"];
const MAXIMO_PANELES = 20;

/** Los campos que pintan su error debajo. Si se añade uno en el JSX, se añade aquí. */
const CAMPOS_CON_ERROR_VISIBLE = ["codigo"];

export function CompositorTipo({
  disenoId,
  disenoNombre,
  codigoSugerido,
  conTarjeta = true,
  alGuardar,
}: {
  disenoId: string;
  disenoNombre: string;
  codigoSugerido: string;
  /** Dentro de un diálogo sobra el marco: el diálogo ya es el contenedor y su título. */
  conTarjeta?: boolean;
  /** Se avisa al contenedor tras crear el tipo, para que pueda cerrarse. */
  alGuardar?: () => void;
}) {
  const router = useRouter();
  const [guardando, iniciarGuardado] = useTransition();

  const [composicion, setComposicion] = useState<Panel[]>(COMPOSICION_INICIAL);
  const [codigo, setCodigo] = useState(codigoSugerido);
  const [ancho, setAncho] = useState("300");
  const [alto, setAlto] = useState("170");
  const [publicado, setPublicado] = useState(true);
  const [errores, setErrores] = useState<Record<string, string[]>>({});

  const sinCorrediza = !composicion.includes("D");

  function alternar(indice: number) {
    setComposicion((actual) =>
      actual.map((panel, i) => (i === indice ? (panel === "F" ? "D" : "F") : panel)),
    );
  }

  function agregar() {
    setComposicion((actual) =>
      actual.length >= MAXIMO_PANELES ? actual : [...actual, "F"],
    );
  }

  function quitar() {
    setComposicion((actual) => (actual.length <= 2 ? actual : actual.slice(0, -1)));
  }

  function guardar() {
    setErrores({});

    iniciarGuardado(async () => {
      const respuesta = await pedir(`/api/v1/disenos/${disenoId}/tipos`, {
        method: "POST",
        body: JSON.stringify({
          codigo,
          composicion,
          ancho_default: Number(ancho),
          alto_default: Number(alto),
          publicado,
        }),
      });

      if (!respuesta.ok) {
        setErrores(erroresPorCampo(respuesta.error));

        // Lo que tiene sitio en el formulario se pinta ahí. Lo que no —la composición, las medidas
        // por defecto, un fallo de red o de permiso— solo lo puede contar el aviso, con su mensaje
        // real: un «revise los datos» sin decir cuál deja al maestro adivinando.
        const sinSitio = respuesta.error.detalles.find(
          ({ campo }) => campo === null || !CAMPOS_CON_ERROR_VISIBLE.includes(campo),
        );

        notificar({ tono: "error", titulo: sinSitio?.mensaje ?? "Revise los datos del tipo." });

        return;
      }

      notificar({
        tono: "exito",
        titulo: `Tipo ${codigo} creado`,
        descripcion: "Ya se puede cotizar: hereda las reglas del diseño.",
      });

      router.refresh();
      setComposicion(COMPOSICION_INICIAL);
      alGuardar?.();
    });
  }

  const cuerpo = (
    <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label>Composición</Label>
            <span className="text-muted-foreground font-mono text-xs">
              {composicion.join("-")}
            </span>
          </div>

          {/* Área táctil de 48px: esto se usa en tablet, en el taller */}
          <div className="flex items-stretch gap-2">
            <div className="flex flex-1 gap-1.5">
              {composicion.map((panel, indice) => (
                <button
                  key={indice}
                  type="button"
                  onClick={() => alternar(indice)}
                  aria-label={`Panel ${indice + 1}: ${
                    panel === "F" ? "fijo" : "corredizo"
                  }. Pulse para cambiar`}
                  className={cn(
                    "flex min-h-12 flex-1 flex-col items-center justify-center rounded-md border-2 text-sm font-semibold transition-colors",
                    panel === "F" &&
                      "bg-muted text-muted-foreground border-transparent hover:border-muted-foreground/30",
                  )}
                  style={
                    panel === "D"
                      ? {
                          backgroundColor: `${COLOR_CORREDIZO}1a`,
                          borderColor: `${COLOR_CORREDIZO}66`,
                          color: COLOR_CORREDIZO,
                        }
                      : undefined
                  }
                >
                  {panel}
                  <span className="text-[10px] font-normal opacity-70">
                    {panel === "F" ? "fijo" : "corre."}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={agregar}
                disabled={composicion.length >= MAXIMO_PANELES}
                aria-label="Agregar panel"
              >
                <Plus className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={quitar}
                disabled={composicion.length <= 2}
                aria-label="Quitar panel"
              >
                <Minus className="size-4" />
              </Button>
            </div>
          </div>

          {sinCorrediza ? (
            <p className="text-destructive-fuerte text-sm">
              Un Puente Escondido requiere al menos una hoja corrediza.
            </p>
          ) : (
            <p className="text-muted-foreground text-xs">
              Pulse un panel para alternar entre fijo y corredizo. El despiece, el costeo
              y el plano los calcula el motor al guardar.
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="codigo">Código</Label>
            <Input
              id="codigo"
              value={codigo}
              onChange={(e) => {
                setCodigo(e.target.value.toUpperCase());
                // «Ya existe un tipo con ese código» habla del código de antes: con otro, miente
                setErrores((actuales) => {
                  const siguientes = { ...actuales };
                  delete siguientes.codigo;

                  return siguientes;
                });
              }}
              className="font-mono"
            />
            {errores.codigo ? (
              <p className="text-destructive-fuerte text-xs">{errores.codigo[0]}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ancho-def">Ancho de referencia (cm)</Label>
            <Input
              id="ancho-def"
              type="number"
              value={ancho}
              onChange={(e) => setAncho(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="alto-def">Alto de referencia (cm)</Label>
            <Input
              id="alto-def"
              type="number"
              value={alto}
              onChange={(e) => setAlto(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
          <div className="flex items-center gap-3">
            <Switch id="publicado" checked={publicado} onCheckedChange={setPublicado} />
            <Label htmlFor="publicado" className="font-normal">
              Publicar
              <span className="text-muted-foreground ml-1 text-xs">
                (sin publicar no se puede cotizar)
              </span>
            </Label>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setComposicion(COMPOSICION_INICIAL)}
              disabled={guardando}
            >
              <RotateCcw className="size-4" />
              Reiniciar
            </Button>

            <Button
              type="button"
              variant="brand"
              onClick={guardar}
              disabled={guardando || sinCorrediza}
            >
              {guardando ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creando…
                </>
              ) : (
                "Crear tipo"
              )}
            </Button>
          </div>
        </div>
    </div>
  );

  if (!conTarjeta) return cuerpo;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Nuevo tipo en {disenoNombre}</CardTitle>
      </CardHeader>

      <CardContent>{cuerpo}</CardContent>
    </Card>
  );
}
