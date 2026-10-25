import { z } from "zod";

/**
 * Variables de entorno del servidor, validadas.
 *
 * Módulo de uso en SERVIDOR (Route Handlers, Server Components, `instrumentation.ts`).
 *
 * `FRONTEND_URL` —la URL pública de este front— lleva el mismo nombre que en el `.env` de Laravel y
 * ninguno ligado a una plataforma: se llamaba `NEXT_PUBLIC_APP_URL` y caía a `VERCEL_URL`, y el
 * sistema va a Firebase y Cloud Run (renombrada el 2026-09-21). **Hoy no la lee nadie**: el dominio
 * canónico sale de `site-config.ts`. Se conserva validada para cuando haga falta una URL absoluta
 * propia en servidor (`G-41`).
 *
 * `BACKEND_URL` NO tiene red en producción (`G-13`). Hasta el 2026-09-21 caía a
 * `http://127.0.0.1:8000`, y el modo de fallo era silencioso: medido con `next start` sin la
 * variable, el login respondía como si todo estuviera bien porque en ESTE equipo hay un Laravel en
 * ese puerto. En Cloud Run no lo hay, y el usuario habría visto «servidor no disponible» sin pista
 * de que lo que faltaba era una variable.
 *
 * Tampoco tumba el servidor al arrancar, y es deliberado: el portal público y el ERP son la MISMA
 * aplicación, así que un ERP sin configurar no puede llevarse el portal por delante. Se exige al
 * USARLA —`urlDelBackend()`—, que falla con un error propio, y `instrumentation.ts` lo grita en el
 * log al arrancar. En desarrollo sigue cayendo a localhost por comodidad.
 */

const esProduccion = process.env.NODE_ENV === "production";

const getFrontendUrl = () => process.env.FRONTEND_URL || "http://localhost:3000";

const getBackendUrl = () => {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL;
  return esProduccion ? null : "http://127.0.0.1:8000";
};

const envSchema = z.object({
  // Laravel, visto desde el servidor de Next. El navegador nunca lo ve: habla con `/api/*`,
  // que reenvía `app/api/[...slug]/route.ts` (el BFF), no un `rewrite`.
  BACKEND_URL: z.url().nullable(),
  // URL pública de este front, vista desde el servidor. Sin consumidor hoy (ver arriba).
  FRONTEND_URL: z.url(),
});

const parsed = envSchema.safeParse({
  BACKEND_URL: getBackendUrl(),
  FRONTEND_URL: getFrontendUrl(),
});

if (!parsed.success) {
  console.error(
    "[ERROR] Variables de entorno inválidas:\n",
    z.flattenError(parsed.error).fieldErrors,
  );
  throw new Error(
    "Configuración de entorno inválida. Copia .env.example a .env.local y completa los valores.",
  );
}

export const env = parsed.data;

/** El backend no está configurado: es un fallo de despliegue, no del servidor ni del usuario. */
export class BackendSinConfigurar extends Error {
  constructor() {
    super("BACKEND_URL no está definida en este entorno.");
    this.name = "BackendSinConfigurar";
  }
}

/** La URL absoluta de una ruta de Laravel. Lanza `BackendSinConfigurar` si falta la variable. */
export function urlDelBackend(ruta: string): string {
  if (env.BACKEND_URL === null) {
    throw new BackendSinConfigurar();
  }

  return `${env.BACKEND_URL}${ruta}`;
}
