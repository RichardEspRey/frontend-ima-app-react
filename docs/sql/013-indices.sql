-- Índices que faltan en diesel e IFTA
--
-- `diesel_tickets` (3 915 filas) e `IFTA_STATE` (1 311) solo tienen su llave primaria.
-- Cada vez que se piden los tickets o los estados de un viaje, MySQL recorre la tabla
-- entera; y el resumen de diesel lo hace una vez por cada uno de sus 266 viajes.
-- Comprobado el 2026-11-17 con SHOW INDEX: ninguno de estos existe todavía.
--
-- Un índice no cambia ni un dato: solo es una lista ordenada para buscar más rápido.
-- Se quita con DROP INDEX <nombre> ON <tabla>; y todo queda como estaba.
--
-- Son TRES envíos. Mandar cada uno por separado en phpMyAdmin y revisar que diga que
-- se ejecutó con éxito antes del siguiente. Cada uno tarda menos de un segundo.

-- ── Envío 1 ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_diesel_tickets_trip ON diesel_tickets (trip_id);

-- ── Envío 2 ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_ifta_state_trip ON IFTA_STATE (trip_id);

-- ── Envío 3 ──────────────────────────────────────────────────────────────────
-- Los tickets también se buscan por el registro de diesel al que pertenecen.
CREATE INDEX idx_diesel_tickets_register ON diesel_tickets (id_register);

-- No se incluyen los dos índices de `documents` (por tipo y por vencimiento) que
-- proponía 08-DIAGNOSTICO-BD.md. Esa tabla se consulta por su llave primaria a través
-- de `trip_document_relationship`, que ya tiene índices; sin ver las consultas que
-- filtran por tipo o por vencimiento no hay evidencia de que sirvan.
