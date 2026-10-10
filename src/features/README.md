# Arquitectura Basada en Características (Features)

Para el desarrollo del ERP **GMS Integra**, organizamos el código agrupándolo por dominio de negocio (features) en lugar de tipo técnico. Esto mejora la modularidad, facilita el mantenimiento y escala mejor a medida que el sistema crece.

## Estructura típica de una Feature

Cada módulo dentro de `src/features/[feature-name]` debe seguir la siguiente estructura:

```text
src/features/nombre-feature/
├── api/             # Funciones de consumo de API (usando @/lib/api)
├── components/      # Componentes de UI exclusivos de esta feature
├── hooks/           # Hooks de React (queries, mutations, lógica compleja)
├── types/           # Interfaces y tipos específicos de la feature
└── index.ts         # Punto de entrada público (exporta lo necesario)
```

## Las features que existen

Medido el 2026-10-09 (la lista anterior, del 2026-09-23, se había quedado en tres). Esta lista se mantiene con el
código: una carpeta nueva se añade aquí el día que nace.

| Carpeta | Qué contiene |
|---|---|
| `clientes/` | La portada de Clientes, su panel y la ficha del cliente |
| `cotizar/` | El cotizador CAD: plano, despiece, compra y costeo del cálculo en seco; el selector de tipo por su dibujo |
| `materiales/` | El repositorio de insumos: lista, ficha, presentaciones, familias y «Cargar precios» |
| `parametros/` | Los parámetros generales —comerciales y mano de obra— y las ayudas de cada parámetro |
| `plantillas/` | Los tipos de un diseño: su dibujo, la galería (en la serie y en el cotizador) y el compositor de «Nuevo tipo» |
| `proyectos/` | Del lead al proyecto entregado: lista por etapa, alta con el cliente al vuelo, la obra como espacio, cobros y corte |
| `series/` | La serie como espacio: su lectura, sus pestañas, sus materiales con su uso y la certeza de cada pieza |

*(Hasta esa fecha esta sección anunciaba `dashboard`, `projects`, `quotes`, `inventory` y `clients`, que nunca
existieron. No todas usan todavía las cinco subcarpetas de arriba: se crean cuando hacen falta, no antes.)*

---

*Nota: Los componentes genéricos que no pertenecen a ningún dominio de negocio específico (ej. inputs base, botones, layout global) se mantienen en `src/components/ui/` o `src/components/` respectivamente.*
