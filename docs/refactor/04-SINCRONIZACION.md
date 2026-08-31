# Sincronización — convivir con la rama de Richard

Este es el documento que decide si el refactor llega o no. La rama `refactor` anterior no
murió por mala arquitectura: murió con **116 commits de divergencia** porque nadie la
reintegró a tiempo. Todo lo de aquí existe para que eso no se repita.

## Las cinco reglas

### 1. Ninguna rama vive más de una semana

Un incremento = una rama = de 1 a 5 días = un merge a `main`. Si un incremento no cabe en
esa ventana, está mal cortado: pártelo.

**Antes de abrir cualquier rama:**
```bash
git fetch origin
git checkout -b refactor-NN-nombre origin/main
```

**Todos los días, sobre la rama viva:**
```bash
git fetch origin && git rebase origin/main
```
Rebase diario, no al final. Un conflicto de un día se resuelve en minutos; el de tres
semanas no se resuelve.

### 2. Mover y editar nunca van en el mismo commit

Es la regla más importante y la menos obvia.

```bash
# commit 1 — SOLO mover, sin abrir el archivo
git mv src/screens/Gastos/AdminGastos.jsx src/pages/gastos/AdminGastosPage.jsx
git commit -m "refactor(gastos): mover AdminGastos a pages/ (sin cambios de contenido)"

# commit 2 — ahora sí, editar
git commit -m "refactor(gastos): extraer useAdminGastosController"
```

Git detecta renombres comparando contenido. Si mueves y editas a la vez, la detección
falla y **cada línea que Richard tocó se vuelve conflicto manual**. Si mueves limpio, git
reaplica sus cambios solo, en el archivo nuevo, sin intervención.

Verificación antes de commitear un movimiento:
```bash
git diff --cached -M --stat   # debe decir "rename", no "delete + create"
```

### 3. Puentes de re-export durante un incremento

Cuando muevas un archivo que Richard podría estar importando, deja el viejo como puente:

```js
// src/components/TripRow.jsx  (puente temporal — borrar en el incremento N+1)
export { default } from '../features/trips/ui/TripRow'
```

La rama en vuelo de Richard sigue compilando aunque él no sepa que el archivo se movió.
El puente se borra en el incremento siguiente, cuando ya no queda nadie importándolo:

```bash
grep -rn "components/TripRow" src   # 0 resultados → se borra el puente
```

Cuesta tres líneas y convierte un merge doloroso en uno trivial.

### 4. El orden lo dicta el mapa de calor, no el gusto

Del `01-DIAGNOSTICO.md`, lo que Richard toca en los últimos 6 meses:

- **Caliente** (último): `screens/Viajes` (13), `navigation` (7), `screens/Gastos` (7), `components` (22)
- **Tibio**: `Safety` (6), `config` (5), `store` (4), `Dispatch` (4), `Mapas` (3)
- **Frío** (primero): `Nomina` (0), `Mantenimientos` (1), `Finanzas` (1), `AccessManager` (0), `Reports` (0)

Y antes que todo eso, lo de **riesgo cero**: `shared/api`, `shared/ui`, `shared/auth` son
**archivos nuevos**. No conflictan con nada porque no existen todavía. Ahí es donde se
empieza y de ahí sale el mayor retorno.

> `components/` es la más caliente de todas y también la que más hay que desarmar. Por eso
> se desarma **por módulo** (los componentes de gastos se van con el incremento de gastos),
> no de golpe.

### 5. Un archivo de coordinación, actualizado antes de empezar

`docs/refactor/EN-CURSO.md`, con esto y nada más:

```markdown
## Semana del 2026-08-31
Refactor tocando: src/screens/Nomina/, src/entities/user/
NO tocar sin avisar: nada más
Richard trabajando en: (que lo llene él)
```

Con dos personas no hace falta ceremonia: hace falta que antes de abrir un módulo se lea
un archivo de cinco líneas. Se commitea a `main` directo, sin PR.

## El protocolo de merge

**Al terminar un incremento:**

```bash
git fetch origin
git rebase origin/main          # resolver aquí, no en main
npm test                        # los smoke tests DEBEN pasar
npm run build                   # debe compilar
git push -u origin refactor-NN-nombre
```

Luego PR a `main`, o merge directo si están de acuerdo. **No se empieza el siguiente
incremento hasta que este esté en `main`.** Sin excepciones — es la regla que la rama
vieja rompió.

**Cuando Richard mergea algo a `main` mientras trabajas:**

```bash
git fetch origin && git rebase origin/main
npm test
```
Y si tocó un archivo que estás moviendo, resuélvelo **ese día**, no el viernes.

## Cómo se traen las features nuevas al refactor

Es tu preocupación explícita: que el refactor no quede con una versión vieja de la app.
Con este método no puede pasar, porque **el refactor vive en `main`**, no al lado.

- Richard mergea una feature a `main` → tu siguiente rebase la trae. No hay que "portarla".
- Si su feature cae en un módulo **ya refactorizado**, él la escribió en la estructura
  vieja de ese módulo y hay que reacomodarla. Eso es trabajo, pero son horas, no semanas,
  y se detecta el día que pasa. Se hace ahí mismo, en un commit `refactor(x): reacomodar
  <feature> a la estructura nueva`.
- Si su feature cae en un módulo **no refactorizado** (lo normal, porque el orden va de
  frío a caliente), no hay nada que hacer: llega gratis con el rebase.

Y por eso `screens/Viajes` va al final: es donde más trabaja Richard, y para cuando le
toque, el patrón ya estará probado en seis módulos y la conversión será mecánica.

## La red de seguridad

`npm test` verde es el contrato de cada incremento. Los smoke tests de rutas
(`src/test/rutas.smoke.test.jsx`, en la rama `refactor-01-red-de-seguridad`) montan cada
pantalla y verifican que renderiza. No prueban lógica de negocio — prueban que el refactor
no rompió el cableado, que es exactamente el 90 % de lo que un refactor puede romper.

Si un incremento no puede mantenerlos verdes, el incremento está mal, no los tests.

## Qué hacer con la rama `refactor` vieja

Está abandonada desde abril con 116 commits de divergencia. **No se reintegra.** Se
conserva como referencia (llegó a migrar tracking y drivers a FSD; sirve para consultar
decisiones), pero no se mergea nada de ella.

Cuando ya no la necesites, bórrala: libera el namespace `refactor/…` en git y las ramas
nuevas pueden volver a `refactor/NN-nombre` con diagonal en vez de guion.
