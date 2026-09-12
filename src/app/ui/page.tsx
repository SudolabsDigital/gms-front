import type { Metadata } from "next";

import { siteConfig } from "@/config/site-config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

/**
 * Muestrario interno del sistema de diseño. No es contenido del portal.
 *
 * Sin `metadata` propia heredaba la del layout raíz, así que se servía con el MISMO título de la
 * home y `canonical` apuntando a `/`: le decía a Google que esta página ES la portada. Y sin estar
 * en `robots.ts` ni en el sitemap, quedaba indexable compitiendo con el contenido real.
 * `noindex` lo saca del índice; el canonical propio evita que reclame la identidad de otra ruta.
 * NO se añade a `robots.ts`: una ruta bloqueada por `robots.txt` no se rastrea, y sin rastreo
 * Google nunca llega a leer el `noindex`.
 */
export const metadata: Metadata = {
  title: "UI Kit — Sistema de Diseño",
  description:
    "Muestrario interno de tokens, colores y componentes del sistema de diseño de GMS Integra.",
  alternates: { canonical: `${siteConfig.url}/ui` },
  robots: { index: false, follow: false },
};

const dots = [
  ["primary", "bg-primary"],
  ["brand", "bg-brand"],
  ["brand-linea-soft", "bg-brand-linea-soft"],
  ["success", "bg-success"],
  ["warning", "bg-warning"],
  ["destructive", "bg-destructive"],
] as const;

export default function UiKitPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 p-6 sm:p-10">
      <header className="flex flex-col gap-3">
        <Badge variant="outline" className="w-fit">
          Vidrio · Aluminio
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          GMS <span className="text-gradient-brand">Integra</span> — UI Kit
        </h1>
        <p className="text-muted-foreground max-w-xl text-balance">
          Librería de componentes sobre shadcn/ui (Radix) adaptada a la marca.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Acciones
        </h2>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="brand">Cotizar</Button>
          <Button>Guardar</Button>
          <Button variant="outline">Cancelar</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Eliminar</Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card shadow-glass overflow-hidden rounded-lg border">
          <div className="bg-gradient-brand h-1 w-full" />
          <div className="flex flex-col gap-1 p-5">
            <p className="text-muted-foreground text-sm">Proyectos activos</p>
            <p className="text-gradient-brand text-4xl font-semibold">128</p>
            <p className="text-muted-foreground text-xs">+12 esta semana</p>
          </div>
        </div>

        <Card className="shadow-glass sm:col-span-2">
          <CardHeader>
            <CardTitle>Nuevo producto</CardTitle>
            <CardDescription>Mampara o ventana en aluminio</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="p-nombre">Nombre</Label>
              <Input id="p-nombre" placeholder="Mampara templada 8mm" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-medida">Medida (m)</Label>
              <Input id="p-medida" placeholder="1.20 x 2.00" />
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button variant="brand">Crear</Button>
            <Button variant="outline">Descartar</Button>
          </CardFooter>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Vidrio esmerilado
        </h2>
        <div className="bg-grid relative flex min-h-48 items-center justify-center rounded-lg border p-8">
          <div className="glass shadow-glass flex flex-col items-center gap-3 rounded-lg border p-6 text-center">
            <div className="flex items-center justify-center gap-1.5">
              {dots.map(([name, cls]) => (
                <span key={name} className={`size-5 rounded-sm ${cls}`} title={name} />
              ))}
            </div>
            <div>
              <p className="text-sm font-medium">Panel translúcido sobre grilla</p>
              <p className="text-muted-foreground text-xs">
                backdrop-blur = mampara esmerilada
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-2">
        <Badge>Activo</Badge>
        <Badge variant="secondary">Borrador</Badge>
        <Badge variant="outline">En taller</Badge>
        <Badge variant="destructive">Cancelado</Badge>
      </section>
    </main>
  );
}
