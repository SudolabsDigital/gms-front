# PLAN_DE_TRABAJO|VERSION:1.1|TYPE:HD-MD|LANG:ES
> 🎯 **Meta Global:** Base del frontend (Next.js 16) del ERP GMS Integra: scaffold, limpieza, sistema de diseño y configuración de entorno.

---

## <SESIÓN 1 — Scaffold + limpieza>
* [x] Task 1: Scaffold Next 16 (App Router + TS + Tailwind + ESLint + src/ + alias @/*) | `gms-front/` | [MEDIO] | ✅
* [x] Task 2: Limpiar boilerplate `page.tsx` (landing demo → placeholder GMS) | `src/app/page.tsx` | [BAJO] | ✅
* [x] Task 3: Ajustar metadata y `lang="es"` | `src/app/layout.tsx` | [BAJO] | ✅
* [x] Task 4: Limpiar `globals.css` (fuente Arial → var(--font-sans)) | `src/app/globals.css` | [BAJO] | ✅
* [x] Task 5: Eliminar SVGs demo de `public/` | `public/*.svg` | [BAJO] | ✅
* [x] Task 6: Reemplazar README de Vercel por README GMS | `README.md` | [BAJO] | ✅
* [x] Task 7: Endurecer `.gitignore` (`*.key`, `!.env.example`) | `.gitignore` | [BAJO] | ✅
* [x] Task 8: VALIDATE — `lint → build` en verde | `gms-front/` | [BAJO] | ✅

## <SESIÓN 2 — Diseño + entorno>
* [x] Task 9: Análisis de color + roles semánticos + neutros/funcionales | `INFO/paleta_colores.md` | [BAJO] | ✅
* [x] Task 10: Definir arquitectura front (blueprint dreamdev → estructura Next) | (documentado) | [BAJO] | ✅
* [x] Task 11: Instalar `zod` (4.4.3) | `package.json` | [BAJO] | ✅
* [x] Task 12: Validación tipada de env con Zod | `src/lib/env.ts` | [MEDIO] | ✅
* [x] Task 13: Rewrites `/api/*` → `BACKEND_URL/api/*` (proxy server-side) | `next.config.ts` | [MEDIO] | ✅
* [x] Task 14: `.env.example` (versionado) + `.env.local` (dev, ignorado) | raíz | [BAJO] | ✅
* [x] Task 15: VALIDATE env — lint + build + auditoría gitignore | `gms-front/` | [BAJO] | ✅

## <SESIÓN 3 — Sistema de diseño (Tailwind v4)>
* [x] Task 16: Tokens de marca (`@theme`) + semánticos (`@theme inline`) | `src/app/globals.css` | [MEDIO] | ✅
* [x] Task 17: Tema claro/oscuro (system + override manual `data-theme`) | `src/app/globals.css` | [BAJO] | ✅
* [x] Task 18: Showcase de paleta en Home (smoke test visual) | `src/app/page.tsx` | [BAJO] | ✅
* [x] Task 19: VALIDATE — lint + build en verde | `gms-front/` | [BAJO] | ✅

## <SESIÓN 4 — Design system (shadcn/ui + dirección vidrio-aluminio)>
* [x] Task 20: `shadcn init` (radix-nova) + reconciliar tokens de marca | `components.json`, `globals.css` | [ALTO] | ✅
* [x] Task 21: Agregar 28+ componentes P0+P1 (Radix + CVA) + `form.tsx` (RHF) | `src/components/ui/*` | [MEDIO] | ✅
* [x] Task 22: Providers (next-themes + Tooltip + Sonner) | `layout.tsx`, `providers/theme-provider.tsx` | [MEDIO] | ✅
* [x] Task 23: Dirección **vidrio-aluminio**: radio 6px, neutros gris-frío, canvas blanco, tokens gradiente, `@utility` glass/gradient/grid, overlays frosted, variante Button `brand` | `globals.css`, `button.tsx` | [MEDIO] | ✅

## <SESIÓN 5 — Landing page (home)>
* [x] Task 24: Header frosted sticky (nav, CTA, ModeToggle, Sheet móvil) | `landing/site-header.tsx` | [MEDIO] | ✅
* [x] Task 25: Hero (grilla + glow + ventana de vidrio con mullions) | `landing/hero.tsx` | [BAJO] | ✅
* [x] Task 26: FAQ (accordion, 6 preguntas del rubro) | `landing/faq.tsx` | [BAJO] | ✅
* [x] Task 27: Contacto (form RHF+Zod + toast, mock) | `landing/contact.tsx` | [MEDIO] | ✅
* [x] Task 28: Footer claro (hairline gradiente, columnas, contacto) | `landing/site-footer.tsx` | [BAJO] | ✅
* [x] Task 29: Componer landing en `/`; mover UI-kit a `/ui` | `app/page.tsx`, `app/ui/page.tsx` | [BAJO] | ✅
* [x] Task 30: VALIDATE — lint + build en verde | `gms-front/` | [BAJO] | ✅

## <SESIÓN 6 — Identidad: logo, tipografía, modo claro>
* [x] Task 31: Modo CLARO únicamente (quitar `.dark`, `forcedTheme="light"`, sin toggle) | `globals.css`, `layout.tsx`, `site-header.tsx` | [MEDIO] | ✅
* [x] Task 32: Logo oficial webp transparente (header + footer) | `src/assets/gms-logo.webp` | [BAJO] | ✅
* [x] Task 33: Tipografía **Jost** (geométrica/formal) como `--font-sans` | `layout.tsx`, `globals.css` | [MEDIO] | ✅
* [x] Task 34: Moderar gradiente hacia geometría (evitar cliché IA) — hero sin blobs, paneles de vidrio, stats/CTA sólidos | `hero.tsx`, `contact.tsx` | [BAJO] | ✅
* [x] Task 35: VALIDATE — lint + build en verde | `gms-front/` | [BAJO] | ✅

## <SESIÓN 7 — Cimientos UI del ERP>
* [x] Task 36: `formato.ts` — numero/medida/moneda/porcentaje/plural con locale es-PE | `lib/formato.ts` | [BAJO] | ✅
* [x] Task 37: Primitivas `comunes/`: PageHeader · EmptyState · PanelError · StatTile · FilaMonto · TerminoTecnico | `components/comunes/` | [BAJO] | ✅
* [x] Task 38: **Sistema de color por familia funcional** — 3 familias validadas (CVD ΔE 9,2 · normal 27,6) + LeyendaFamilias | `lib/catalogo-visual.ts` | [MEDIO] | ✅
* [x] Task 39: `VentanaSVG` con `modoColor` función/acabado; color de familia en plano, tira y compositor | `features/` | [MEDIO] | ✅
* [x] Task 40: Sidebar **riel** 56px→224px al hover/foco, superpuesto (no empuja) | `erp-sidebar.tsx` | [MEDIO] | ✅
* [x] Task 41: Navegación móvil por Sheet en el topbar (cierra el hueco de 375px) | `erp-topbar.tsx` | [MEDIO] | ✅
* [x] Task 42: `navegacion.ts` con `disponible` — se acaban los 3 enlaces a 404 | `navegacion.ts` | [BAJO] | ✅
* [x] Task 43: Home del ERP en `/inicio` (los 3 pasos del negocio) + login y proxy apuntando ahí | `app/(erp)/inicio/` | [MEDIO] | ✅
* [x] Task 44: Boundaries `loading` · `error` (Next 16: `unstable_retry`) · `not-found` | `app/(erp)/` | [BAJO] | ✅
* [x] Task 45: Resultado del cálculo reordenado: plano y total primero, detalle en pestañas | `resultado-calculo.tsx` | [MEDIO] | ✅
* [x] Task 46: Compositor movido a diálogo; `/plantillas` es repositorio | `dialogo-nuevo-tipo.tsx` | [MEDIO] | ✅
* [x] Task 47: Eliminado `lib/api.ts` (95 líneas sin usar); fondo del ERP opaco | `lib/`, `(erp)/layout.tsx` | [BAJO] | ✅
* [x] Task 48: VALIDATE — lint 0 errores · build 10 rutas en verde | `gms-front/` | [BAJO] | ✅

## <SESIÓN 8 — El cotizador como taller CAD>
* [x] Task 49: **Color por insumo** — paleta de 16 tonos + mapa explícito de los 21 códigos del catálogo + respaldo por hash | `lib/catalogo-visual.ts` | [MEDIO] | ✅
* [x] Task 50: `familiaDe()` deja de pintar y pasa a AGRUPAR la lista de perfiles | `lib/catalogo-visual.ts` | [BAJO] | ✅
* [x] Task 51: `VentanaSVG` con `insumoResaltado` — halo y grosor en la pieza aislada, gris tenue en el resto | `ventana-svg.tsx` | [MEDIO] | ✅
* [x] Task 52: `PanelPerfiles` — lista agrupada por función; clic aísla, segundo clic suelta; plano al lado | `panel-perfiles.tsx` | [MEDIO] | ✅
* [x] Task 53: Fuera `ErpTopbar`; identidad y cierre de sesión al pie del riel | `erp-sidebar.tsx` | [MEDIO] | ✅
* [x] Task 54: `ErpBarraMovil` — solo por debajo de `md`, donde el riel no existe | `erp-barra-movil.tsx` | [MEDIO] | ✅
* [x] Task 55: `BarraControles` fija — tipo, ancho, alto y calcular en una fila | `barra-controles.tsx` | [MEDIO] | ✅
* [x] Task 56: Seis pestañas (Modelo · Medidas · Perfiles · Despiece · Compra · Costeo), Modelo por defecto | `resultado-calculo.tsx` | [MEDIO] | ✅
* [x] Task 57: Cotizador sin `PageHeader`; advertencias en popover con contador | `cotizar/nueva/page.tsx`, `cotizador-panel.tsx` | [BAJO] | ✅
* [x] Task 58: VALIDATE — lint 0 errores · build 10 rutas en verde | `gms-front/` | [BAJO] | ✅

---

## <NOTAS_Y_DECISIONES>
* **Stack final:** Next 16.2.12 · React 19.2.4 · Tailwind v4 · TypeScript strict · Zod 4.4.3 · npm · Turbopack.
* **Estrategia API (decidida):** cliente llama SIEMPRE a `/api/*` relativo; `next.config.ts` reescribe a `BACKEND_URL/api/*` del lado servidor. Sin CORS. `BACKEND_URL` (server-only) NO se expone al navegador.
* **Env (decidido):** validación fail-fast con Zod (`z.url()`) en `src/lib/env.ts`. `env.ts` es SERVER-ONLY (BACKEND_URL no es NEXT_PUBLIC). Para vars públicas en cliente → crear `env.client.ts` a futuro.
* **Vulnerabilidades npm (12 high):** todas en devDependencies (cadena ESLint + postcss bundleado en Next). NO ejecutar `npm audit fix --force` (degradaría next→9.3.3, eslint→10.x). Riesgo BAJO: no llegan al bundle de producción.
* **AGENTS.md / CLAUDE.md:** generados por create-next-app. SE MANTIENEN — guía útil de Next 16 (breaking changes vs. training data).
* **Paleta:** monocromática azul→cian. `#004AAD`≈`#0049AF` (near-duplicados). Falta color funcional (success/warning/error) → propuesto en el md, pendiente de aprobar.
* **Memory Vite→Next:** las guías `dreamdev/memory/frontend` son para Vite (server.proxy, import.meta.env). Adaptado a Next (rewrites, process.env). Pendiente actualizar los .md de memory.

## <DECISIONES DE LA SESIÓN 7>
* **El color codifica TRES familias, no siete.** Se intentó una por familia de insumo y el validador lo tumbó: naranja↔rojo quedan a ΔE 7,1 en visión normal (piso 15) y verde↔naranja a 3,2 en protanopía. En un plano todas las piezas coexisten, así que rige el criterio `--pairs all`, más estricto. Las tres que sí pasan resultaron ser la distinción que define el producto: estructura fija · hoja corrediza · guía. El resto va en gris y se identifica por tabla y posición.
* **`color_hex` del catálogo NO es un código de identificación:** es el ACABADO del aluminio, y por eso los 10 perfiles son grises casi iguales con 4 pares idénticos. No es un error del seeder. Conviven como `modoColor="funcion"` (clasifica) y `modoColor="acabado"` (retrata).
* **Las auroras del layout raíz NO eran código muerto**, como suponía el plan: son 6 blobs animados activos. Se dejan en la landing —es su identidad— y el ERP se apoya en fondo opaco. Se les añadió respeto a `prefers-reduced-motion`.
* **Home del ERP en `/inicio`, no en `/`:** `app/page.tsx` (landing) y `app/(erp)/page.tsx` colisionarían en la misma ruta.
* **Next 16 rompe `error.tsx`:** el segundo parámetro es `unstable_retry`, no `reset`.
* **El menú muestra el mapa completo desde el día uno**, con lo no construido inerte y rotulado «Pronto». Prometer una pantalla y devolver 404 cuesta más confianza que admitir que falta.

## <SESIÓN 9 — El color y los límites salen de la DB>
* [x] Task 59: Eliminado `COLOR_POR_CODIGO` del front — duplicaba el catálogo en TypeScript | `lib/catalogo-visual.ts` | [MEDIO] | ✅
* [x] Task 60: `color` y `limites` en los tipos; el front solo pinta lo que recibe | `features/cotizar/types.ts` | [BAJO] | ✅
* [x] Task 61: **Oclusión resuelta** — la pieza aislada se redibuja en la capa superior con extremos marcados | `ventana-svg.tsx` | [MEDIO] | ✅
* [x] Task 62: Inputs con feedback: los duros bloquean «Calcular», los 🔶 solo avisan | `barra-controles.tsx` | [MEDIO] | ✅
* [x] Task 63: Medidas de corte por pieza en la pestaña Perfiles («4 × 140 cm») + cotas restauradas | `panel-perfiles.tsx` | [BAJO] | ✅
* [x] Task 64: VALIDATE — lint 0 errores · build 10 rutas en verde | `gms-front/` | [BAJO] | ✅

## <DECISIONES DE LA SESIÓN 9>
* **El color se GENERA en el backend a partir del catálogo real** (`App\Servicios\PaletaInsumos`), no se elige a mano. Con N insumos el círculo de tono se divide en N: unicidad garantizada y un perfil nuevo entra sin tocar código. Verificado por test.
* **La luminosidad se corrige midiendo contraste WCAG, no por tramos.** Una luminosidad HSL fija daba `8115 = #9cdb43`, un lima que se pierde sobre papel blanco: el ojo pesa el verde seis veces más que el azul. Ahora se oscurece en pasos hasta superar 3:1 y quedó `#6da31f`.
* **El color NO se persiste.** No es dato de negocio —nadie decide que el 8115 «sea rojo»— sino consecuencia de cuántos insumos hay. `color_hex` sigue significando el ACABADO del aluminio y viaja aparte como `color_acabado`.
* **Dos clases de límite, y la interfaz las distingue.** Duros (ancho ≤ barra sin empalme, alto > puente) bloquean el botón porque el motor los rechazaría igual. Los de `series` están marcados 🔶 «deducido, pendiente de confirmar en taller» y **ningún código los aplicaba**: solo avisan. El día que el taller los confirme, cambia el dato, no el código.
* **Oclusión: dos pasadas de dibujo.** La pieza aislada se saca de la lista y se repinta al final, así que nada la tapa aunque comparta línea con otra (3210 y 5415 van ambos sobre el puente). Sus extremos se marcan con círculos, que es lo único que distingue dónde empieza y acaba cuando dos perfiles se superponen.
* **`preventLazyLoading` estuvo a punto de romper el listado:** exponer `limites` obliga a `diseno.serie`, y los controllers solo cargaban `diseno`.

## <DECISIONES DE LA SESIÓN 8>
* **Un color por insumo, con su límite medido.** La paleta de 16 tonos se validó sobre los 120 pares: ✓ los 16 superan 3:1 de contraste sobre blanco, ✓ todos caen en banda de luminosidad y croma, ✗ el peor par en visión normal queda en ΔE 4,5 (piso 15) y ✗ en protanopía en ΔE 0,4. Con 16 colores repartidos en la rueda la separación media es de 22° y **ninguna ordenación salva los 120 pares** — es aritmética del espacio de color, no un defecto de esta paleta. Conclusión operativa: **el color sirve para reconocer, no para verificar.**
* **El aislamiento es el mecanismo de verificación.** La pestaña Perfiles apaga todo menos la pieza elegida. Responde «¿dónde va el 8115?» sin pedirle al ojo que separe catorce tonos, y sigue funcionando con un catálogo de cuarenta insumos y para quien no distingue rojo de verde.
* **Los colores se asignan a mano, no por orden de aparición.** Si dependieran del orden en el despiece, el mismo perfil cambiaría de color entre tipos y la memoria visual dejaría de servir. El 8115 es rojo en todas las ventanas.
* **Aislar con clic, no con hover.** En la tablet del taller no hay puntero, y así el aislamiento se queda fijo mientras se compara con la pieza real en la mano.
* **La barra superior de escritorio desaparece:** gastaba 56px de alto a lo ancho de la pantalla para un nombre y un rol que no cambian nunca. Por debajo de `md` la sustituye `ErpBarraMovil`, que sí es navegación imprescindible.
* **El cotizador no lleva `PageHeader`.** Inicio y Plantillas lo conservan: son páginas de navegación. El cotizador es de trabajo continuo y todo lo que aparezca sobre el modelo debe ganarse el sitio.

## <SESIÓN 10 — Arquitectura, SEO y Schemas (Inspirado en Sudolabs)>
* [x] Task 65: Hardening de `next.config.ts` (HSTS, DNS-Prefetch, `removeConsole`, `optimizePackageImports: ['lucide-react', 'motion']`) | `next.config.ts` | [MEDIO] | ✅
* [x] Task 66: Puerta de calidad `check-comments.mjs` (prebuild gate para blindar comentarios) | `scripts/check-comments.mjs`, `package.json` | [BAJO] | ✅
* [x] Task 67: Endpoint estático `/llms.txt` generado desde catálogo, obras y blog bajo convención llmstxt.org | `src/app/llms.txt/route.ts` | [BAJO] | ✅
* [x] Task 68: Unificación de Knowledge Graph (@graph `#organization` + `#website`) + `FaqJsonLd` desde `faq-data.ts` + fix comentario JSX en FAQ | `src/components/seo/`, `faq.tsx` | [MEDIO] | ✅
* [x] Task 69: `BreadcrumbSchema` y `ObraJsonLd` + sincronización asíncrona de hash en galería + limpieza de imports en Obras y Catálogo | `galeria-obras.tsx`, `obras/[id]/`, `catalogo/` | [MEDIO] | ✅
* [x] Task 70: `BlogJsonLd` + saneamiento de `sitemap.ts` (fechas reales de contenido, sin falsos timestamps en build) | `sitemap.ts`, `blog/[slug]/` | [BAJO] | ✅
* [x] Task 71: VALIDATE integral — `check-comments` (145 archivos limpios) + `lint` (0 errores) + `build` (97 rutas generadas con éxito) | `gms-front/` | [BAJO] | ✅

## <DECISIONES DE LA SESIÓN 10>
* **Una sola fuente de verdad para FAQs:** Las preguntas y respuestas residen en `src/config/faq-data.ts`. La interfaz visual ([faq.tsx](file:///C:/Users/USUARIO/Documents/!GMSINTEGRA/gms-front/src/components/landing/faq.tsx)) y el microformato estructurado ([faq-json-ld.tsx](file:///C:/Users/USUARIO/Documents/!GMSINTEGRA/gms-front/src/components/seo/faq-json-ld.tsx)) consumen el mismo array exacto.
* **Knowledge Graph interconectado por `@id`:** En vez de duplicar fichas comerciales en scripts inconexos, se unificó en un único `@graph` donde `WebSite` declara `publisher: { @id: "#organization" }`, dotando de máxima consistencia a la entidad corporativa ante Google.
* **Sitemap con señales reales:** Eliminado `new Date().toISOString()` indiscriminado en el build. Se calculan las fechas reales (`masReciente`) del contenido publicado y se omiten marcas de tiempo en páginas estáticas de código para no desvalorizar el rastreo.
* **Efectos síncronos desacoplados en React 19:** La sincronización de hash en [galeria-obras.tsx](file:///C:/Users/USUARIO/Documents/!GMSINTEGRA/gms-front/src/components/obras/galeria-obras.tsx) se trasladó a suscripción de evento `hashchange` y timeout de microtarea, eliminando el antipatrón de renders en cascada.
* **Puerta de comentarios en prebuild:** Siguiendo el Principio 14 de DreamDev ("Un estándar sin puerta es una preferencia"), cualquier comentario en el código fuente que filtre datos confidenciales rompe la compilación antes de generar artefactos.

---

## <PENDIENTE PRÓXIMA SESIÓN>
* **Selector de diseño en `/plantillas`:** hoy sigue mostrando solo `disenos[0]`. Con un segundo diseño, la página tapará uno sin avisar. Requiere decidir el criterio de clasificación con el taller.
* **Catálogo de materiales (full-stack):** `GET /v1/insumos`, `PATCH /insumos/{id}/precio`, `GET /insumos/{id}/uso`. Desbloquea el costeo real — hoy todo material vale S/ 0,00.
* Cotización persistida: los modelos `Cotizacion`/`CotizacionItem` y su Policy existen sin endpoints ni pantalla.
* Server-state: instalar TanStack Query al construir la 1ª feature con mutaciones frecuentes.
* Commits pendientes del frontend listos para revisión y ejecución del usuario.

