# shared/ui

Piezas de interfaz reutilizables. **Cero lógica de negocio**: nada de aquí sabe qué es un
gasto, un viaje o un empleado. Si un componente necesita saberlo, va en `features/`.

## Contenido

| Pieza | Qué resuelve |
|---|---|
| `DataTable` | Tabla con columnas declarativas, orden por columna y los tres estados (cargando, error, vacío). Sustituye el patrón copiado en **45 archivos**. |
| `PageHeader` | Título, descripción y acciones. Estaba copiado con variaciones en casi todas las pantallas. |
| `ErrorBoundary` | Aísla el fallo de una pantalla para que no deje la app en blanco. Se monta **por página**, no una vez arriba. |
| `notify` | Avisos y confirmaciones. Envuelve una sola librería. |

## DataTable

Agregar una columna es agregar un objeto, no editar el componente:

```jsx
const columnas = [
  { id: 'nombre', label: 'Nombre', ordenable: true },
  { id: 'sueldo', label: 'Sueldo', ordenable: true, align: 'right',
    valor:  (e) => e.sueldo,
    render: (e) => `$${e.sueldo.toFixed(2)}` },
]

<DataTable filas={empleados} columnas={columnas} cargando={isLoading} />
```

`render` es lo que se pinta; `valor` es por lo que se ordena. Se separan porque una
columna de dinero se pinta como `"$1,500.00"` y se ordena como `1500`.

El orden reutiliza la semántica que ya tenía el Expense Manager, ahora en
`shared/lib/orden`: ciclo **ascendente → descendente → sin orden**, y los valores vacíos
**siempre al final**, en las dos direcciones. El tercer estado del ciclo importa: permite
volver al orden natural que trae la API sin recargar.

Por omisión el orden es interno. Pasa `orden` y `onOrdenChange` solo si la pantalla
necesita conservarlo entre navegaciones.

## notify

```js
notify.exito('Guardado correctamente')
notify.error(e, 'No se pudo guardar')      // acepta un Error directamente
notify.aviso('El nombre es obligatorio')

const acepto = await notify.confirmar({     // devuelve booleano, no {isConfirmed}
  titulo: '¿Eliminar empleado?',
  mensaje: 'El historial de pagos previos se mantendrá intacto.',
  confirmar: 'Sí, eliminar',
})
```

**Por qué existe**: el proyecto usa tres librerías para lo mismo — `sweetalert2` (343
llamadas en 56 archivos), `react-toastify` (una) y `@pablotheblink/flashyjs` (nueve).
`notify` envuelve sweetalert2, que es la que domina, para que las otras dos se retiren
módulo por módulo y para que cambiar de librería sea editar un archivo en vez de 56.

## Regla

`shared/ui` no importa nada de `entities/`, `features/` ni `pages/`. El linter lo verifica.
