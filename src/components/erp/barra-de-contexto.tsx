import { Calculator } from "lucide-react";
import { Fragment, type ReactNode } from "react";

import { Enlace } from "@/components/comunes/enlace";
import { MenuDeUsuario } from "@/components/erp/menu-de-usuario";
import { Button } from "@/components/ui/button";
import { AltaProyecto } from "@/features/proyectos/components/alta-proyecto";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";
import { cn } from "@/lib/utils";

/** Un tramo de «dónde está»: sin `href`, es donde se está y se pinta como texto */
export type TramoDeRuta = { etiqueta: string; href?: string; codigo?: string };

/**
 * La barra de contexto del escritorio (SEC.9a, decisión 76; `03-sistema-de-diseno/componentes-del-armazon`): **dónde
 * se está** —«Proyectos / PRY-2026-007 Ventana de sala»—, **en qué estado** —la ranura `estado`, donde el dashboard de
 * referencia pone su «Connect»— y, a la derecha y siempre igual, lo que se hace desde cualquier sitio: cotizar,
 * registrar un proyecto, el entorno y la persona.
 *
 * Mide 44 px y se pega arriba; lo que también se pega suma `--alto-barra-contexto`. Sustituye a las migas de cada
 * página (`INV-E07`). En el móvil no se pinta: allí navega `ErpBarraMovil` y la cabecera de la página lleva «volver».
 * Se había quitado una barra superior que decía un nombre y un rol que no cambian; esta dice lo que cambia.
 *
 * Sin buscador todavía: una caja que no busca promete algo que no existe. Llega con la paleta (Ctrl K).
 */
export async function BarraDeContexto({ ruta, estado }: { ruta: TramoDeRuta[]; estado?: ReactNode }) {
  const usuario = await exigirUsuario();

  return (
    <header className="bg-card sticky top-0 z-20 hidden h-11 shrink-0 items-center gap-3 border-b px-4 md:flex print:hidden">
      <nav aria-label="Dónde está" className="flex min-w-0 items-center gap-1.5 text-sm">
        {ruta.map((tramo, i) => {
          const actual = i === ruta.length - 1;
          const contenido = (
            <>
              {tramo.codigo ? <span className="text-muted-foreground font-mono text-xs">{tramo.codigo}</span> : null}
              <span className="truncate">{tramo.etiqueta}</span>
            </>
          );

          return (
            <Fragment key={`${tramo.etiqueta}-${i}`}>
              {i > 0 ? (
                <span aria-hidden className="text-muted-foreground/60">
                  /
                </span>
              ) : null}
              {tramo.href && !actual ? (
                <Enlace
                  href={tramo.href}
                  className="text-muted-foreground hover:text-foreground inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap"
                >
                  {contenido}
                </Enlace>
              ) : (
                <span
                  aria-current={actual ? "page" : undefined}
                  className={cn(
                    "inline-flex min-w-0 items-center gap-1.5",
                    actual ? "text-foreground font-semibold" : "text-muted-foreground",
                  )}
                >
                  {contenido}
                </span>
              )}
            </Fragment>
          );
        })}
      </nav>

      {estado}

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {puede(usuario, "calculo:ejecutar") ? (
          <Button asChild variant="outline">
            <Enlace href="/cotizar/nueva">
              <Calculator className="size-4" />
              Cotizar
            </Enlace>
          </Button>
        ) : null}
        {puede(usuario, "proyectos:crear") ? <AltaProyecto variante="outline" disparador="barra" /> : null}
        {process.env.NODE_ENV !== "production" ? (
          // Que nadie confunda la base de pruebas con la del taller
          <span className="border-warning/40 bg-warning/10 text-warning-fuerte rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase">
            Desarrollo
          </span>
        ) : null}
        <MenuDeUsuario usuario={usuario} />
      </div>
    </header>
  );
}
