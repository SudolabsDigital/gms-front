"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

import logo from "@/assets/gms-logo.webp";
import { navegacionPara } from "@/components/erp/navegacion";
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
 * Aquí abajo vive también la identidad del usuario. Antes ocupaba una barra superior de
 * 56px de alto a lo ancho de toda la pantalla para decir un nombre y un rol que no
 * cambian nunca. Ese espacio pasó al plano, que sí lo aprovecha.
 */
export function ErpSidebar({ usuario }: { usuario: Usuario }) {
  const pathname = usePathname();
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);
  const entradas = navegacionPara(usuario);

  async function cerrarSesion() {
    setSaliendo(true);

    await fetch("/api/auth/logout", { method: "POST" });

    router.replace("/login");
    router.refresh();
  }

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
        <Link
          href="/"
          className="flex h-14 shrink-0 items-center gap-2.5 border-b px-[15px]"
        >
          <Image src={logo} alt="" width={26} height={26} className="shrink-0" />
          <span className={cn("truncate text-sm font-semibold tracking-tight", alDesplegar)}>
            GMS Integra
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1 p-2">
          {entradas.map((entrada) => {
            const activo =
              pathname === entrada.href || pathname.startsWith(`${entrada.href}/`);

            // 44px de alto: área táctil mínima cómoda también en tablet de taller
            const base =
              "flex min-h-11 items-center gap-3 rounded-md px-[7px] text-sm transition-colors";

            const etiqueta = (
              <span className={cn("truncate", alDesplegar)}>{entrada.titulo}</span>
            );

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
                  activo
                    ? "bg-primary/8 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <entrada.icono className="size-4 shrink-0" />
                {etiqueta}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2.5 border-t px-[11px] py-3">
          <span
            aria-hidden
            className="bg-primary/8 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
          >
            {usuario.nombre.charAt(0).toUpperCase()}
          </span>

          <span className={cn("min-w-0 flex-1", alDesplegar)}>
            <span className="block truncate text-sm leading-tight font-medium">
              {usuario.nombre}
            </span>
            <span className="text-muted-foreground block truncate text-[11px] leading-tight">
              {usuario.rol_etiqueta}
            </span>
          </span>

          <button
            type="button"
            onClick={cerrarSesion}
            disabled={saliendo}
            title="Cerrar sesión"
            className={cn(
              "text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 rounded-md p-2 transition-colors disabled:opacity-50",
              alDesplegar,
            )}
          >
            <LogOut className="size-4" />
            <span className="sr-only">
              {saliendo ? "Saliendo…" : "Cerrar sesión"}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
