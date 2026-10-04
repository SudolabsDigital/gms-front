"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Usuario } from "@/lib/session";

/**
 * Quién está dentro y la salida, en el extremo derecho de la barra de contexto (SEC.9a). Vivía al pie del riel; en la
 * barra está donde se busca en cualquier sistema y libera el pie del menú. La salida es la de siempre: el proxy de
 * `/api/auth/logout` borra la cookie y se vuelve al login.
 */
export function MenuDeUsuario({ usuario }: { usuario: Usuario }) {
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);

  async function cerrarSesion() {
    setSaliendo(true);

    await fetch("/api/auth/logout", { method: "POST" });

    router.replace("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="bg-primary/8 text-primary focus-visible:ring-ring flex size-8 items-center justify-center rounded-full text-xs font-semibold focus-visible:ring-2 focus-visible:outline-none"
        title={`${usuario.nombre} · ${usuario.rol_etiqueta}`}
      >
        {usuario.nombre.charAt(0).toUpperCase()}
        <span className="sr-only">Menú de {usuario.nombre}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate text-sm font-medium">{usuario.nombre}</span>
          <span className="text-muted-foreground truncate text-xs font-normal">{usuario.rol_etiqueta}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={cerrarSesion} disabled={saliendo}>
          <LogOut className="size-4" />
          {saliendo ? "Saliendo…" : "Cerrar sesión"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
