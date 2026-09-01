# Módulo: Documentos (IMA Manager)

Centro de documentos corporativos: los requisitos que IMA debe tener vigentes en México y
Estados Unidos, con su fecha de vencimiento.

| Ruta | Archivo |
|---|---|
| `/ima-manager` | `pages/documentos/DocumentosPage.jsx` |

Sus tres componentes viven en `features/documentos/ui/`: `DocumentCard`,
`ConfigRequirementModal` y `EditValueModal`.

## Entidad

**`entities/document`** — `IMA_Docsv2.php`.

| op | Qué hace |
|---|---|
| `getAll` | Requisitos y lo capturado para cada uno |
| `Alta` | Guarda el valor de un requisito: archivo, texto y vigencia |
| `addConfig` | Crea un requisito nuevo |
| `deleteConfig` | Retira un requisito del panel |

## Reglas de negocio

- Un requisito es **de archivo** (`file`) o **de texto** (`text`), y pertenece a **México**
  o **Estados Unidos**.
- Solo algunos llevan **control de vigencia**. Uno sin control nunca sale como vencido.
- Estados: sin capturar → vigente → **por vencer** (30 días o menos) → vencido.
- Retirar un requisito **no borra lo capturado**: deja de pedirse y los datos se conservan.
- Un requisito retirado (`activo = 0`) no se pinta, pero sigue en la respuesta.

## Cosas que sorprenden

- **`getAll` devuelve dos cosas de forma distinta**: `requisitos` es una **lista** y
  `valores` un **objeto indexado por `key_name`**. Tratar `valores` como arreglo da siempre
  vacío. Por eso la entidad usa `post` y no `postLista`.
- **Conviven dos versiones del endpoint.** Esta pantalla usa `IMA_Docsv2.php`; el
  `Sidebar` sigue leyendo `IMA_Docs.php` para su contador de pendientes. Las dos están
  registradas en `shared/api/endpoints.js` a propósito.
- **Los booleanos llegan como `"1"` / `"0"`.** El esquema los convierte, así que en el
  código son booleanos de verdad y `tiene_vencimiento == 1` deja de hacer falta.

## Historial

Migrado en el incremento 8 (2026-09-01).

- Se borraron `ImaScreen.jsx` (300 líneas) e `ImaAdmin.jsx` (206). Tenían ruta pero no
  estaban en el menú y nadie navegaba a ellas; las reemplazó esta pantalla en mayo de 2026.
- **Bug de vencimientos**: el cálculo anterior comparaba contra la hora actual, así que un
  documento que vencía **hoy** salía como "Vencido" desde el primer minuto del día.
- Es el primer módulo con **fixture de la respuesta real** de la API en sus tests.

Verificado en Chrome el 2026-09-01: 7 requisitos USA y 1 de México con sus estados
correctos —`CAAT` vencido en rojo, `Permiso KYU` faltante, el resto vigente—, el modal de
gestión abre con el documento y la fecha ya cargados, y la consola sale limpia.
