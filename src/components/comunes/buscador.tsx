import { Search } from "lucide-react";

import { FocoEnEscritorio } from "@/components/comunes/foco-en-escritorio";
import { Input } from "@/components/ui/input";

/**
 * El buscador de una lista (sistema · `listas-y-filtros`): un formulario `GET` que manda `buscar` y conserva los
 * filtros vivos, 44 px en el móvil y 36 en el escritorio. En el escritorio toma el foco al entrar; en el móvil no,
 * porque abriría el teclado encima de la lista que se vino a mirar (R33). Estaba copiado en Proyectos, Clientes y
 * Materiales.
 */
export function Buscador({
  accion,
  id,
  etiqueta,
  placeholder,
  valor,
  conservar = {},
}: {
  /** La ruta de la lista: `/clientes` */
  accion: string;
  id: string;
  /** El nombre accesible del campo: «Buscar clientes» */
  etiqueta: string;
  placeholder: string;
  valor?: string;
  /** Los filtros que la búsqueda no debe perder; un valor vacío no viaja */
  conservar?: Record<string, string | null | undefined>;
}) {
  return (
    <>
      <form action={accion} className="relative max-w-md" role="search">
        {Object.entries(conservar).map(([nombre, valorOculto]) =>
          valorOculto ? <input key={nombre} type="hidden" name={nombre} value={valorOculto} /> : null,
        )}
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          id={id}
          type="search"
          name="buscar"
          defaultValue={valor}
          placeholder={placeholder}
          aria-label={etiqueta}
          className="h-11 pl-9 md:h-9"
        />
      </form>
      <FocoEnEscritorio id={id} />
    </>
  );
}
