import type { Metadata } from "next";
import { LayoutTemplate } from "lucide-react";

import { EmptyState } from "@/components/comunes/empty-state";
import type { Tipo } from "@/features/cotizar/types";
import { DialogoNuevoTipo } from "@/features/plantillas/components/dialogo-nuevo-tipo";
import { GaleriaDeTipos, type GrupoDeTipos } from "@/features/plantillas/components/galeria-de-tipos";
import { leerEspacio } from "@/features/series/datos";
import type { DisenoDeSerie } from "@/features/series/types";
import { apiGet } from "@/lib/api-server";
import { plural } from "@/lib/formato";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Tipos · Series · GMS Integra",
};

/**
 * La pestaña Tipos (`series/52-brief-espacio-de-la-serie` § 4): los tipos de cada diseño por su dibujo, y «Nuevo tipo»
 * junto al suyo (decisión 73). La tarjeta de un tipo publicado abre el cotizador con él; un borrador no se cotiza y se
 * ve sin enlace.
 */
export default async function TiposDeLaSeriePage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const [serie, usuario] = await Promise.all([leerEspacio(codigo), exigirUsuario()]);

  if (serie.disenos.length === 0) {
    return (
      <EmptyState
        icono={LayoutTemplate}
        titulo="Esta serie todavía no tiene diseños"
        descripcion="Un diseño agrupa los tipos de una serie y lo que los calcula. Sin al menos uno, no hay nada que componer ni cotizar."
      />
    );
  }

  const tiposPorDiseno = await Promise.all(serie.disenos.map((d) => apiGet<Tipo[]>(`/disenos/${d.id}/tipos`)));
  const gestiona = puede(usuario, "plantillas:gestionar");
  const cotizables = new Set<string>();

  const grupos: GrupoDeTipos[] = serie.disenos.map((diseno, i) => {
    const tipos = tiposPorDiseno[i];
    // Sin versión publicada, su cálculo no existe todavía: sus tipos se ven, pero no se cotizan
    if (diseno.version) tipos.filter((t) => t.publicado).forEach((t) => cotizables.add(t.id));

    return {
      clave: diseno.codigo,
      titulo: diseno.nombre,
      detalle: detalleDelDiseno(diseno, tipos.length),
      acciones: gestiona ? (
        <DialogoNuevoTipo
          disenoId={diseno.id}
          disenoNombre={diseno.nombre}
          regla={diseno.composicion}
          codigoSugerido={siguienteCodigo(diseno.codigo, tipos)}
        />
      ) : null,
      tipos,
    };
  });

  return (
    <>
      <GaleriaDeTipos grupos={grupos} enlace={(tipo) => (cotizables.has(tipo.id) ? `/cotizar/nueva?tipo=${tipo.id}` : null)} />
      <p className="text-muted-foreground text-xs">
        En los dibujos, <strong>F</strong> es un panel fijo —no se mueve— y <strong>D</strong> una hoja corrediza, la que se
        desliza para abrir.
      </p>
    </>
  );
}

function detalleDelDiseno(diseno: DisenoDeSerie, tipos: number): string {
  if (tipos === 0) return "Todavía no tiene tipos: un tipo dice cuántos paneles tiene la ventana y cuáles corren.";
  const version = diseno.version ? `versión ${diseno.version.numero} publicada` : "sin versión publicada: aún no se cotiza";

  return `${plural(tipos, "tipo", "tipos")} · ${version}`;
}

/** Propone el siguiente código libre del diseño: PE-NOVA-T08, T09… */
function siguienteCodigo(codigoDiseno: string, tipos: Tipo[]): string {
  const numeros = tipos
    .map((tipo) => /T(\d+)$/.exec(tipo.codigo)?.[1])
    .filter((valor): valor is string => valor !== undefined)
    .map(Number);

  const siguiente = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;

  return `${codigoDiseno}-T${String(siguiente).padStart(2, "0")}`;
}
