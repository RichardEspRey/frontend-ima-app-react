# Glosario

> El vocabulario del negocio y cómo se llama en el código. Cada término lleva el nombre de
> la constante o de la columna donde vive, para poder buscarlo. Si un término aparece en
> una pantalla y no está aquí, falta aquí.
>
> Convención del código: las constantes y las funciones se nombran en español; los valores
> que guarda la base se respetan tal cual, aunque estén en inglés (`"In Transit"`,
> `"Going Up"`).

---

## Viajes

| Término | Qué es | En el código |
|---|---|---|
| **Viaje** | Un servicio de transporte de principio a fin, con una o varias etapas | `entities/trip`, tabla `trips` |
| **Número de viaje** | Consecutivo por país y año; la API da el siguiente libre | `obtenerSiguienteNumero`, `trip_number` |
| **Nomenclatura** | Cómo se nombra un viaje en pantalla: `200-US-26` (número, país, año a dos dígitos). Los transnacionales llevan el cruce: `197-US-63T2-26` | `identificadorViaje`, `etiquetaViajeTransnacional`. Para inspecciones sale de `All_CL_Final`, no se reconstruye desde `trips` |
| **Estado del viaje** | `In Coming` → `In Transit` → `Almost Over` → `Completed`, o `Cancelled` | `ESTADO_VIAJE` |
| **Almost Over** | El viaje terminó su recorrido y espera cierre. Al marcarlo se pregunta el *status de caja* | `ESTADO_VIAJE.POR_TERMINAR`, `ModalStatusCaja` |
| **Etapa** | Un tramo del viaje con su origen, destino, compañía y documentos | `trip_stages`, `etapasDesdeApi` |
| **Tipo de etapa** | `normalTrip` (viaje normal), `borderCrossing` (cruce), `emptyMileage` (millas vacías) | `TIPO_ETAPA` |
| **Dirección** | Si la etapa sube hacia EUA o baja hacia México: `Going Up` / `Going Down` | `trip_stages.travel_direction` |
| **Parada** | Un punto intermedio dentro de una etapa | `paradasDesdeApi`, `ESTADO_PARADA` |
| **Cruce / transnacional** | Un viaje que pasa la frontera se registra como dos mitades, una por país, enlazadas por el número de cruce | `transnational_number`, `movement_number`, `agruparPorCruce` |
| **Movimiento** | Cuál mitad del cruce es cada viaje | `siguienteMovimiento` |
| **CI** | Número que se captura en una etapa de cruce; al tenerlo, la etapa pasa de `In Coming` a `In Transit` porque el cruce ya se hizo | `estadoPorCi` |
| **BL** | Documento de embarque de la etapa; se sube firmado | `bl_firmado_doc` |
| **DTOPS** | Documento de la etapa de cruce en viajes de EUA. Subirlo ofrece dar de alta su gasto en Expense Manager (20.80 o 13.45 USD, u otro monto) | `entities/expense/model/dtops.js`, `features/gasto-dtops` |
| **Programación** | Un viaje planeado —camión, operador, caja— que todavía no es viaje. Al aprobarse se convierte en uno | `entities/schedule`, `Programacion_viajes.php` |
| **Pestañas del administrador** | Programación de Viajes · Up Coming · Despacho · En Ruta · Finalizados, cada una con su permiso | `PESTANAS_VIAJES` |
| **Patio / Nuevo Laredo** | De donde salen y a donde vuelven los viajes; las distancias al programar se miden contra él | `NUEVO_LAREDO` |
| **Compañía / broker** | El cliente o intermediario de una etapa | `entities/company`, `companies.nombre_compania` |
| **Bodega** | Almacén de origen o destino | `entities/warehouse` |
| **Millas vacías** | Las que el camión recorre sin carga para llegar al origen; se cobran | `millasTotales`, `emptyMileage` |
| **Cotización** | Precio calculado de un viaje posible: `tarifa = rate × millas` | `entities/quote`, `recalcularTarifa` |

## Unidades y cajas

| Término | Qué es | En el código |
|---|---|---|
| **Unidad** | Camión, caja o conductor: los tres tipos con expediente de documentos | `TIPO_UNIDAD`, `CATALOGO_UNIDAD` |
| **Camión / tractor** | La unidad motriz | `entities/truck`, `trucks.php` |
| **Caja / remolque** | La unidad que lleva la carga | `entities/trailer`, tabla `caja` |
| **Caja propia / externa** | Las de IMA viven en `caja`; las de terceros en otra tabla. Sus ids se repiten, por eso el selector les pone prefijo | `PREFIJO_CAJA`, `caja_externa.php` |
| **Conductor / operador** | Quien maneja. "Operador" es como lo dice la operación; en la base es `drivers` | `entities/driver` |
| **Expediente** | Los documentos que se le exigen a una unidad, con su vencimiento | `entities/unit/model/requisitos.js`, `estadoDocumento` |
| **Requisito** | Un documento que el expediente pide | `esquemaRequisito` |
| **Fianza** | Documento de la caja con vencimiento; la vigente es la de `status = 1` | `cajas_documents`, `TIPO_DOCUMENTO_FIANZA`, `estadoFianza` |
| **Estatus de cajas** | Tablero de dónde está cada caja y si va cargada | `features/estatus-cajas`, `cajas_estatus.php` |
| **Ubicación** | PENSION NLD, PENSION USA, TALLER, MANTENIMIENTO, RUTA SUBIENDO, RUTA BAJANDO, AGENCIA ADUANAL. Las de ruta y PENSION NLD se calculan; las demás solo se capturan | `UBICACION_CAJA` |
| **Observación** | VACIA, CARGADA, CARGANDO, DESCARGANDO. Las dos primeras se calculan; las otras solo se capturan | `OBSERVACION_CAJA` |
| **Status de caja** | Lo que se reporta al marcar *Almost Over*: `Impo`, `Expo` o `Vacio`. En EUA no hay `Expo` | `STATUS_CAJA_POR_PAIS`, tabla `caja_trips_status` |
| **Captura vigente** | Lo capturado a mano vale hasta que la caja cambie de etapa; el comentario no caduca | `caja_estatus.stage_id_referencia`, `manual` |
| **Telemetría / tanque** | Lo que reporta cada unidad: nivel de combustible, posición | `entities/tracking`, `porcentajeTanque` |

## Mantenimiento

| Término | Qué es | En el código |
|---|---|---|
| **Inspección final** | El checklist que el operador llena en el móvil al terminar un viaje | `All_CL_Final`, `cl_final` |
| **Rubro** | Una sección del checklist: Motor, Exterior, Neumáticos, Cabina, Otro (del camión) y Remolque (de la caja) | `RUBROS` |
| **Lado** | Camión o caja. Una misma inspección se trabaja y se cierra por los dos lados por separado | `UNIDAD`, `completarLado` |
| **Punto** | Un renglón del checklist con algo que reparar. Tiene estado: sin resolver, en pendientes, con orden o descartado. Un lado no se cierra con puntos sin resolver | `ESTATUS_PUNTO`, `mtto_puntos` |
| **Reparación pendiente** | Un punto que espera a que la unidad vuelva al taller; también se levanta a mano | `usePendientes`, `crearPendiente` |
| **Orden de servicio** | El trabajo del taller sobre una unidad, con un servicio por reparación. Es de un camión o de una caja, nunca de los dos | `entities/service-order`, `nombreUnidad` |
| **Servicio** | Una reparación dentro de la orden, con su mano de obra y su gasto. Estados: Abierta, Pendiente, Completado | `ESTATUS_ORDEN` |
| **Reparaciones** | La pantalla que junta inspecciones, pendientes y órdenes | `features/maintenance`, ruta `/mantenimiento` |
| **Reparación en ruta** | Una avería atendida durante el viaje (road service). `fecha_suceso` es cuándo pasó; `fecha_registro`, cuándo se capturó | `entities/roadside-repair` |
| **Inspección operativa** | Una revisión hecha al camión en ruta, con sus violaciones y multas (de IMA y del conductor) | `entities/inspection` |
| **Afinación** | Mantenimiento por millaje. Cada camión tiene un límite; al 80 % se marca próxima | `entities/tuning`, `UMBRAL_PROXIMA`, `ESTADO_AFINACION` |
| **Autonomía** | El rendimiento del camión en millas por galón | `entities/autonomy`, `promedioMpg` |
| **Inventario** | Refacciones y consumibles del taller. El gasto que nace de una orden no lo alimenta | `entities/inventory`, `omitir_inventario` |

## Gastos y finanzas

| Término | Qué es | En el código |
|---|---|---|
| **Gasto general** | Un gasto capturado en Expense Manager, con renglones y tickets. Se guarda convertido a dólares | `entities/expense`, `save_expense.php`, `totalUSD` |
| **Tipo, categoría, subcategoría** | La clasificación del gasto, encadenada | `categoriasDeTipo`, `subcategoriasDeCategoria` |
| **Tipo de cambio** | Pesos por dólar del día; convierte para comparar | `useFetchExchangeRate`, `totalMXN` |
| **Gasto de viaje / diesel** | Lo que el operador registra desde el móvil durante un viaje | `formularios.php`, `TIPO_REGISTRO` |
| **Diesel manual** | Una carga capturada a mano en la oficina | `crearRegistroManual`, `esManual` |
| **FleetOne** | El proveedor de las cargas de diesel con el que se concilia | `pendientesDe` |
| **Residuo** | Lo que quedó sin conciliar al cerrar un viaje | `pages/finanzas/ResiduosPage.jsx`, `op=residuo_trip` |
| **Estado de cobro** | Pendiente de cobrar → Cobrada, pendiente de pago → Cobrada, pendiente RTS → Pagada. `null` cuenta como pendiente | `ESTADO_COBRO` |
| **Rate / tarifa** | Lo que se cobra por milla y el total del viaje | `tarifa`, `recalcularTarifa` |
| **Tarifa por milla del conductor** | Lo que se le paga al conductor por milla | `obtenerTarifasConductor` |
| **IFTA** | Impuesto al combustible entre estados de EUA: millas recorridas y galones comprados por estado | `entities/ifta`, `rendimientoEstado` |
| **Safety / cumplimiento** | Los tres documentos que un viaje debe tener al cerrarse: libro electrónico, reporte diesel y reporte PC Miller | `DOCUMENTOS_REQUERIDOS` |

## Nómina

| Término | Qué es | En el código |
|---|---|---|
| **Nómina administrativa** | La del personal de oficina, por semanas | `entities/payroll` |
| **Periodo** | Una semana de pago: Pendiente o Autorizado. Autorizar cierra el corte y no se deshace | `ESTADO_PERIODO` |
| **Fecha de corte** | Hasta dónde abarca el periodo; define quién aparece en el desglose | `fecha_corte` |
| **Tipo de nómina** | MX o US | `TIPO_NOMINA` |
| **Personal** | Los empleados de oficina | `entities/personal` |

## Accesos

| Término | Qué es | En el código |
|---|---|---|
| **Rol** | El papel de la persona. En la base solo hay Admin, Administrativo y Driver; el front lo normaliza a administrador, operaciones, finanzas, mantenimiento, safety, administrativo, operador o consulta | `ROLES`, `normalizarRol` |
| **Rol total** | El que ve todo sin consultar permisos: hoy solo administrador | `ROLES_TOTALES` |
| **Permiso / featureKey** | La clave que habilita una pantalla o una pestaña | `PERMISOS`, `features.php` |
| **Permisos efectivos** | Lo que da el rol más lo que se concede o quita a cada persona | `calcularPermisosEfectivos` |
| **Equipo** | Un grupo de usuarios | `entities/team` |
| **Suscriptor** | Quien recibe las notificaciones de viajes | `useSuscriptores` |
