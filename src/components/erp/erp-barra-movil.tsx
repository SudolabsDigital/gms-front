"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu } from "lucide-react";

import logo from "@/assets/gms-logo.webp";
import { navegacionPara } from "@/components/erp/navegacion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Usuario } from "@/lib/session";

/**
 * La navegación en pantalla pequeña, y solo ahí.
 *
 * Por encima de `md` esta barra no existe: el riel lateral lleva la navegación y la
 * identidad, y el alto de la ventana queda entero para el contenido. Por debajo, el riel
 * está oculto y este botón es la ÚNICA forma de cambiar de sección sin escribir la URL,
 * así que no se oculta bajo ninguna condición.
 */
export function ErpBarraMovil({ usuario }: { usuario: Usuario }) {
  const pathname = usePathname();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const entradas = navegacionPara(usuario);

  async function cerrarSesion() {
    setSaliendo(true);

    await fetch("/api/auth/logout", { method: "POST" });

    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="bg-background/85 sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b px-3 backdrop-blur md:hidden">
      <Sheet open={abierto} onOpenChange={setAbierto}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="size-5" />
            <span className="sr-only">Abrir el menú</span>
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b px-4 py-4">
            <SheetTitle className="flex items-center gap-2.5 text-base">
              <Image src={logo} alt="" width={24} height={24} />
              GMS Integra
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col gap-1 p-3">
            {entradas.map((entrada) => {
              const activo =
                pathname === entrada.href || pathname.startsWith(`${entrada.href}/`);

              const base =
                "flex min-h-12 items-start gap-3 rounded-md px-3 py-2 text-sm transition-colors";

              const cuerpo = (
                <>
                  <entrada.icono className="mt-0.5 size-4 shrink-0" />
                  <span className="min-w-0">
                    <span className="block leading-tight font-medium">
                      {entrada.titulo}
                    </span>
                    <span className="text-muted-foreground block text-xs leading-tight">
                      {entrada.descripcion}
                    </span>
                  </span>
                </>
              );

              if (!entrada.disponible) {
                return (
                  <div
                    key={entrada.href}
                    aria-disabled
                    className={cn(base, "text-muted-foreground/45")}
                  >
                    {cuerpo}
                    <span className="bg-muted ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px]">
                      Pronto
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={entrada.href}
                  href={entrada.href}
                  onClick={() => setAbierto(false)}
                  aria-current={activo ? "page" : undefined}
                  className={cn(
                    base,
                    activo ? "bg-primary/8 text-primary" : "text-foreground hover:bg-muted",
                  )}
                >
                  {cuerpo}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex items-center gap-2.5 border-t px-4 py-3">
            <span
              aria-hidden
              className="bg-primary/8 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            >
              {usuario.nombre.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm leading-tight font-medium">
                {usuario.nombre}
              </span>
              <span className="text-muted-foreground block text-[11px] leading-tight">
                {usuario.rol_etiqueta}
              </span>
            </span>
          </div>
        </SheetContent>
      </Sheet>

      <Image src={logo} alt="" width={24} height={24} />
      <span className="text-sm font-semibold tracking-tight">GMS Integra</span>

      <Button
        variant="ghost"
        size="icon"
        onClick={cerrarSesion}
        disabled={saliendo}
        className="text-muted-foreground ml-auto"
      >
        <LogOut className="size-4" />
        <span className="sr-only">{saliendo ? "Saliendo…" : "Cerrar sesión"}</span>
      </Button>
    </header>
  );
}
