/**
 * El error de un campo, ligado a él: el campo lo nombra en `aria-describedby` y el lector de pantalla lo lee al llegar
 * (recorrido UX.2, V01). Antes el texto rojo se pintaba suelto y solo `aria-invalid` decía que algo iba mal, sin qué.
 */
export const idDelError = (campo: string) => `${campo}-error`;

/** `aria-describedby` del campo: solo mientras hay error, para no leer un elemento que no existe */
export const describeError = (campo: string, error: unknown) => (error ? idDelError(campo) : undefined);

export function ErrorDeCampo({ campo, children }: { campo: string; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p id={idDelError(campo)} className="text-destructive-fuerte text-sm">
      {children}
    </p>
  );
}
