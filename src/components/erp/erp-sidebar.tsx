"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import logo from "@/assets/gms-logo.webp";
import { EnlacePendiente } from "@/components/comunes/enlace-pendiente";
import { navegacionPorGrupos } from "@/components/erp/navegacion";
import { cn } from "@/lib/utils";
import type { Usuario } from "@/lib/session";

/**
 * Barra lateral en modo riel.
 *
 * Ocupa 56px —solo los iconos— y se despliega a 224px al acercar el puntero o al entrar
 * con el tabulador. Se recuperan así 168px de ancho para el contenido, que en las tablas
 * de despiece y compra es la diferencia entre leerlas y tener que desplazarlas.
 *
 * El panel desplegado se SUPERPONE, no empuja: si el contenido se recolocara cada vez
 * que el puntero roza el borde izquierdo, la página temblaría al pasar por encima. El
 * `<aside>` exterior se queda en el flujo reservando los 56px y el riel va fijo encima.
 *
 * Las entradas van **por grupos** separados por un filete (SEC.9a, `arquitectura-del-erp` § 2): Hoy · Operación ·
 * Catálogo · Empresa. Sin rótulo a la vista, como el menú de referencia: el nombre del grupo lo lleva su
 * `aria-label`. La persona y «Cerrar sesión» subieron a la barra de contexto (`MenuDeUsuario`); el logo mide lo que
 * ella, 44 px, para que las dos líneas cuadren.
 */
export function ErpSidebar({ usuario }: { usuario: Usuario }) {
  const pathname = usePathname();
  const grupos = navegacionPorGrupos(usuario);

  /** Se revela junto con el riel: transparente mientras está plegado. */
  const alDesplegar =
    "opacity-0 transition-opacity duration-200 group-hover/riel:opacity-100 group-focus-within/riel:opacity-100 motion-reduce:transition-none";

  return (
    <aside className="hidden w-14 shrink-0 md:block">
      <div
        className={cn(
          "group/riel bg-background fixed inset-y-0 left-0 z-30 flex w-14 flex-col overflow-hidden border-r",
          "transition-[width] duration-200 ease-out motion-reduce:transition-none",
          "hover:w-56 hover:shadow-lg focus-within:w-56 focus-within:shadow-lg",
        )}
      >
        <Link href="/" className="flex h-11 shrink-0 items-center gap-2.5 border-b px-[15px]">
          <Image src={logo} alt="" width={26} height={26} className="shrink-0" />
          <span className={cn("truncate text-sm font-semibold tracking-tight", alDesplegar)}>
            GMS Integra
          </span>
        </Link>

        <nav className="flex flex-1 flex-col overflow-y-auto">
          {grupos.map(({ grupo, entradas }) => (
            <div key={grupo} role="group" aria-label={grupo} className="flex flex-col gap-1 border-b p-2 last:border-b-0">
              {entradas.map((entrada) => {
                const activo = pathname === entrada.href || pathname.startsWith(`${entrada.href}/`);

                // 44px de alto: área táctil mínima cómoda también en tablet de taller
                const base = "flex min-h-11 items-center gap-3 rounded-md px-[7px] text-sm transition-colors";

                const etiqueta = <span className={cn("truncate", alDesplegar)}>{entrada.titulo}</span>;

                if (!entrada.disponible) {
                  return (
                    <div
                      key={entrada.href}
                      aria-disabled
                      className={cn(base, "text-muted-foreground/45 cursor-not-allowed")}
                    >
                      <entrada.icono className="size-4 shrink-0" />
                      {etiqueta}
                      <span
                        className={cn(
                          "bg-muted ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap",
                          alDesplegar,
                        )}
                      >
                        Pronto
                      </span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={entrada.href}
                    href={entrada.href}
                    aria-current={activo ? "page" : undefined}
                    className={cn(
                      base,
                      "relative overflow-hidden",
                      activo
                        ? "bg-primary/8 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <entrada.icono className="size-4 shrink-0" />
                    {etiqueta}
                    <EnlacePendiente />
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
