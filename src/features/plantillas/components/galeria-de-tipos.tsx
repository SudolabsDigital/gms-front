import type { ReactNode } from "react";
import { Check } from "lucide-react";

import { TarjetaEnlace } from "@/components/comunes/tarjeta-enlace";
import { Badge } from "@/components/ui/badge";
import type { Tipo } from "@/features/cotizar/types";
import { TiraComposicion } from "@/features/plantillas/components/tira-composicion";
import { numero, plural } from "@/lib/formato";
import { cn } from "@/lib/utils";

export type TipoDeGaleria = Pick<Tipo, "id" | "codigo" | "nombre" | "composicion" | "ancho_default" | "alto_default" | "publicado">;

export type GrupoDeTipos = {
  clave: string;
  /** Sin título, la galería es una sola rejilla: con una serie y un diseño no hace falta decir de quién son */
  titulo?: string;
  detalle?: ReactNode;
  acciones?: ReactNode;
  tipos: TipoDeGaleria[];
};

/**
 * Los tipos por su dibujo (`series/52-brief-espacio-de-la-serie` § 4, decisión 70): manda la composición, y el código y
 * el nombre técnico van debajo. **Un componente, dos modos**, según las props:
 *
 * - **navegar** (`enlace`): la tarjeta entera es el enlace —la pestaña Tipos de la serie—; un tipo sin enlace (un
 *   borrador, que no se cotiza) se ve igual, sin serlo.
 * - **elegir** (`elegido` + `alElegir`): la tarjeta es un botón y la elegida va marcada —el selector del cotizador—.
 *
 * El orden es el de la ventana, no el del código: por número de paneles y, a igual número, por código. Así la serie y el
 * cotizador enseñan lo mismo en el mismo sitio. No lleva `"use client"`: en el servidor pinta enlaces, y dentro de un
 * componente de cliente, botones.
 */
export function GaleriaDeTipos({
  grupos,
  enlace,
  elegido,
  alElegir,
  densa = false,
}: {
  grupos: GrupoDeTipos[];
  enlace?: (tipo: TipoDeGaleria) => string | null;
  elegido?: string;
  alElegir?: (id: string) => void;
  /** Dos columnas desde el móvil: el selector, en una hoja o un diálogo */
  densa?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      {grupos.map((grupo) => (
        <section key={grupo.clave} aria-labelledby={grupo.titulo ? `tipos-${grupo.clave}` : undefined} className="flex flex-col gap-3">
          {grupo.titulo || grupo.acciones ? (
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                {grupo.titulo ? (
                  <h2 id={`tipos-${grupo.clave}`} className="font-semibold">
                    {grupo.titulo}
                  </h2>
                ) : null}
                {grupo.detalle ? <p className="text-muted-foreground text-sm">{grupo.detalle}</p> : null}
              </div>
              {grupo.acciones}
            </div>
          ) : null}

          {/* Columnas siempre declaradas (`minmax(0, 1fr)`): sin ellas la pista mide el nombre más largo y la tarjeta se sale */}
          <ul className={cn("grid gap-3", densa ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}>
            {porPaneles(grupo.tipos).map((tipo) => (
              <li key={tipo.id} className="flex min-w-0">
                <Tarjeta
                  tipo={tipo}
                  enlace={enlace?.(tipo) ?? null}
                  elegido={elegido === tipo.id}
                  alElegir={alElegir}
                  conNombre={!densa}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** «2 fijos · 1 corrediza»: cómo se piensa la ventana; sin la parte que no tiene («2 corredizas») */
export function recuentoDePaneles(composicion: TipoDeGaleria["composicion"]): string {
  const fijos = composicion.filter((panel) => panel === "F").length;
  const corredizas = composicion.length - fijos;

  return [fijos > 0 ? plural(fijos, "fijo", "fijos") : null, corredizas > 0 ? plural(corredizas, "corrediza", "corredizas") : null]
    .filter(Boolean)
    .join(" · ");
}

function porPaneles(tipos: TipoDeGaleria[]): TipoDeGaleria[] {
  return [...tipos].sort((a, b) => a.composicion.length - b.composicion.length || a.codigo.localeCompare(b.codigo));
}

function Tarjeta({
  tipo,
  enlace,
  elegido,
  alElegir,
  conNombre,
}: {
  tipo: TipoDeGaleria;
  enlace: string | null;
  elegido: boolean;
  alElegir?: (id: string) => void;
  conNombre: boolean;
}) {
  const contenido = <ContenidoDelTipo tipo={tipo} elegido={elegido} conNombre={conNombre} />;
  const disposicion = "flex w-full min-w-0 flex-col items-stretch gap-2";

  if (alElegir) {
    return (
      <button
        type="button"
        aria-pressed={elegido}
        onClick={() => alElegir(tipo.id)}
        className={cn(
          disposicion,
          "min-h-11 rounded-md border p-3 text-left transition-colors",
          "hover:bg-muted/40 active:bg-muted/60 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
          elegido && "border-primary bg-primary/5 ring-primary ring-1",
        )}
      >
        {contenido}
      </button>
    );
  }

  if (enlace) {
    return (
      <TarjetaEnlace href={enlace} className={disposicion}>
        {contenido}
      </TarjetaEnlace>
    );
  }

  return <div className={cn(disposicion, "rounded-md border border-dashed p-3")}>{contenido}</div>;
}

/** El nombre técnico es dato secundario (brief 52, § 9): una línea, entero al pasar el puntero; en el selector, fuera */
function ContenidoDelTipo({ tipo, elegido, conNombre }: { tipo: TipoDeGaleria; elegido: boolean; conNombre: boolean }) {
  return (
    <>
      <TiraComposicion composicion={tipo.composicion} />
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{recuentoDePaneles(tipo.composicion)}</p>
        {elegido ? <Check aria-hidden className="text-primary size-4 shrink-0" /> : null}
        {!tipo.publicado ? (
          <Badge variant="outline" className="text-xs font-normal">
            borrador
          </Badge>
        ) : null}
      </div>
      {/* Dos piezas que bajan enteras de línea: en una tarjeta estrecha el código no se parte por su guion */}
      <p className="text-muted-foreground flex flex-wrap gap-x-2 text-xs">
        {tipo.ancho_default && tipo.alto_default ? (
          <span>
            Referencia {numero(tipo.ancho_default)} × {numero(tipo.alto_default)} cm
          </span>
        ) : null}
        <span className="font-mono whitespace-nowrap">{tipo.codigo}</span>
      </p>
      {conNombre && tipo.nombre ? (
        <p className="text-muted-foreground truncate text-xs" title={tipo.nombre}>
          {tipo.nombre}
        </p>
      ) : null}
    </>
  );
}
