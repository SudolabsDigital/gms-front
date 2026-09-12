# GMS Integra — Frontend

Frontend del ERP **GMS Integra**, construido con Next.js 16 (App Router) + TypeScript + Tailwind CSS v4.

## Requisitos

- Node.js >= 20 (probado con 22.x)
- npm >= 10

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (Turbopack) en http://localhost:3000 |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | Linter (ESLint 9 + eslint-config-next) |

## Estructura

    src/
      app/            # App Router (rutas, layouts, páginas)
        layout.tsx    # Layout raíz (fuentes, metadata)
        page.tsx      # Home
        globals.css   # Estilos globales + Tailwind
    public/           # Assets estáticos

## Stack

- **Next.js 16** — App Router, Turbopack
- **React 19**
- **TypeScript** (modo strict)
- **Tailwind CSS v4** (`@tailwindcss/postcss`)
- Alias de imports: `@/*` → `src/*`

## Backend

El backend (API) se desarrolla por separado en **Laravel** y se consume vía URLs relativas
(`/api/...`). El reenvío al servidor lo hace `src/app/api/[...slug]/route.ts`, y `src/proxy.ts`
—lo que hasta Next 15 era el middleware— resuelve la redirección de sesión. Este repo es solo el
frontend.

## Metodología y documentación

Este proyecto sigue **dreamdev** (`../dreamdev/`): ciclo
`DISCOVERY → PLAN → GATE → EXECUTE → REVIEW → VALIDATE`, ediciones quirúrgicas y riesgo declarado.

**La documentación y el plan de trabajo NO viven en este repositorio, sino en `../gms-docs/`:**

| Qué necesitas | Dónde |
|---|---|
| Decisiones vigentes, stack, deuda técnica | `gms-docs/PROJECT_CONTEXT.md` |
| Qué existe de verdad hoy | `gms-docs/ESTADO_DE_IMPLEMENTACION.md` |
| Plan de trabajo activo | `gms-docs/05-roadmap-y-tareas/task_plan.md` |
| Contexto compilado para agentes | `gms-docs/AGENT_CONTEXT.md` *(generado — no editar a mano)* |

> `DEV_TASKS.md` vivía aquí y se retiró el 2026-09-10: dos planes vivos son dos verdades. Su
> historial y sus decisiones están en `gms-docs/05-roadmap-y-tareas/historial-front-sesiones-1-11.md`.
