# Módulo: Inicio

La pantalla de bienvenida: misión, visión, valores y las políticas de la empresa.

| Ruta | Archivo |
|---|---|
| `/home` | `pages/inicio/InicioPage.jsx` |

## Qué la hace distinta

**Es la única pantalla sin datos de servidor.** Todo su contenido está escrito en el
componente: no hay consultas, ni entidad, ni endpoint. Por eso tampoco tiene estados de
carga ni de error — no hay nada que pueda fallar.

Es también la primera pantalla que ve alguien al entrar, así que funciona como referencia
visual del sistema de diseño: usa `CARD_SX`, los tintes de categoría y el encabezado
estándar sin ninguna excepción.

## Reglas

- Las políticas se abren en un modal, no en otra ruta. Son texto de lectura, no un flujo:
  no tiene sentido que ocupen una entrada en el historial.
- Los iconos y el tinte de cada tarjeta salen de `TINTE`, no de valores escritos a mano.

## Cosas que sorprenden

- **El contenido está en el código, no en la base.** Cambiar la misión de la empresa hoy
  requiere un despliegue. Es aceptable mientras cambie una vez cada varios años; si empieza
  a cambiar, es candidata a salir a datos.
