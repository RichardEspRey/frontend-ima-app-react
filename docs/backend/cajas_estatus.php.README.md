# Pendiente antes de subirlo al servidor

`cajas_estatus.php` asume que el procedimiento `Crud_caja_trips_status('I', trip_id, status)`
—el que guarda Impo / Expo / Vacío al marcar Almost Over— escribe en una tabla
`caja_trips_status` con las columnas `id`, `trip_id` y `status`.

Eso está **sin confirmar**: el dump de producción no trae el cuerpo de los procedimientos
(«insufficient privileges to SHOW CREATE PROCEDURE»). Para confirmarlo, en phpMyAdmin:

```sql
SHOW CREATE PROCEDURE Crud_caja_trips_status;
SHOW TABLES LIKE '%caja%';
```

Si el nombre o las columnas son otros, lo único que cambia es el `LEFT JOIN caja_trips_status`
de `getEstatusCajas`. Todo lo demás ya no depende de eso.
