import { redirect } from "next/navigation";

/**
 * Plantillas pasó a ser la pestaña Tipos de cada serie (SEC.2, decisión 79). La ruta se queda para que los enlaces
 * guardados y los del historial del navegador no se rompan: lleva a la portada de Series.
 */
export default function PlantillasPage() {
  redirect("/series");
}
