import "server-only";

import { NextResponse } from "next/server";

import { BackendSinConfigurar } from "@/lib/env";

/**
 * La respuesta del BFF cuando no pudo hablar con Laravel, con la forma del contrato
 * `{ error, detalles[] }`.
 *
 * Distingue las dos causas porque se arreglan en sitios distintos: «sin configurar» es un
 * despliegue incompleto —falta `BACKEND_URL`— y «no disponible» es un servidor caído. Antes las
 * dos salían como la segunda, y la primera se habría buscado donde no estaba (`G-13`).
 */
export function respuestaSinBackend(error: unknown): NextResponse {
  const sinConfigurar = error instanceof BackendSinConfigurar;

  const codigo = sinConfigurar ? "BACKEND_SIN_CONFIGURAR" : "BACKEND_NO_DISPONIBLE";
  const mensaje = sinConfigurar
    ? "El sistema no tiene configurada la conexión con el servidor. Avise al administrador."
    : "No se pudo contactar con el servidor. Inténtelo en unos segundos.";

  if (sinConfigurar) {
    // Lo lee quien despliega, no el usuario: el log de Cloud Run es donde se busca
    console.error("[BFF] BACKEND_URL no está definida: el ERP no puede hablar con Laravel.");
  }

  return NextResponse.json(
    { error: codigo, detalles: [{ campo: null, codigo, mensaje }] },
    { status: 503 },
  );
}
