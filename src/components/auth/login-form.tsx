"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { RUTA_INICIO } from "@/components/erp/navegacion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { pedir } from "@/lib/api-cliente";

const schema = z.object({
  email: z.email("Ingrese un correo válido"),
  password: z.string().min(1, "Ingrese su contraseña"),
});

type Credenciales = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const parametros = useSearchParams();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const form = useForm<Credenciales>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(valores: Credenciales) {
    setErrorGeneral(null);

    const respuesta = await pedir("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(valores),
    });

    if (!respuesta.ok) {
      // El cliente ya trae el mensaje adecuado a cada caso: credenciales, límite de intentos
      // o sin conexión
      setErrorGeneral(respuesta.error.detalles[0].mensaje);

      return;
    }

    // Se vuelve a donde el usuario quería ir antes de que el proxy lo desviara
    const destino = parametros.get("continuar") ?? RUTA_INICIO;

    router.replace(destino);
    // Refresca los Server Components para que el layout lea la sesión recién creada
    router.refresh();
  }

  const enviando = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="username"
                  placeholder="usuario@gmsintegra.pe"
                  autoFocus
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {errorGeneral ? (
          <p
            role="alert"
            className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border px-3 py-2 text-sm"
          >
            {errorGeneral}
          </p>
        ) : null}

        <Button type="submit" variant="brand" className="mt-2 w-full" disabled={enviando}>
          {enviando ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Verificando…
            </>
          ) : (
            "Ingresar"
          )}
        </Button>
      </form>
    </Form>
  );
}
