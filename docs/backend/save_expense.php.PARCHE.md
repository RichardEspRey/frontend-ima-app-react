# `save_expense.php` · dos cambios en el `case 'Alta'`

## 1. Que un gasto pueda no tocar el inventario

Hoy, todo detalle con categoría 1, 2 o 3 —Refacciones, Herramienta, Consumibles— crea o
engorda un artículo del inventario y registra su movimiento. Para los gastos capturados a
mano eso está bien y se queda igual. Para los que nacen de una orden de servicio no: la
orden ya no consume del inventario, así que el stock crecería sin que nada lo baje.

Dentro del `case 'Alta'`, después de leer `$detailsData`, agregar:

```php
        // Los gastos que nacen de una orden de servicio no alimentan el inventario: la
        // orden ya no consume de ahí, así que el stock crecería sin que nada lo baje.
        $omitirInventario = !empty($_POST['omitir_inventario']);
```

Y cambiar la condición del bloque de inventario:

```php
                if (!$omitirInventario && in_array($detalle['id_categoria_mantenimiento'], $categoriasInventario)) {
```

Eso es todo: sin el campo, el archivo se comporta **exactamente** como hoy.

## 2. Que los errores se vean

El `catch (Exception $e)` no atrapa los errores fatales de PHP —`TypeError` y compañía—
porque esos son `Error`, no `Exception`. Por eso, cuando mandé un detalle con categoría y
sin subcategoría, la respuesta fue **HTTP 500 con el cuerpo vacío**: el mensaje nunca se
escribió. Costó tres pruebas averiguar qué pasaba; con esto se habría visto a la primera:

```php
        } catch (Throwable $e) {
```

`Throwable` cubre `Exception` y `Error`, así que no se pierde nada de lo que ya atrapaba.

## De paso: por qué truena sin subcategoría

Cuando el detalle trae categoría 1, 2 o 3 y la subcategoría va en `null`, algo de la
cadena `normalizarSubcategoria` → `verificarArticuloExistente` → `crearArticuloInventario`
lanza un error fatal. Comprobado contra producción:

| Detalle enviado | Respuesta |
|---|---|
| sin `id_categoria_mantenimiento` | 200 |
| categoría 1, subcategoría `null` | 500, cuerpo vacío |
| categoría 1, subcategoría 1 (Llantas) | 200 |

El constructor de órdenes ya pide la subcategoría como obligatoria, así que no volverá a
mandarla nula. El cambio a `Throwable` es para la próxima vez que algo así pase.
