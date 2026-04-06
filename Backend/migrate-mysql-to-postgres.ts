/**
 * migrate-mysql-to-postgres.ts
 *
 * Lee todos los datos de MySQL y los inserta en PostgreSQL.
 * Ejecutar UNA sola vez: npx ts-node migrate-mysql-to-postgres.ts
 *
 * Orden de inserción respeta foreign keys:
 *   usuarios → espacios → imagenes_espacio → reservaciones
 *   → pagos → documentos → mantenimientos
 */

import "dotenv/config";
import mysql from "mysql2/promise";
import { Pool as PgPool } from "pg";

// ── Conexión MySQL (mismos defaults que db.ts) ───────────────────────────────
const mysqlPool = mysql.createPool({
  host:     process.env.DB_HOST     ?? "localhost",
  port:     Number(process.env.DB_PORT ?? 3307),
  user:     process.env.DB_USER     ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME     ?? "nopales",
  charset:  "utf8mb4",
});

// ── Conexión PostgreSQL ───────────────────────────────────────────────────────
const pgPool = new PgPool({
  host:     process.env.PG_HOST     || "localhost",
  port:     Number(process.env.PG_PORT || 5432),
  user:     process.env.PG_USER     || "postgres",
  password: process.env.PG_PASSWORD || undefined,
  database: process.env.PG_NAME     || "nopales",
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convierte un valor DATE de MySQL (objeto Date) a string 'YYYY-MM-DD'. */
function toDateStr(val: unknown): string | null {
  if (val == null) return null;
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    const d = String(val.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(val).substring(0, 10);
}

/** Convierte un DATETIME/TIMESTAMP de MySQL a ISO string para PostgreSQL. */
function toTimestamp(val: unknown): string | null {
  if (val == null) return null;
  if (val instanceof Date) return val.toISOString();
  return String(val);
}

/** Convierte un valor TIME de MySQL ('HH:MM:SS') — PostgreSQL lo acepta igual. */
function toTime(val: unknown): string | null {
  if (val == null) return null;
  return String(val).substring(0, 8);
}

function n(val: unknown): number | null {
  if (val == null) return null;
  return Number(val);
}

function s(val: unknown): string | null {
  if (val == null) return null;
  return String(val);
}

// ── Migración por tabla ───────────────────────────────────────────────────────

async function migrarUsuarios(rows: Record<string, unknown>[]) {
  console.log(`  → Migrando ${rows.length} usuarios...`);
  for (const r of rows) {
    await pgPool.query(
      `INSERT INTO usuarios (id, nombre, correo, hash_contrasena, rol, creado_en)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [s(r.id), s(r.nombre), s(r.correo), s(r.hash_contrasena), s(r.rol), toTimestamp(r.creado_en)]
    );
  }
}

async function migrarEspacios(rows: Record<string, unknown>[]) {
  console.log(`  → Migrando ${rows.length} espacios...`);
  for (const r of rows) {
    await pgPool.query(
      `INSERT INTO espacios (id, nombre, tipo, ubicacion, capacidad, costo_hora, estado, descripcion, reglas, horario_disponible, creado_en)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO NOTHING`,
      [
        s(r.id), s(r.nombre), s(r.tipo), s(r.ubicacion),
        n(r.capacidad), n(r.costo_hora), s(r.estado),
        r.descripcion ?? null, r.reglas ?? null, r.horario_disponible ?? null,
        toTimestamp(r.creado_en),
      ]
    );
  }
}

async function migrarImagenesEspacio(rows: Record<string, unknown>[]) {
  console.log(`  → Migrando ${rows.length} imagenes_espacio...`);
  for (const r of rows) {
    await pgPool.query(
      `INSERT INTO imagenes_espacio (id, espacio_id, url, created_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING`,
      [s(r.id), s(r.espacio_id), s(r.url), toTimestamp(r.created_at)]
    );
  }
}

async function migrarReservaciones(rows: Record<string, unknown>[]) {
  console.log(`  → Migrando ${rows.length} reservaciones...`);
  for (const r of rows) {
    await pgPool.query(
      `INSERT INTO reservaciones
         (id, folio, espacio_id, usuario_id, solicitante_nombre, tipo_evento, descripcion_evento,
          fecha, hora_inicio, hora_fin, asistentes, estado, reembolso_estado, reembolso_monto, creado_en)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT (id) DO NOTHING`,
      [
        s(r.id), s(r.folio), s(r.espacio_id), r.usuario_id ?? null,
        s(r.solicitante_nombre), s(r.tipo_evento), r.descripcion_evento ?? null,
        toDateStr(r.fecha), toTime(r.hora_inicio), toTime(r.hora_fin),
        n(r.asistentes), s(r.estado),
        r.reembolso_estado ?? null, r.reembolso_monto != null ? n(r.reembolso_monto) : null,
        toTimestamp(r.creado_en),
      ]
    );
  }
}

async function migrarPagos(rows: Record<string, unknown>[]) {
  console.log(`  → Migrando ${rows.length} pagos...`);
  for (const r of rows) {
    await pgPool.query(
      `INSERT INTO pagos (id, reservacion_id, monto, estado, metodo, referencia, fecha_pago, creado_en)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        s(r.id), s(r.reservacion_id), n(r.monto), s(r.estado), s(r.metodo),
        r.referencia ?? null, r.fecha_pago ? toDateStr(r.fecha_pago) : null,
        toTimestamp(r.creado_en),
      ]
    );
  }
}

async function migrarDocumentos(rows: Record<string, unknown>[]) {
  console.log(`  → Migrando ${rows.length} documentos...`);
  for (const r of rows) {
    await pgPool.query(
      `INSERT INTO documentos (id, reservacion_id, tipo, nombre_archivo, contenido, pdf_path, creado_en)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [
        s(r.id), s(r.reservacion_id), s(r.tipo), s(r.nombre_archivo),
        s(r.contenido), r.pdf_path ?? null, toTimestamp(r.creado_en),
      ]
    );
  }
}

async function migrarMantenimientos(rows: Record<string, unknown>[]) {
  console.log(`  → Migrando ${rows.length} mantenimientos...`);
  for (const r of rows) {
    await pgPool.query(
      `INSERT INTO mantenimientos (id, espacio_id, fecha_inicio, fecha_fin, motivo, creado_en)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [
        s(r.id), s(r.espacio_id),
        toTimestamp(r.fecha_inicio), toTimestamp(r.fecha_fin),
        s(r.motivo), toTimestamp(r.creado_en),
      ]
    );
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Migración MySQL → PostgreSQL ===\n");

  // Verificar conexiones
  try {
    await mysqlPool.query("SELECT 1");
    console.log("✓ MySQL conectado");
  } catch (e) {
    console.error("✗ No se pudo conectar a MySQL:", e);
    process.exit(1);
  }

  try {
    await pgPool.query("SELECT 1");
    console.log("✓ PostgreSQL conectado\n");
  } catch (e) {
    console.error("✗ No se pudo conectar a PostgreSQL:", e);
    process.exit(1);
  }

  // Leer todas las tablas de MySQL
  const [usuarios]        = await mysqlPool.query("SELECT * FROM usuarios");
  const [espacios]        = await mysqlPool.query("SELECT * FROM espacios");
  const [imagenes]        = await mysqlPool.query("SELECT * FROM imagenes_espacio");
  const [reservaciones]   = await mysqlPool.query("SELECT * FROM reservaciones");
  const [pagos]           = await mysqlPool.query("SELECT * FROM pagos");
  const [documentos]      = await mysqlPool.query("SELECT * FROM documentos");
  const [mantenimientos]  = await mysqlPool.query("SELECT * FROM mantenimientos");

  // Insertar en PostgreSQL en orden de dependencias
  await migrarUsuarios       (usuarios       as Record<string, unknown>[]);
  await migrarEspacios       (espacios       as Record<string, unknown>[]);
  await migrarImagenesEspacio(imagenes       as Record<string, unknown>[]);
  await migrarReservaciones  (reservaciones  as Record<string, unknown>[]);
  await migrarPagos          (pagos          as Record<string, unknown>[]);
  await migrarDocumentos     (documentos     as Record<string, unknown>[]);
  await migrarMantenimientos (mantenimientos as Record<string, unknown>[]);

  console.log("\n✓ Migración completada sin errores.");

  await mysqlPool.end();
  await pgPool.end();
}

main().catch((err) => {
  console.error("\n✗ Error durante la migración:", err);
  process.exit(1);
});
