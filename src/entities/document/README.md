# entities/document

Los documentos corporativos de IMA (IMA Manager): qué requisitos hay por región y qué se capturó para cada uno.

## Contenido

- `api/documentos.js` — `obtenerDocumentos`, `guardarDocumento`, `crearRequisito`, `eliminarRequisito`, `useDocumentos`, `useGuardarDocumento`… (8)
- `model/documento.js` — `REGION`, `TIPO_REQUISITO`, `DIAS_POR_VENCER`, `esquemaRequisito`, `esquemaValor`, `ESTADO_DOCUMENTO`… (10)

Pruebas: `apiReal.test.js`, `documento.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `IMA_Docsv2.php` | `getAll` | `obtenerDocumentos()` |
| `IMA_Docsv2.php` | `Alta` | `guardarDocumento()` |
| `IMA_Docsv2.php` | `addConfig` | `crearRequisito()` |
| `IMA_Docsv2.php` | `deleteConfig` | `eliminarRequisito()` |

## Reglas de negocio

- `IMA_Docsv2.php` manda `requisitos` como lista y `valores` como **objeto indexado por `key_name`**; tratarlo como lista da siempre vacío. Por eso se usa `post` y no `postLista`.
- Un requisito sin control de vencimiento nunca sale como vencido: solo importa si está capturado.
- Los días restantes se cuentan a medianoche, para que un documento que vence hoy dé 0 y no un negativo.
- Retirar un requisito no borra lo capturado: solo deja de pedirse.

## Quién lo usa

`pages/documentos`
