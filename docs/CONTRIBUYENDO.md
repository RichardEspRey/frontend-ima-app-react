# Convenciones de trabajo

## Ramas

- `main` — lo que se libera. Se mergea aquí, no se trabaja aquí.
- `Emiliano`, `Richard` — ramas personales de features.
- `refactor-NN-nombre` — un incremento del refactor. Vida máxima: **una semana**.

Antes de abrir una rama y todos los días mientras viva:

```bash
git fetch origin && git rebase origin/main
```

## Commits

Formato convencional, en español:

```
tipo(alcance): descripción en imperativo

feat(gastos): agregar filtro por país
fix(viajes): corregir cálculo de millas en cruces
refactor(gastos): extraer useAdminGastosController
docs(api): documentar save_expense.php
```

Tipos: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`.

### Regla crítica del refactor: mover y editar van separados

```bash
git mv src/screens/X.jsx src/pages/x/X.jsx
git commit -m "refactor(x): mover X a pages/ (sin cambios de contenido)"
# recién ahora, editar
```

Git detecta renombres comparando contenido. Si mueves y editas en el mismo commit, la
detección falla y cada línea que otro tocó se vuelve conflicto manual. Verifica antes de
commitear:

```bash
git diff --cached -M --stat   # debe decir "rename", no "delete + create"
```

## Dónde va cada cosa

```
app/       providers, router, tema. Solo arranque.
pages/     una pantalla = composición. Sin lógica, sin fetch.
features/  un caso de uso con UI propia.
entities/  un modelo del dominio: normalizadores, esquemas, queries, UI mínima.
shared/    cero lógica de negocio. Sirve en cualquier app.
```

Dependencias **solo hacia la derecha**:

```
app → pages → features → entities → shared
```

`features/a` nunca importa de `features/b`. Si comparten algo, baja a `entities` o
`shared`. El linter lo verifica: no es criterio, es regla.

## Componentes

- Un componente **pide datos**, **decide** o **pinta**. Nunca las tres.
- Un componente que pinta no monta `useEffect` de datos ni arma un `FormData`.
- Techo blando: **250 líneas**. Pasarlo es señal de dos responsabilidades, no una falta.
- Nada de `fetch()` directo: todo pasa por `entities/<x>/api`.

## Estado

| Tipo | Herramienta |
|---|---|
| De servidor (listas, catálogos) | TanStack Query |
| De sesión / global | zustand |
| Compartido dentro de una pantalla | Context de la feature |
| Local | `useState` |

Si estás bajando una prop por tres niveles, el estado está en el lugar equivocado.

## Documentación

**JSDoc arriba, cuerpo limpio.**

- Todo lo exportado lleva JSDoc: descripción, `@param`, `@returns`, `@throws`.
- **Cero comentarios dentro del cuerpo.** Si el cuerpo necesita un comentario para
  entenderse, extrae una función con nombre.
- El porqué de una decisión va en `docs/DECISIONES/`, en el commit o en el chat — nunca
  en el archivo.

Plantillas por tipo de pieza en `refactor/06-DOCUMENTACION.md`.

> Los archivos cuyo nombre empieza con `_` los excluye jsdoc por defecto y no aparecen en
> `docs/api/`. No uses ese prefijo en código que deba quedar documentado.

## Antes de mergear

```bash
npm test          # verde
npm run build     # verde
npm run lint      # sin errores nuevos
npm run docs:api  # regenerar la referencia
```

## Seguridad

- Prohibido `dangerouslySetInnerHTML`, `innerHTML` y `eval`. El linter los bloquea.
- Nada de secretos en `VITE_*`: todo lo que empieza con `VITE_` acaba en el bundle y es
  público.
- Esconder un botón **no es seguridad**. Los permisos del front son experiencia de
  usuario; la autorización real vive en el servidor.
