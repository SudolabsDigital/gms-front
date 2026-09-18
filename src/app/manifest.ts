import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GMS Integra — Ventanas y Mamparas de Aluminio",
    short_name: "GMS Integra",
    description:
      "Diseño, fabricación e instalación de mamparas y ventanas de aluminio en Huancayo y el Valle del Mantaro.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    // LITERAL A PROPOSITO, el unico del portal fuera de globals.css.
    // Lo lee el sistema operativo al instalar la PWA, no el navegador: aqui `var(--primary)`
    // no se resuelve. Si cambia el azul de marca, se cambia tambien esta linea.
    theme_color: "#004aad",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
