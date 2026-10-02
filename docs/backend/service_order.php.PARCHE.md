# `service_order.php` · dos cambios, los dos de lectura

Revisado el 2026-10-01 para el flujo nuevo de mantenimiento. **El archivo no se toca
para escribir**: su `AltaOrden` sigue atendiendo la pantalla vieja con su descuento de
inventario, intacto. La orden del flujo nuevo la crea `mtto.php · crearOrden`, que
escribe en las mismas tablas pero sin inventario y con un servicio por punto.

Lo único que hace falta aquí es que las órdenes de **caja** no salgan sin unidad en el
administrador. Son dos consultas, y en las dos se agregan tres renglones.

## Por qué el `ALTER` de `caja_id` es seguro en este archivo

Sus escrituras nombran sus columnas, así que una columna nueva opcional no las afecta:

```php
INSERT INTO ordenes_servicio (fecha_orden, truck_id, tipo_cambio) VALUES (?, ?, ?)
UPDATE ordenes_servicio SET fecha_orden = ?, truck_id = ?, tipo_cambio = ? WHERE id_orden = ?
```

Y ninguna lectura usa `SELECT *` ni índices numéricos: todas listan campos y leen con
`FETCH_ASSOC`.

## 1. En `case 'getAllOrdersWithDetails'`

Buscar `$sql_orders = "` y dejar la consulta así:

```php
        $sql_orders = "
            SELECT 
                o.id_orden,
                o.fecha_orden,
                o.estatus,
                o.truck_id,
                o.caja_id,
                o.tipo_cambio,
                t.unidad   AS nombre_camion,
                cj.no_caja AS nombre_caja
            FROM ordenes_servicio AS o
            LEFT JOIN trucks AS t  ON o.truck_id = t.truck_id
            LEFT JOIN caja   AS cj ON o.caja_id  = cj.caja_id
            ORDER BY o.id_orden DESC
        ";
```

## 2. En `case 'getOrderById'`

Buscar `$sql_orden = "` y dejar la consulta así:

```php
        $sql_orden = "
            SELECT 
                o.id_orden,
                o.tipo_cambio,
                o.fecha_orden,
                o.truck_id,
                o.caja_id,
                o.estatus,
                o.fecha_creacion,
                t.unidad   AS nombre_camion,
                cj.no_caja AS nombre_caja
            FROM ordenes_servicio AS o
            LEFT JOIN trucks AS t  ON o.truck_id = t.truck_id
            LEFT JOIN caja   AS cj ON o.caja_id  = cj.caja_id
            WHERE o.id_orden = ?
        ";
```

## De paso, algo que vi y no toqué

En `AltaOrden` se llama `registrarSalidaInventario($db, $id_articulo, $cantidad, $id_orden, $id_servicio)`
con cinco argumentos, y la función declara cuatro. En PHP no truena —los argumentos de
más se ignoran en funciones de usuario— y en `UpdateOrder` hay un `ReflectionFunction`
que ya se protege de eso. Lo dejo igual: no es un error, pero conviene saberlo si alguna
vez hace falta el `id_servicio` en el movimiento de inventario.
