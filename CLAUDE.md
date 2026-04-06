# CLAUDE.md — Nopales v2

Contexto completo del proyecto para sesiones de desarrollo. Léelo antes de cualquier tarea.

---

## Qué hace el proyecto

**Nopales v2** es un sistema municipal de gestión de espacios públicos. Permite a ciudadanos reservar espacios (plazas, auditorios, canchas, etc.), pagar, y obtener contratos digitales. Los administradores gestionan los espacios, aprueban/rechazan solicitudes, registran pagos, programan mantenimientos y generan reportes.

**Dos perfiles de usuario:**
- **Admin**: panel completo de gestión
- **Ciudadano**: portal para reservar, pagar y descargar contratos

---

## Stack tecnológico

### Backend (`/Backend`)
| Tecnología | Versión | Uso |
|---|---|---|
| Node.js + TypeScript | TS 5.9.3 | Runtime y tipado |
| Express | 5.2.1 | Framework REST |
| MySQL2 | 3.20.0 | Base de datos (pool con `mysql2/promise`) |
| Zod | 4.3.6 | Validación de schemas en controllers |
| bcryptjs | 3.0.3 | Hash de contraseñas (salt=10) |
| jsonwebtoken | 9.0.3 | Auth JWT (cookie httpOnly, 7 días) |
| multer | 2.1.1 | Subida de imágenes |
| puppeteer | 24.40.0 | Generación de PDFs (HTML → PDF) |
| ts-node-dev | — | Dev server con hot reload (`--respawn --transpile-only`) |

### Frontend (`/Frontend`)
| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.3.1 | UI |
| Vite + SWC | 5.4.19 | Build tool, dev server en puerto 8080 |
| TypeScript | — | Tipado (modo permisivo: `noImplicitAny=false`) |
| Tailwind CSS | 3.4.17 | Estilos (colores custom: warning, success, info) |
| shadcn/ui + Radix UI | — | Componentes base (Button, Dialog, Select, etc.) |
| TanStack React Query | 5.83.0 | Fetching y caché de datos |
| React Router | 6.30.1 | Routing |
| date-fns | — | Formateo y manipulación de fechas |
| sonner | — | Toasts (primario) |
| lucide-react | — | Iconografía |
| recharts | 2.15.4 | Gráficas en dashboard |

---

## Estructura del proyecto

```
nopales-v2/
├── Backend/
│   ├── src/
│   │   ├── controllers/        # Reciben Request, validan con Zod, llaman service, retornan Response
│   │   ├── services/           # Lógica de negocio, reglas de validación complejas
│   │   ├── repositories/       # Acceso a MySQL, mapeo de rows a objetos TS
│   │   ├── routes/             # Montaje de rutas + middleware requireAuth
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts    # requireAuth: extrae JWT de cookie, pone req.usuario
│   │   ├── validators/         # Zod schemas exportados (usados en controllers)
│   │   │   ├── espacios.schema.ts
│   │   │   ├── reservaciones.schema.ts
│   │   │   ├── pagos.schema.ts
│   │   │   └── documentos.schema.ts
│   │   ├── lib/
│   │   │   ├── db.ts           # Pool MySQL (host:localhost, port:3307, db:nopales)
│   │   │   ├── pdf.ts          # generatePdf(html): Puppeteer HTML→PDF
│   │   │   └── upload.ts       # Multer config para imágenes
│   │   ├── types/
│   │   │   └── express.d.ts    # Augmenta Express.Request con req.usuario
│   │   └── server.ts           # Entry point, puerto 3000
│   ├── uploads/                # Archivos subidos (imágenes y PDFs) — NO en git
│   │   ├── espacios/           # Imágenes de espacios (UUID.ext)
│   │   └── contratos/          # PDFs generados
│   └── .env                    # DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, FRONTEND_URL
│
└── Frontend/
    ├── src/
    │   ├── components/
    │   │   ├── admin/          # Componentes del panel admin reutilizables
    │   │   │   ├── DataTable.tsx      # Tabla genérica con Column<T>[]
    │   │   │   ├── FilterBar.tsx      # Barra de filtros
    │   │   │   ├── PageHeader.tsx     # Título + actions (prop: actions, NO action)
    │   │   │   ├── StatCard.tsx       # Tarjeta de métricas
    │   │   │   ├── StatusBadge.tsx    # Badge visual por estado (ver sección estados)
    │   │   │   ├── ConfirmDialog.tsx  # Dialogo de confirmación de eliminación
    │   │   │   └── EmptyState.tsx     # Estado vacío
    │   │   ├── layout/
    │   │   │   ├── AppLayout.tsx      # Layout admin (con AppSidebar)
    │   │   │   ├── AppSidebar.tsx     # Sidebar admin
    │   │   │   ├── Topbar.tsx         # Header admin (search URL-based ?q=, bells ocultos)
    │   │   │   ├── UserLayout.tsx     # Layout ciudadano
    │   │   │   ├── UserSidebar.tsx    # Sidebar ciudadano
    │   │   │   └── UserTopbar.tsx     # Header ciudadano (bells ocultos)
    │   │   ├── ProtectedRoute.tsx     # Guard de rutas por rol
    │   │   └── ui/             # Componentes shadcn/ui (NO modificar directamente)
    │   ├── context/
    │   │   └── AuthContext.tsx  # useAuth() — usuario, isLoading, login, logout
    │   ├── pages/
    │   │   ├── auth/           # Login
    │   │   ├── espacios/       # EspaciosLista, EspacioDetalle, EspacioForm
    │   │   ├── reservaciones/  # ReservacionesLista, ReservacionDetalle, ReservacionForm
    │   │   ├── pagos/          # PagosLista, PagoDetalle, PagoForm
    │   │   ├── contratos/      # ContratosLista
    │   │   ├── usuarios/       # UsuariosLista (admin)
    │   │   ├── mantenimientos/ # MantenimientosLista
    │   │   ├── calendario/     # CalendarioView
    │   │   ├── user/           # Portal ciudadano (UserDashboard, UserEspacios, etc.)
    │   │   └── Index.tsx       # Dashboard admin
    │   ├── lib/
    │   │   ├── api.ts           # Todas las llamadas al backend (fetchJSON con credentials)
    │   │   ├── queryClient.ts   # Singleton QueryClient compartido
    │   │   ├── espacio-utils.ts # getEstadoVisualEspacio(espacio, mantenimientos)
    │   │   └── utils.ts         # cn() para Tailwind class merging
    │   ├── data/               # Mock data (calendarioMock, espaciosMock, etc.) — legacy
    │   ├── hooks/
    │   │   ├── use-mobile.ts
    │   │   └── use-toast.ts
    │   └── App.tsx             # Router + providers (QueryClient, Auth, Router, Toasters)
    ├── vite.config.ts          # Puerto 8080, alias @ → ./src
    └── tailwind.config.ts      # Colores custom: warning, success, info, sidebar-*
```

---

## Base de datos

**Puerto**: 3307 (no el 3306 estándar)
**Nombre**: `nopales`
**Charset**: `utf8mb4`

### Tablas principales

| Tabla | Campos clave |
|---|---|
| `usuarios` | id, nombre, correo, hash_contrasena, rol (admin\|ciudadano), creado_en |
| `espacios` | id, nombre, tipo, ubicacion, capacidad, costo_hora, estado (activo\|inactivo), descripcion, reglas, horario_disponible |
| `reservaciones` | id, folio (RES-YYYY-###), espacio_id, usuario_id, solicitante_nombre, tipo_evento, fecha (DATE), hora_inicio, hora_fin (TIME), asistentes, estado, reembolso_estado, reembolso_monto |
| `pagos` | id, reservacion_id, monto, estado (pendiente\|pagado\|cancelado), metodo (efectivo\|transferencia\|tarjeta), referencia, fecha_pago |
| `documentos` | id, reservacion_id, tipo (contrato), nombre_archivo, contenido (HTML), pdf_path |
| `mantenimientos` | id, espacio_id, fecha_inicio (DATETIME), fecha_fin (DATETIME), motivo |
| `imagenes_espacio` | id, espacio_id, url, created_at |

**Importante MySQL2**: Los campos DATETIME se devuelven como objetos `Date` en Node.js (no strings). Los repositories usan `toISOStr(val)` para convertirlos a ISO strings antes de retornar.

---

## Patrones y convenciones de código

### Backend: Patrón Controller → Service → Repository

```
Request → Controller (valida con Zod) → Service (lógica de negocio) → Repository (SQL) → Response
```

- **Controllers**: Solo validan input (Zod), llaman service, retornan JSON. Errores del service → 400/404/409/500.
- **Services**: Toda la lógica de negocio. Lanzan `Error("mensaje")` que los controllers atrapan.
- **Repositories**: Solo SQL. Cada función mapea rows a interfaces TS con funciones `toXxx(row)`.

### Backend: Convenciones de naming

- DB columns: `snake_case` (`espacio_id`, `fecha_inicio`)
- TS interfaces / objetos: `camelCase` (`espacioId`, `fechaInicio`)
- Los repositories hacen el mapeo explícito: `row.espacio_id as string → espacioId`
- UUIDs generados con `crypto.randomUUID()` (Node.js built-in)

### Backend: Patrón de mapeo en repositories

```typescript
function toEspacio(row: Record<string, unknown>): Espacio {
  return {
    id: row.id as string,
    nombre: row.nombre as string,
    // ... mapeo explícito de cada campo
  };
}
```

### Frontend: React Query

- **Query keys**: strings simples `["espacios"]`, `["reservaciones"]`, `["mantenimientos"]`
- **Invalidación**: siempre con `queryClient.invalidateQueries({ queryKey: ["clave"] })`
- **Default staleTime**: 0 (siempre refresca al montar)
- **refetchInterval**: Se usa en `EspaciosLista` y `EspacioDetalle` para mantenimientos (60s)
- **Error handling**: `onError: (err: any) => { const msg = err?.data?.error ?? err?.message }`

### Frontend: URL-based search

Las páginas con búsqueda usan `useSearchParams` para el estado `?q=`, NO `useState`. Esto sincroniza el header Topbar con las FilterBars de cada página.

```typescript
const [searchParams, setSearchParams] = useSearchParams();
const search = searchParams.get("q") ?? "";
```

### Frontend: StatusBadge

Todos los estados se muestran con `<StatusBadge estado={string} />`. El componente tiene un mapa estático de estado→{label, className}. Siempre agregar estados nuevos a ese mapa en `components/admin/StatusBadge.tsx`.

### Frontend: Estado de espacios (IMPORTANTE)

El campo `espacio.estado` en DB solo tiene dos valores: `"activo"` | `"inactivo"`. El estado `"en_mantenimiento"` es **derivado**, nunca guardado en DB.

```typescript
// lib/espacio-utils.ts
getEstadoVisualEspacio(espacio, mantenimientos, now?)
// Retorna "en_mantenimiento" si hay un mantenimiento activo ahora mismo
// Retorna espacio.estado en caso contrario
```

Usarlo en: `EspaciosLista`, `EspacioDetalle`, y cualquier lugar que muestre estado de espacio.

---

## Flujos de negocio críticos

### Ciclo de vida de una reservación

```
pendiente_revision
  ├─→ aprobada → [en_uso] → finalizada
  │       └─→ cancelada (solo si aún no empezó)
  ├─→ rechazada
  └─→ cancelada
```

Al cancelar con pago previo: `reembolso_estado = "pendiente"`, `reembolso_monto = totalPagado`.
Sin pago previo: `reembolso_estado = "no_aplica"`.

### Estado financiero de reservación

Calculado en `reservacionesService` a partir de `pagos`:
- `pendiente`: sin pagos recibidos
- `anticipo`: pagos parciales
- `pagado`: totalPagado >= montoTotal

### Generación de contrato

Requisitos: reservación `aprobada` + `saldoPendiente = 0`.
Flujo: `generarContrato` → genera HTML → guarda en DB. Luego `generarPdfContrato` → Puppeteer → guarda PDF en disco.

### Prevención de conflictos al crear mantenimiento

1. No solapar con otro mantenimiento del mismo espacio
2. No solapar con reservaciones activas (`pendiente_revision`, `aprobada`, `en_uso`)

---

## API Client — convenciones

Archivo: `Frontend/src/lib/api.ts`

- `API_BASE = "http://localhost:3000"` (hardcodeado)
- Todas las llamadas usan `credentials: "include"` (cookies)
- Errores: `throw new ApiError(status, data)` → `err.status` y `err.data.error`
- El mapeo `EspacioRaw → EspacioAPI` renombra `costoHora → costoPorHora`

Agregar endpoints nuevos siempre en este archivo, exportando la función y sus tipos.

---

## Autenticación

- JWT en cookie `auth_token` (httpOnly, sameSite=lax, 7 días)
- Backend: `requireAuth` middleware → pone `req.usuario = { id, rol }`
- Frontend: `AuthContext` verifica sesión con `GET /api/auth/me` al montar la app
- Logout: limpia cookie + localStorage + `queryClient.clear()`
- **Roles**: `"admin"` y `"ciudadano"` (enum en DB, TypeScript y Zod)

---

## Variables de entorno

### Backend `.env`
```
JWT_SECRET=nopales_secret_cambia_esto_en_produccion
FRONTEND_URL=http://localhost:8080
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=
DB_NAME=nopales
```

### Frontend
No tiene `.env`. `API_BASE` hardcodeado en `lib/api.ts` como `"http://localhost:3000"`.

---

## Comandos de desarrollo

```bash
# Backend (desde /Backend)
npm run dev          # ts-node-dev con hot reload, puerto 3000

# Frontend (desde /Frontend)
npm run dev          # Vite, puerto 8080
```

---

## Decisiones arquitectónicas relevantes

### 1. `en_mantenimiento` es estado derivado, no almacenado
`espacio.estado` solo puede ser `activo` o `inactivo`. El badge "En mantenimiento" se calcula en runtime comparando con la tabla `mantenimientos`. Esto evita inconsistencias y tiene una sola fuente de verdad. Ver `lib/espacio-utils.ts`.

### 2. Búsqueda con URL params (`?q=`)
El header Topbar y las FilterBars de cada página comparten estado de búsqueda via `useSearchParams`. El Topbar escribe `?q=valor`, las páginas lo leen. Soportado en: `/espacios`, `/reservaciones`, `/pagos`, `/usuarios`.

### 3. QueryClient como singleton
`lib/queryClient.ts` exporta un singleton para poder llamar `queryClient.clear()` desde `AuthContext` al hacer logout, sin necesitar el hook `useQueryClient`.

### 4. Sin sistema de migraciones
El schema de DB se crea manualmente. No hay archivos de migración ni seeds.

### 5. PDF generado con Puppeteer desde HTML
El contrato se construye como string HTML en `documentosService.generarContrato()`, se guarda en DB como `contenido`, y se convierte a PDF bajo demanda con Puppeteer. Los PDFs se sirven desde `/uploads/contratos/`.

### 6. Imágenes con nombres UUID en disco
Las imágenes de espacios se guardan con `randomUUID() + ext` en `uploads/espacios/`. La URL guardada en DB es `/uploads/espacios/{uuid}.{ext}`. El frontend la construye con `getImagenUrl(url)` que prefija `API_BASE`.

### 7. Folio de reservación auto-generado
Formato `RES-{año}-{número secuencial 3 dígitos}`. El repositorio consulta el COUNT de reservaciones del año para generar el siguiente número.

### 8. `PageHeader` usa prop `actions` (plural)
El componente `PageHeader` recibe la prop `actions` (no `action`). Error frecuente al agregar botones a páginas nuevas.

---

## Gotchas y errores frecuentes

| Problema | Causa | Fix |
|---|---|---|
| Badge muestra "Desconocido" para espacio | Falta el estado en el mapa de `StatusBadge.tsx` | Agregar la entrada al `statusConfig` |
| Espacio sigue "activo" tras crear mantenimiento | El mantenimiento inicia en el futuro (revisar hora) | Normal — `getEstadoVisualEspacio` solo activa durante el periodo |
| `PageHeader` sin botón aunque se pasó prop | Se usó `action` en vez de `actions` | Cambiar a `actions` |
| `req.usuario` undefined en controller | Falta `requireAuth` en la ruta | Agregar middleware a la ruta en routes/ |
| Fecha DATETIME llega con 5-6h de diferencia | MySQL2 convierte DATETIME a UTC con timezone local | Esperado — las fechas del frontend se envían como strings locales, MySQL2 las interpreta con el timezone del servidor |
| `espaciosRepository is not defined` | Import eliminado pero uso no eliminado | Verificar que no queden referencias al import borrado |

---

## Archivos que NO existen (no generar ni buscar)

- `.env.example` — no existe, usar la sección de env vars aquí
- Archivos de migración SQL — no existen
- `swagger.yaml` / documentación de API — no existe
- Tests E2E (Playwright configurado pero sin tests implementados)
