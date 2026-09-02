# Diagnóstico de la base de datos — fases 2 y 3

> Medido sobre el dump `dump-i8768260_wp1-202609020924.sql`, tomado de producción el
> **2026-09-02 a las 09:24**. Todo lo de aquí es **lectura**: no se ejecutó nada contra la
> base. El SQL propuesto al final está escrito para revisarse, no se ha corrido.

`i8768260_wp1` · MariaDB 10.11 · **97 tablas** · 3.3 MB · todas InnoDB

## 1 · Lo grave, que es la fase 2

### 43 contraseñas en texto plano, en dos tablas

Ninguna está hasheada: ni bcrypt, ni siquiera MD5.

| Tabla | Filas | Formato |
|---|---:|---|
| `Users_credentials` | 31 | texto plano |
| `users` | 12 | texto plano |

**`users` es un duplicado.** Sus 10 personas —Angeles, Angelica, Blanca, Celso, Israel,
Max, Mia, Osvaldo, Richard y Wendy— **están todas también en `Users_credentials`**. Son dos
copias de las mismas credenciales, cada una con su propia contraseña en claro, que pueden
divergir sin que nadie se entere.

Esto se agrava con lo que ya estaba documentado: `features.php · get_users` devuelve esas
contraseñas **sin autenticación**, y la API viaja **sin HTTPS**.

### No existe ninguna infraestructura de sesión

No hay tabla `sessions`, ni columna de token, ni de expiración, en ninguna de las 97 tablas.
**La fase 2 no es migrar el login: es construirlo desde cero.**

### Nadie sabe quién hizo qué

**72 de las 85 tablas de negocio** no tienen ninguna columna de auditoría —ni `created_at`,
ni `created_by`, ni equivalente—. Junto con que la API no autentica, hoy es imposible
saber quién borró un gasto o cambió una tarifa.

## 2 · La fase 3 ya no está bloqueada

Llevaba semanas pendiente la consulta de qué tiene habilitado cada usuario. **El dump la
responde**, y la respuesta cambia el plan.

### Los dos sistemas de permisos no compiten: uno contiene al otro

| | Filas | Usuarios |
|---|---:|---:|
| `permissions` (viejo, por `section_name`) | 309 | 11 |
| `user_feature_flags` (nuevo, por `feature_id`) | 448 | 30 |

**Los 11 usuarios de `permissions` están todos en `user_feature_flags`.** Ni uno solo
depende del sistema viejo, así que no hay nada que migrar.

> **Falta confirmar una cosa que el dump no puede decir:** si algún PHP todavía lee
> `permissions`. Si no lo lee, la tabla es borrable tal cual.

### Los 12 `Administrativo` no se agrupan por área, sino por amplitud

| Persona | Permisos | Módulos de escritorio |
|---|---:|---|
| Osvaldo | 45 | Finanzas, Gastos, Mantenimientos, Safety, Viajes |
| Angelica | 42 | **todo**, incluido IMA Manager |
| Yssayana Pavian Arias | 36 | Gastos, IMA Manager, Mantenimientos, Safety, Viajes |
| Blanca | 26 | Gastos, IMA Manager, Mantenimientos, Safety, Viajes |
| Ashlye | 24 | Gastos, IMA Manager, Mantenimientos, Viajes |
| Angeles | 17 | Gastos, IMA Manager, Mantenimientos, Viajes |
| Mia | 7 | Gastos, Viajes |
| Wendy | 7 | IMA Manager, Viajes |
| nuevo | 6 | Viajes |
| Celso | 2 | — ninguno — |
| Prueba | 1 | — ninguno — |
| Max | 0 | — ninguno — |

**Nadie es "solo Finanzas".** Finanzas solo la tienen Osvaldo y Angelica, y ambos tienen
además casi todo lo demás. El plan que estaba escrito en `03-AUTH-ROLES.md` —repartirlos en
Operaciones / Finanzas / Mantenimiento / Safety— **no encaja con los datos**. Lo que los
datos sugieren:

| Rol propuesto | Quiénes | Qué abarca |
|---|---|---|
| **Coordinación** | Angelica, Osvaldo | Todo, más Finanzas |
| **Operación** | Yssayana, Blanca, Ashlye, Angeles | Gastos, IMA Manager, Mantenimientos, Viajes |
| **Operación limitada** | Mia, Wendy, nuevo | Uno o dos módulos |
| **Sin uso** | Celso, Prueba, Max | Nada |

**Celso, Prueba y Max no tienen prácticamente permisos y siguen con `active = 1`**, o sea
que pueden entrar. `Prueba` huele a cuenta de pruebas dejada en producción.
**Decisión pendiente de Emiliano y Richard: ¿son cuentas vivas?**

### El catálogo de features

57 features activas, ninguna inactiva. Tres —`inicio`, `mapa`, `reports`— tienen `module`
en `NULL`, así que no se agrupan con nadie al calcular permisos por módulo.

Hay **un flag que apunta al `feature_id = 4`, que no existe**. Es basura inofensiva, pero
delata que no hay clave foránea que lo impida.

## 3 · Rendimiento: faltan índices donde más duele

Las tres tablas más grandes **solo tienen su llave primaria**:

| Tabla | Filas | Qué falta |
|---|---:|---|
| `documents` | 5 741 | nada por `tipo_documento` ni `fecha_vencimiento` |
| `diesel_tickets` | 3 927 | **nada por `trip_id`** |
| `IFTA_STATE` | 2 001 | **nada por `trip_id`** |

Cada vez que se abren los tickets de diesel de un viaje, MySQL recorre las 3 927 filas. Es
lo más barato de arreglar de toda esta lista y de lo que más se nota.

## 4 · Higiene

### WordPress vive en la misma base

13 tablas `wp_*` con 305 filas en total: un sitio viejo compartiendo base de datos y
credenciales con el sistema de operaciones. **Una vulnerabilidad en ese WordPress da acceso
a todo lo demás.**

### La codificación está partida en dos

**80 tablas en `latin1`, 17 en `utf8mb4`.** Peor: hay **cuatro claves foráneas que cruzan**
de una codificación a la otra.

```
inspections (utf8mb4) -> trips  (latin1)
inspections (utf8mb4) -> trucks (latin1)
trips       (latin1)  -> teams  (utf8mb4)
user_teams  (utf8mb4) -> Users_credentials (latin1)
```

Un join entre colaciones distintas **no puede usar el índice**, y los acentos se corrompen
al pasar de una a otra.

### Integridad referencial casi ausente

**71 de las 97 tablas no tienen ninguna clave foránea.** Los huérfanos se acumulan sin que
nada los frene.

### Cosas sueltas

- **`detalles_gasto_bkp_20260829`**: un respaldo de 52 filas olvidado en producción.
- **Seis tablas vacías de funciones construidas y no usadas**: `cotizaciones`,
  `cotizacion_paradas`, `programacion_trips`, `milla_driver`, `user_teams`, `activos`.
- **`gastos.id_activo` apunta a `activos`, que está vacía**: las 1 642 filas tienen ese
  campo en `NULL`. La función nunca se usó.

### Datos malos

- **550 de 1 161** filas de `drivers_documents` con `fecha_vencimiento` en `0000-00-00`:
  casi la mitad. *(Corrige la nota anterior de "158": aquello era lo que se veía en una
  pantalla, no el total de la tabla.)*
- La unidad **7** tiene `current_fuel = -59.21` con un tanque de 200. La de 850 galones que
  se vio en agosto ya no aparece.
- 8 columnas de fecha declaradas con `DEFAULT '0000-00-00'`, que es lo que permite que
  entren.

## 5 · Qué se puede hacer, por orden

Ordenado por daño evitado frente al riesgo de hacerlo.

### 1. Índices — riesgo casi nulo

No cambian ni un dato. Es lo único de esta lista que se puede hacer sin ceremonia.

```sql
CREATE INDEX idx_diesel_tickets_trip   ON diesel_tickets (trip_id);
CREATE INDEX idx_ifta_state_trip       ON IFTA_STATE (trip_id);
CREATE INDEX idx_documents_tipo        ON documents (tipo_documento);
CREATE INDEX idx_documents_vencimiento ON documents (fecha_vencimiento);
```

> Recordatorio de `phpmyadmin-godaddy`: sin transacciones entre envíos, hay que mandar cada
> sentencia por separado y comprobar entre una y otra.

### 2. Hashear las contraseñas — sin ventana de corte

Se puede hacer sin que nadie cambie su contraseña ni deje de entrar:

1. Agregar `pass_hash VARCHAR(255) NULL` a `Users_credentials`.
2. `Auth.php`: si hay `pass_hash`, verificar con `password_verify`. Si no lo hay y la
   contraseña en claro coincide, **generar el hash en ese momento** y guardarlo.
3. Cuando todos hayan entrado una vez, `pass` queda vacío para todos y se puede borrar.
4. Solo entonces, quitar `pass` de cualquier `SELECT` —empezando por `features.php ·
   get_users`, que hoy las devuelve sin autenticar.

El paso 4 es el que de verdad cierra el agujero; los tres primeros son para llegar a él sin
romperle el acceso a nadie.

### 3. Decidir qué pasa con `users`

Es un duplicado de 10 personas. **Antes de tocarla hay que ver qué PHP la lee**; eso no se
ve desde el dump. Sospecha: es de la versión vieja del sistema.

### 4. Sesiones de verdad — la fase 2 completa

Tabla `sessions` con token, expiración y `user_id`; `Auth.php` la emite; los 36 endpoints
la verifican en vez de confiar en el `id_usuario` que manda el cliente.

**Hay que coordinarlo con quien mantiene la app móvil antes de empezar**, porque consume
los mismos endpoints y su código no está en este repo.

### 5. Los roles — ya se pueden definir

Con la tabla de la sección 2. Bloquea una sola decisión: qué pasa con Celso, Prueba y Max.

El orden sigue siendo el de `03-AUTH-ROLES.md`: crear las tablas → llenarlas → **verificar
que los permisos calculados coincidan con los de hoy para los 30 usuarios** → recién
entonces cambiar el backend.

### 6. Limpieza

- Borrar `detalles_gasto_bkp_20260829` una vez confirmado que ya no hace falta.
- Borrar el flag huérfano que apunta al `feature_id = 4`.
- **Sacar WordPress de esta base**, o al menos a otro usuario de MySQL sin acceso al resto.
- Decidir si las seis tablas vacías se quedan o se van.

### 7. Unificar a `utf8mb4` — lo último

Es lo más invasivo: toca 80 tablas y hay que reescribir las cuatro claves foráneas que
cruzan codificación. **Dejarlo para cuando ya haya respaldos automáticos y un procedimiento
probado en una copia**, no antes.

## Lo que este diagnóstico no puede responder

Sale del dump, así que no ve el PHP ni el hosting:

- Si algún endpoint todavía lee `permissions` o `users`.
- Si hay índices que existan solo en producción y no en el dump *(no aplica: `mysqldump`
  los incluye, pero conviene recordarlo si alguien compara)*.
- Nada sobre el certificado TLS roto, que sigue siendo el pendiente de seguridad mayor.
