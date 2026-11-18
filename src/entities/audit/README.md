# entities/audit

La bitácora de auditoría: quién hizo cada cambio, cuándo y con qué datos. Diseño en
`docs/refactor/10-BITACORA.md`; el servidor es `docs/backend/bitacora_lib.php` (escribe)
y `docs/backend/bitacora.php` (consulta).

## Contenido

- `api/bitacora.js` — `LLAVE_BITACORA`, `obtenerBitacora`, `obtenerDetalleBitacora`, `obtenerFiltrosBitacora`, `useBitacora`, `useDetalleBitacora`, `useFiltrosBitacora` (7)
- `model/bitacora.js` — `ZONA_BITACORA`, `MODULOS`, `moduloDe`, `accionDe`, `horaLocal`, `rangoEnUtc`, `leerDatos`, `nombreDeUsuario`… (13)

Pruebas: `bitacora.test.js`.
