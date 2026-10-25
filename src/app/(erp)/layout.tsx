import { ErpBarraMovil } from "@/components/erp/erp-barra-movil";
import { ErpSidebar } from "@/components/erp/erp-sidebar";
import { ErpSinServidor } from "@/components/erp/aviso-sin-servidor";
import { estadoDeSesion, exigirUsuario } from "@/lib/session";

/**
 * Guard REAL del ERP.
 *
 * El proxy solo comprobó que existiera una cookie. Aquí se pregunta al backend quién es
 * el usuario: si el token caducó, se revocó o la cuenta se desactivó, `exigirUsuario`
 * borra la cookie y lleva al login; si el backend no responde, el propio layout pinta el
 * aviso de «Reintentar» (`error.tsx` no atrapa lo que falla en su layout). También es donde
 * se conocen los PERMISOS, que el proxy no puede saber.
 */
export default async function ErpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sin servidor no se sabe quién es el usuario, pero la sesión sigue siendo buena: ni se
  // borra ni se redirige. Se avisa aquí porque `error.tsx` no atrapa lo que falla en su layout
  if ((await estadoDeSesion()).estado === "sin_backend") {
    return (
      <div className="bg-background flex min-h-svh px-4">
        <ErpSinServidor />
      </div>
    );
  }

  const usuario = await exigirUsuario();

  /*
   * Fondo OPACO, a diferencia de la landing.
   *
   * El layout raíz pinta seis manchas de gradiente animadas y fijas. En la portada son
   * la identidad de la marca; debajo de una tabla de despiece son movimiento continuo
   * bajo cifras que hay que leer sin equivocarse, y el desenfoque de 130px sobre
   * superficies así de grandes se repinta sin parar en la tablet del taller. El ERP se
   * apoya sobre su propio fondo sólido y las deja fuera.
   */
  /*
   * La barra de contexto no vive aquí: la pone cada página con su `MarcoDeTrabajo` (SEC.9a, decisión 76), porque
   * solo la página sabe dónde se está y en qué estado. Una barra fija que dijera un nombre y un rol que no cambian se
   * quitó hace tiempo para dar el alto al plano; la de ahora dice lo que cambia. Por debajo de `md` —donde no se
   * pinta— navega <ErpBarraMovil/>. El relleno del contenido también lo pone el marco: la barra va de borde a borde.
   */
  // En papel solo sale la página: la navegación no se imprime (lista de corte, tajada D)
  return (
    <div className="bg-background flex min-h-svh">
      <div className="contents print:hidden">
        <ErpSidebar usuario={usuario} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="contents print:hidden">
          <ErpBarraMovil usuario={usuario} />
        </div>
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
