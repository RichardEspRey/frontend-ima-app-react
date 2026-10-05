# IMA Desktop

Aplicación de escritorio para la operación de **IMA Express**: viajes y despacho, estatus
de cajas, gastos y diesel, mantenimiento y reparaciones, finanzas, nómina, safety e IFTA, y
seguimiento de unidades en el mapa.

**Electron + React 19 + Vite + MUI 7**, con TanStack Query y zod frente a una API PHP.

```bash
npm ci
cp .env.example .env     # VITE_API_HOST apunta a la API
npm run dev              # http://localhost:5173
```

> La app local trabaja contra **producción**: no hay ambiente de pruebas. Guardar desde la
> pantalla escribe datos reales.

## Documentación

| Para | Lee |
|---|---|
| Arrancar desde cero | [`docs/ONBOARDING.md`](docs/ONBOARDING.md) |
| Entender la estructura | [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) |
| Construir una pantalla o un componente | [`docs/CREAR-UNA-PANTALLA.md`](docs/CREAR-UNA-PANTALLA.md) |
| Las reglas y su porqué | [`docs/ESTANDAR-DE-INGENIERIA.md`](docs/ESTANDAR-DE-INGENIERIA.md) |
| Convenciones del repo | [`docs/CONTRIBUYENDO.md`](docs/CONTRIBUYENDO.md) |
| El vocabulario del negocio | [`docs/GLOSARIO.md`](docs/GLOSARIO.md) |
| Todo lo demás | [`docs/README.md`](docs/README.md) |

## Comandos

```bash
npm run dev              # servidor de desarrollo
npm test                 # pruebas (vitest)
npm run lint             # arquitectura, JSDoc y seguridad
npm run build            # compila a dist/
npm start                # Electron sobre dist/
npm run dist             # empaqueta el instalador
npm run docs:api         # regenera docs/api/ desde el JSDoc
npm run estandar:medir   # mide la deuda contra el estándar
```
