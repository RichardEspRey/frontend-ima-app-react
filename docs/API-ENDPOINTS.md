# Catálogo de la API PHP

La API vive en `VITE_API_HOST` y es **toda POST con `FormData`**: sin GET, sin JSON,
sin REST. Cada archivo `.php` multiplexa varias operaciones a través del campo `op`.

Responde **HTTP 200 aunque falle**; el fallo viaja en `{status:'error', message}`.

> Extraído del código el 2026-08-31 asociando cada `fetch` con el `op` más cercano, y
> comprobado por muestreo. Es un inventario de lo que el **frontend** llama, no de lo que
> el backend expone: puede haber operaciones que solo use la app móvil y que aquí no
> aparezcan. Se regenera al migrar cada módulo.

## Advertencias

- **No hay HTTPS funcional.** Todo, credenciales incluidas, viaja en claro.
- **La API no autentica.** La identidad es un `id_usuario` entero que manda el cliente.
- **`features.php` · `get_users` devuelve las contraseñas en claro** de todos los
  usuarios, sin pedir autenticación.
- **Hay una app móvil sobre estos mismos endpoints.** Su código no está en este repo,
  así que la columna «Móvil» está sin llenar: antes de cambiar la firma de un `op`,
  hay que preguntar.

## Resumen

- **35 endpoints**, **138 operaciones** distintas llamadas desde el frontend.
- **13** ya pasan por `shared/api` (marcadas ✅); el resto sigue con `fetch()` directo.

| Endpoint | Ops | Migradas |
|---|---:|---:|
| `formularios.php` | 23 | 0 |
| `save_expense.php` | 8 | 0 |
| `service_order.php` | 7 | 0 |
| `teams.php` | 7 | 0 |
| `IFTA.php` | 7 | 0 |
| `new_trips.php` | 6 | 0 |
| `inspecciones.php` | 6 | 0 |
| `features.php` | 6 | 0 |
| `charts.php` | 6 | 0 |
| `drivers.php` | 5 | 2 |
| `roadside_repairs.php` | 5 | 0 |
| `trucks.php` | 5 | 2 |
| `cajas.php` | 5 | 2 |
| `IMA_Docs.php` | 3 | 0 |
| `Programacion_viajes.php` | 3 | 0 |
| `pagos_admin.php` | 3 | 0 |
| `companies.php` | 3 | 1 |
| `Cotizaciones.php` | 3 | 0 |
| `safety.php` | 3 | 0 |
| `personal_admin.php` | 3 | 3 |
| `caja_externa.php` | 2 | 1 |
| `AccessManager.php` | 2 | 0 |
| `trips.php` | 2 | 0 |
| `afinaciones.php` | 2 | 0 |
| `estatus_unidades.php` | 2 | 0 |
| `warehouses.php` | 2 | 1 |
| `drivers_docs.php` | 1 | 0 |
| `update_invoices.php` | 1 | 0 |
| `autonomia.php` | 1 | 0 |
| `trucks_docs.php` | 1 | 0 |
| `cajas_docs.php` | 1 | 0 |
| `inventory.php` | 1 | 0 |
| `Mobile.php` | 1 | 0 |
| `Tracking.php` | 1 | 0 |
| `Auth.php` | 1 | 0 |

## Detalle

### `AccessManager.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `getProfilesAndPermissions` |  | `screens/ProfileAccessManager.jsx` |
| `updatePermission` |  | `screens/ProfileAccessManager.jsx` |

### `Auth.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `new_login` |  | `screens/Login/Login.jsx` |

### `Cotizaciones.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `eliminar` |  | `screens/Viajes/Cotizacion.jsx` |
| `guardar` |  | `screens/Viajes/Cotizacion.jsx` |
| `obtener_todas` |  | `screens/Viajes/Cotizacion.jsx` |

### `IFTA.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `delete_ifta_state` |  | `components/PCMillerModal.jsx` |
| `delete_ifta_trip` |  | `components/PCMillerModal.jsx` |
| `get_ifta_states` |  | `components/PCMillerModal.jsx` |
| `get_ifta_totals_by_state` |  | `screens/Safety/IFTA.jsx` |
| `get_ifta_trips` |  | `screens/Safety/IFTA.jsx` |
| `insert_ifta` |  | `components/PCMillerModal.jsx` |
| `periodos` |  | `screens/Safety/IFTA.jsx` |

### `IMA_Docs.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `Alta` |  | `screens/ImaScreen.jsx` |
| `getAll` |  | `screens/ImaAdmin.jsx`, `screens/ImaScreen.jsx` |
| `getStatus` |  | `components/Sidebar.jsx` |

### `Mobile.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `send_push` |  | `screens/Finanzas/PaymentDrivers.jsx` |

### `Programacion_viajes.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `dashboard` |  | `screens/Viajes/TripAdmin.jsx` |
| `delete` |  | `screens/Dispatch/CrearViaje.jsx`, `screens/Viajes/TripAdmin.jsx` |
| `getAll` |  | `screens/Viajes/TripAdmin.jsx` |

### `Tracking.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `get_dashboard` |  | `screens/Mapas/Tracking.jsx` |

### `afinaciones.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `get_history` |  | `screens/AfinacionesHistory.jsx` |
| `get_maintenance_status` |  | `screens/Afinaciones.jsx` |

### `autonomia.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `get_truck_autonomy` |  | `screens/Autonomia.jsx` |

### `caja_externa.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `Alta` |  | `components/BorderCrossingForm.jsx`, `components/BorderCrossingFormNew.jsx`, `components/BorderCrossingFormNew2.jsx` y 7 más |
| `getCajasExternasActivas` | ✅ | `entities/trailer/api/cajasExternas.js` |

### `cajas.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `Alta` |  | `screens/TrailerScreen.jsx` |
| `editTrailer` |  | `screens/TrailerEdit.jsx` |
| `getCajasActivas` | ✅ | `entities/trailer/api/cajas.js` |
| `getCajasActivasComplete` | ✅ | `entities/trailer/api/cajas.js` |
| `getTrailerEdit` |  | `screens/TrailerEdit.jsx` |

### `cajas_docs.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `Alta` |  | `screens/TrailerEdit.jsx`, `screens/TrailerScreen.jsx` |

### `charts.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `chart_diesel` |  | `screens/Reports.jsx` |
| `chart_diesel_cost` |  | `screens/Reports.jsx` |
| `chart_diesel_table` |  | `screens/Reports.jsx` |
| `chart_finances` |  | `screens/Reports.jsx` |
| `chart_finances_rts` |  | `screens/Reports.jsx` |
| `chart_maintenance_costs` |  | `screens/Reports.jsx` |

### `companies.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `CreateCompany` |  | `components/BorderCrossingForm.jsx`, `components/BorderCrossingFormNew.jsx`, `components/BorderCrossingFormNew2.jsx` y 5 más |
| `getCompanies` | ✅ | `components/InvoiceModal.jsx`, `entities/company/api/companias.js` |
| `save_company_invoice_info` |  | `components/InvoiceModal.jsx` |

### `drivers.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `Alta` |  | `screens/DriverScreen.jsx` |
| `editDriver` |  | `screens/DriverEditor.jsx` |
| `getDriverEdit` |  | `screens/DriverEditor.jsx` |
| `getDriversActivos` | ✅ | `entities/driver/api/conductores.js` |
| `getDriversActivosComplete` | ✅ | `entities/driver/api/conductores.js` |

### `drivers_docs.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `Alta` |  | `screens/DriverEditor.jsx`, `screens/DriverScreen.jsx` |

### `estatus_unidades.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `get_dashboard` |  | `screens/EstatusUnidades.jsx`, `screens/Mapas/Tracking.jsx` |
| `update_config` |  | `screens/EstatusUnidades.jsx`, `screens/Mapas/Tracking.jsx` |

### `features.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `create_user` |  | `screens/AccessManager.jsx` |
| `get_all_user_features` |  | `screens/AccessManager.jsx` |
| `get_user_features` |  | `store/useAuthStore.js` |
| `get_users` |  | `screens/AccessManager.jsx` |
| `toggle_user_feature` |  | `screens/AccessManager.jsx` |
| `update_user` |  | `screens/AccessManager.jsx` |

### `formularios.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `All_CL_Final` |  | `components/Sidebar.jsx` |
| `All_finanzas` |  | `screens/Finanzas.jsx` |
| `All_paymentDrivers` |  | `screens/Finanzas/PaymentDrivers.jsx` |
| `I_pago_stage_bulk` |  | `screens/Finanzas.jsx` |
| `I_update_millasDriverBulk` |  | `screens/Finanzas/MillasDriversTable.jsx` |
| `U_CL_Final` |  | `screens/Mantenimientos/Inspeccion_final.jsx` |
| `add_manual_diesel` |  | `screens/Gastos/DieselDetalle.jsx` |
| `delete_diesel` |  | `screens/Gastos/DieselEditor.jsx` |
| `delete_gasto` |  | `screens/Gastos/GastosEditor.jsx` |
| `edit_diesel` |  | `screens/Gastos/DieselEditor.jsx` |
| `edit_gasto` |  | `screens/Gastos/GastosEditor.jsx` |
| `getAll_diesel` |  | `screens/Gastos/DieselAdmin.jsx` |
| `getAll_gastos` |  | `screens/Gastos/GastosAdmin.jsx` |
| `getTickets` |  | `screens/Gastos/DieselEditor.jsx`, `screens/Gastos/GastosEditor.jsx` |
| `get_all_companies` |  | `screens/Finanzas.jsx` |
| `get_diesel` |  | `screens/Gastos/DieselEditor.jsx` |
| `get_gasto` |  | `screens/Gastos/GastosEditor.jsx` |
| `get_millasDriver` |  | `screens/Finanzas/MillasDriversTable.jsx` |
| `get_registers_diesel` |  | `screens/Gastos/DieselDetalle.jsx` |
| `get_registers_gasto` |  | `components/GastosModal.jsx`, `screens/Finanzas/TicketPayment.jsx`, `screens/Gastos/GastosDetalle.jsx` |
| `get_ticket_pago` |  | `screens/Finanzas/TicketPayment.jsx` |
| `send_ticket_pago` |  | `screens/Finanzas/TicketPayment.jsx` |
| `update_ticket_pago` |  | `screens/Finanzas/PaymentDrivers.jsx` |

### `inspecciones.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `delete_doc` |  | `components/InspectionModal.jsx` |
| `getAll` |  | `screens/InspectionsAdmin.jsx` |
| `get_descriptions` |  | `components/InspectionModal.jsx` |
| `get_trips` |  | `components/InspectionModal.jsx` |
| `get_trucks` |  | `components/InspectionModal.jsx` |
| `save` |  | `components/InspectionModal.jsx` |

### `inventory.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `getFullInventoryList` |  | `screens/StockAdmin.jsx` |

### `new_trips.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `AlmostOverTrip` |  | `screens/Viajes/TripAdmin.jsx` |
| `FinalizeTrip` |  | `screens/Viajes/TripAdmin.jsx` |
| `activate_trip` |  | `screens/Viajes/TripAdmin.jsx` |
| `delete_trip` |  | `screens/Viajes/TripAdmin.jsx` |
| `getById` |  | `screens/Dispatch/EditUpcoming.jsx`, `screens/EditTripComplete.jsx`, `screens/EditTripForm.jsx` |
| `update_invoices` |  | `screens/Dispatch/EditUpcoming.jsx`, `screens/EditTripComplete.jsx`, `screens/EditTripForm.jsx` |

### `pagos_admin.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `authorize` |  | `screens/Nomina/Nomina.jsx` |
| `get_details` |  | `screens/Nomina/DetallePago.jsx` |
| `get_weeks` |  | `screens/Nomina/Nomina.jsx` |

### `personal_admin.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `add` | ✅ | `entities/personal/api/personal.js` |
| `delete` | ✅ | `entities/personal/api/personal.js` |
| `getAll` | ✅ | `entities/personal/api/personal.js` |

### `roadside_repairs.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `delete_doc` |  | `components/RoadRepairModal.jsx` |
| `getAll` |  | `screens/RoadRepairsAdmin.jsx` |
| `get_trips` |  | `components/RoadRepairModal.jsx` |
| `get_trucks` |  | `components/RoadRepairModal.jsx` |
| `save` |  | `components/RoadRepairModal.jsx` |

### `safety.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `delete_doc` |  | `components/DocPreviewModal.jsx`, `components/PCMillerModal.jsx` |
| `get_safety_trips` |  | `screens/Safety/Safety.jsx` |
| `upload_doc` |  | `components/DocPreviewModal.jsx`, `components/PCMillerModal.jsx` |

### `save_expense.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `Alta` |  | `screens/Gastos/ExpenseModal.jsx` |
| `deleteExpense` |  | `components/GastoRow.jsx` |
| `getAllGastos` |  | `screens/Gastos/AdminGastos.jsx` |
| `getAllInventoryItems` |  | `hooks/expense_hooks/useFetchInventoryItems.jsx` |
| `getAllSubcategories` |  | `hooks/expense_hooks/useFetchSubcategories.jsx` |
| `getCategories` |  | `hooks/expense_hooks/useFetchCategories.jsx` |
| `getExpenseTypes` |  | `hooks/expense_hooks/useFetchExpenseTypes.jsx` |
| `getGastoById` |  | `screens/Gastos/ExpenseEdit.jsx` |

### `service_order.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `AltaOrden` |  | `screens/ServiceOrderScreen.jsx` |
| `UpdateOrder` |  | `screens/ServiceOrderScreenEdit.jsx` |
| `getAllOrdersWithDetails` |  | `screens/ServiceOrderAdmin.jsx` |
| `getOrderById` |  | `screens/ServiceOrderScreenEdit.jsx` |
| `getRepairTypes` |  | `hooks/service_order/useFetchRepairTypes.jsx` |
| `getTrucks` |  | `screens/ServiceOrderScreen.jsx`, `screens/ServiceOrderScreenEdit.jsx` |
| `updateDetailStatus` |  | `screens/ServiceOrderAdmin.jsx` |

### `teams.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `create_team` |  | `screens/AccessManager.jsx` |
| `delete_team` |  | `screens/AccessManager.jsx` |
| `edit_team` |  | `screens/AccessManager.jsx` |
| `get_team_users` |  | `screens/AccessManager.jsx` |
| `get_teams` |  | `screens/AccessManager.jsx`, `screens/Dispatch/CrearViaje.jsx` |
| `get_users` |  | `screens/AccessManager.jsx` |
| `save_team_users` |  | `screens/AccessManager.jsx` |

### `trips.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `residuo_trip` |  | `screens/Finanzas/ResiduosTrips.jsx`, `screens/MargenScreen.jsx` |
| `trip_summary` |  | `screens/ResumenTrip.jsx` |

### `trucks.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `Alta` |  | `screens/TruckScreen.jsx` |
| `editTruck` |  | `screens/TrucksEditor.jsx` |
| `getTruckEdit` |  | `screens/TrucksEditor.jsx` |
| `getTrucksActivos` | ✅ | `entities/truck/api/camiones.js` |
| `getTrucksActivosComplete` | ✅ | `entities/truck/api/camiones.js` |

### `trucks_docs.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `Alta` |  | `screens/TruckScreen.jsx`, `screens/TrucksEditor.jsx` |

### `update_invoices.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `update_invoices` |  | `screens/Dispatch/EditUpcoming.jsx`, `screens/EditTripComplete.jsx`, `screens/EditTripForm.jsx` |

### `warehouses.php`

| op | Migrada | Llamada desde |
|---|:--:|---|
| `CreateWarehouse` |  | `components/BorderCrossingForm.jsx`, `components/BorderCrossingFormNew.jsx`, `components/BorderCrossingFormNew2.jsx` y 4 más |
| `getWarehouses` | ✅ | `entities/warehouse/api/bodegas.js` |
