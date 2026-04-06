import pool from "../lib/db.postgres";

export interface DashboardMetricas {
  solicitudesPendientes: number;
  reservacionesSaldoPendiente: number;
  mantenimientosActivos: number;
  espaciosActivos: number;
  reservacionesHoy: number;
  ingresosMes: number;
}

export interface EspacioUtilizado {
  nombre: string;
  reservaciones: number;
  ocupacion: number;
}

export interface ActividadItem {
  id: string;
  tipo: "reservacion" | "pago";
  descripcion: string;
  usuario: string;
  fecha: string;
  estado: string;
}

export interface SolicitudPendiente {
  id: string;
  solicitante: string;
  espacio: string;
  tipo: string;
  fecha: string;
  estado: string;
}

export const dashboardRepository = {
  async getMetricas(): Promise<DashboardMetricas> {
    // Reservaciones en estado pendiente_revision
    const { rows: [resRow] } = await pool.query(
      `SELECT COUNT(*) AS total FROM reservaciones WHERE estado = 'pendiente_revision'`
    );

    // Reservaciones con saldo pendiente: activas donde lo pagado < monto total calculado.
    // EXTRACT(EPOCH FROM (hora_fin - hora_inicio)) reemplaza TIME_TO_SEC de MySQL.
    const { rows: [saldoPendRow] } = await pool.query(
      `SELECT COUNT(*) AS total
       FROM reservaciones r
       JOIN espacios e ON e.id = r.espacio_id
       WHERE r.estado NOT IN ('cancelada', 'rechazada', 'finalizada')
         AND COALESCE(
           (SELECT SUM(p.monto) FROM pagos p
            WHERE p.reservacion_id = r.id AND p.estado != 'cancelado'),
           0
         ) < ROUND(e.costo_hora * EXTRACT(EPOCH FROM (r.hora_fin - r.hora_inicio)) / 3600, 2)`
    );

    // Mantenimientos activos o futuros
    const { rows: [mantoRow] } = await pool.query(
      `SELECT COUNT(*) AS total FROM mantenimientos WHERE fecha_fin >= NOW()`
    );

    // Espacios activos
    const { rows: [espaciosRow] } = await pool.query(
      `SELECT COUNT(*) AS total FROM espacios WHERE estado = 'activo'`
    );

    // Reservaciones de hoy — CURRENT_DATE reemplaza CURDATE() de MySQL
    const { rows: [hoyRow] } = await pool.query(
      `SELECT COUNT(*) AS total
       FROM reservaciones
       WHERE fecha = CURRENT_DATE
         AND estado NOT IN ('cancelada', 'rechazada')`
    );

    // Ingresos del mes — EXTRACT reemplaza MONTH() y YEAR() de MySQL
    const { rows: [ingresosRow] } = await pool.query(
      `SELECT COALESCE(SUM(monto), 0) AS total
       FROM pagos
       WHERE estado = 'pagado'
         AND EXTRACT(MONTH FROM fecha_pago) = EXTRACT(MONTH FROM CURRENT_DATE)
         AND EXTRACT(YEAR  FROM fecha_pago) = EXTRACT(YEAR  FROM CURRENT_DATE)`
    );

    return {
      solicitudesPendientes:        Number(resRow.total),
      reservacionesSaldoPendiente:  Number(saldoPendRow.total),
      mantenimientosActivos:        Number(mantoRow.total),
      espaciosActivos:              Number(espaciosRow.total),
      reservacionesHoy:             Number(hoyRow.total),
      ingresosMes:                  Number(ingresosRow.total),
    };
  },

  async getEspaciosMasUtilizados(): Promise<EspacioUtilizado[]> {
    const { rows } = await pool.query(`
      SELECT
        e.nombre,
        COUNT(r.id) AS reservaciones
      FROM espacios e
      LEFT JOIN reservaciones r
        ON r.espacio_id = e.id
        AND r.estado NOT IN ('cancelada', 'rechazada')
      GROUP BY e.id, e.nombre
      ORDER BY reservaciones DESC
      LIMIT 5
    `);

    const maxRes = rows.length > 0 ? Number(rows[0].reservaciones) : 1;

    return rows.map((row: any) => ({
      nombre: row.nombre as string,
      reservaciones: Number(row.reservaciones),
      ocupacion: maxRes > 0
        ? Math.round((Number(row.reservaciones) / maxRes) * 100)
        : 0,
    }));
  },

  async getActividadReciente(): Promise<ActividadItem[]> {
    const { rows: resRows } = await pool.query(`
      SELECT
        r.id,
        'reservacion'                              AS tipo,
        CONCAT(e.nombre, ' — ', r.tipo_evento)    AS descripcion,
        r.solicitante_nombre                       AS usuario,
        r.creado_en                                AS fecha,
        r.estado
      FROM reservaciones r
      JOIN espacios e ON e.id = r.espacio_id
      ORDER BY r.creado_en DESC
      LIMIT 4
    `);

    const { rows: pagoRows } = await pool.query(`
      SELECT
        p.id,
        'pago'                                     AS tipo,
        CONCAT('Pago ', e.nombre)                  AS descripcion,
        r.solicitante_nombre                       AS usuario,
        p.creado_en                                AS fecha,
        p.estado
      FROM pagos p
      JOIN reservaciones r ON r.id = p.reservacion_id
      JOIN espacios e ON e.id = r.espacio_id
      ORDER BY p.creado_en DESC
      LIMIT 4
    `);

    const combined = [...resRows, ...pagoRows]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 6);

    return combined.map((row: any) => ({
      id: row.id as string,
      tipo: row.tipo as "reservacion" | "pago",
      descripcion: row.descripcion as string,
      usuario: row.usuario as string,
      fecha: formatRelative(new Date(row.fecha)),
      estado: row.estado as string,
    }));
  },

  async getSolicitudesPendientes(): Promise<SolicitudPendiente[]> {
    const { rows } = await pool.query(`
      SELECT
        r.folio              AS id,
        r.solicitante_nombre AS solicitante,
        e.nombre             AS espacio,
        r.tipo_evento        AS tipo,
        r.fecha,
        r.estado
      FROM reservaciones r
      JOIN espacios e ON e.id = r.espacio_id
      WHERE r.estado = 'pendiente_revision'
      ORDER BY r.creado_en ASC
      LIMIT 20
    `);

    return rows.map((row: any) => ({
      id: row.id as string,
      solicitante: row.solicitante as string,
      espacio: row.espacio as string,
      tipo: row.tipo as string,
      fecha: toDateStr(row.fecha),
      estado: "pendiente",
    }));
  },
};

function toDateStr(val: unknown): string {
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    const d = String(val.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(val).substring(0, 10);
}

function formatRelative(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Hace un momento";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH} hora${diffH > 1 ? "s" : ""}`;
  const diffD = Math.floor(diffH / 24);
  return `Hace ${diffD} día${diffD > 1 ? "s" : ""}`;
}
