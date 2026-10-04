import type { Metadata } from "next";
import { Calculator, LayoutTemplate } from "lucide-react";

import { EmptyState } from "@/components/comunes/empty-state";
import { PageHeader } from "@/components/comunes/page-header";
import { TarjetaEnlace } from "@/components/comunes/tarjeta-enlace";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RUTA_INICIO } from "@/components/erp/navegacion";
import type { Tipo } from "@/features/cotizar/types";
import { DialogoNuevoTipo } from "@/features/plantillas/components/dialogo-nuevo-tipo";
import { TiraComposicion } from "@/features/plantillas/components/tira-composicion";
import { apiGet } from "@/lib/api-server";
import { numero, plural } from "@/lib/formato";

export const metadata: Metadata = {
  title: "Plantillas · GMS Integra",
};

type Diseno = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  serie: { codigo: string; nombre: string };
  tipos_count: number;
};

/**
 * El repositorio de tipos de un diseño.
 *
 * [AVISO] Limitación conocida: hoy solo se muestra el PRIMER diseño que devuelve la API.
 * Mientras exista un único diseño (Puente Escondido) el resultado es correcto, pero en
 * cuanto entre el segundo esta página tapará uno sin avisar. El selector de diseño está
 * planificado; no se improvisa aquí porque implica decidir el criterio de clasificación
 * —serie, tipología o uso— y esa es una conversación con el taller, no una decisión de
 * frontend.
 */
export default async function PlantillasPage() {
  const disenos = await apiGet<Diseno[]>("/disenos");
  const diseno = disenos[0];

  if (!diseno) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <EmptyState
          icono={LayoutTemplate}
          titulo="No hay diseños cargados"
          descripcion="Un diseño agrupa los tipos de una serie y las reglas que los calculan. Sin al menos uno, no hay nada que componer ni cotizar."
        />
      </div>
    );
  }

  const tipos = await apiGet<Tipo[]>(`/disenos/${diseno.id}/tipos`);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        migas={[
          { etiqueta: "Inicio", href: RUTA_INICIO },
          { etiqueta: "Plantillas" },
        ]}
        titulo={diseno.nombre}
        descripcion={
          diseno.descripcion ??
          "Cada tipo es una forma de componer esta ventana. Las medidas se eligen al cotizar."
        }
        acciones={
          <DialogoNuevoTipo
            disenoId={diseno.id}
            disenoNombre={diseno.nombre}
            codigoSugerido={siguienteCodigo(diseno.codigo, tipos)}
          />
        }
      />

      <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span>Serie {diseno.serie.nombre}</span>
        <span aria-hidden>·</span>
        <span>{plural(diseno.tipos_count, "tipo", "tipos")}</span>
      </div>

      {tipos.length === 0 ? (
        <EmptyState
          icono={LayoutTemplate}
          titulo="Este diseño todavía no tiene tipos"
          descripcion="Un tipo define cuántos paneles tiene la ventana y cuáles corren. Cree el primero para poder cotizar."
        />
      ) : (
        <Card>
          <CardContent className="flex flex-col gap-2 p-3">
            {tipos.map((tipo) => {
              const fijos = tipo.composicion.filter((panel) => panel === "F").length;
              const corredizas = tipo.composicion.filter(
                (panel) => panel === "D",
              ).length;

              // La tarjeta entera abre el cotizador con este tipo: era su única acción, en un botón de 87×28 px
              return (
                <TarjetaEnlace
                  key={tipo.id}
                  href={`/cotizar/nueva?tipo=${tipo.id}`}
                  className="flex-wrap items-center gap-4"
                >
                  <div className="min-w-40 flex-1">
                    <p className="flex items-center gap-2 font-mono text-sm font-medium">
                      {tipo.codigo}
                      {tipo.publicado ? null : (
                        <Badge
                          variant="outline"
                          className="font-sans text-xs font-normal"
                        >
                          borrador
                        </Badge>
                      )}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {plural(fijos, "panel fijo", "paneles fijos")} ·{" "}
                      {plural(corredizas, "corrediza", "corredizas")}
                    </p>
                  </div>

                  <div className="flex w-full max-w-64 flex-1 flex-col gap-1">
                    <TiraComposicion composicion={tipo.composicion} />
                    <p className="text-muted-foreground text-[11px]">
                      Referencia {numero(tipo.ancho_default)} ×{" "}
                      {numero(tipo.alto_default)} cm
                    </p>
                  </div>

                  <span className="text-primary flex items-center gap-1.5 text-sm font-medium">
                    <Calculator aria-hidden className="size-4" />
                    Cotizar
                  </span>
                </TarjetaEnlace>
              );
            })}
          </CardContent>
        </Card>
      )}

      <p className="text-muted-foreground text-xs">
        En los esquemas, <strong>F</strong> es un panel fijo —no se mueve— y{" "}
        <strong>D</strong> una hoja corrediza, la que se desliza para abrir.
      </p>
    </div>
  );
}

/** Propone el siguiente código libre de la serie: PE-NOVA-T08, T09… */
function siguienteCodigo(codigoDiseno: string, tipos: Tipo[]): string {
  const numeros = tipos
    .map((tipo) => /T(\d+)$/.exec(tipo.codigo)?.[1])
    .filter((valor): valor is string => valor !== undefined)
    .map(Number);

  const siguiente = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;

  return `${codigoDiseno}-T${String(siguiente).padStart(2, "0")}`;
}
