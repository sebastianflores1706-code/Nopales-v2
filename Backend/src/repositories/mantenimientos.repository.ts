import { randomUUID } from "crypto";
import pool from "../lib/db";

export interface Mantenimiento {
  id: string;
  espacioId: string;
  espacioNombre: string;
  fechaInicio: string;
  fechaFin: string;
  motivo: string;
  creadoEn: string;
}

function toISOStr(val: unknown): string {
  if (val instanceof Date) return val.toISOString();
  return String(val ?? "");
}

function toMantenimiento(row: Record<string, unknown>): Mantenimiento {
  return {
    id: row.id as string,
    espacioId: row.espacio_id as string,
    espacioNombre: (row.espacio_nombre ?? "") as string,
    fechaInicio: toISOStr(row.fecha_inicio),
    fechaFin: toISOStr(row.fecha_fin),
    motivo: row.motivo as string,
    creadoEn: toISOStr(row.creado_en),
  };
}

const SELECT_CON_ESPACIO = `
  SELECT m.*, e.nombre AS espacio_nombre
  FROM mantenimientos m
  LEFT JOIN espacios e ON e.id = m.espacio_id
`;

export const mantenimientosRepository = {
  async findAll(): Promise<Mantenimiento[]> {
    const [rows] = await pool.query(
      `${SELECT_CON_ESPACIO} ORDER BY m.fecha_inicio ASC`
    );
    return (rows as Record<string, unknown>[]).map(toMantenimiento);
  },

  async findById(id: string): Promise<Mantenimiento | undefined> {
    const [rows] = await pool.query(
      `${SELECT_CON_ESPACIO} WHERE m.id = ?`,
      [id]
    );
    const list = rows as Record<string, unknown>[];
    if (list.length === 0) return undefined;
    return toMantenimiento(list[0]);
  },

  // Mantenimientos del mismo espacio que se traslapen con [fechaInicio, fechaFin)
  async findTraslapeMantenimiento(
    espacioId: string,
    fechaInicio: string,
    fechaFin: string,
    excludeId?: string
  ): Promise<Mantenimiento[]> {
    const params: unknown[] = [espacioId, fechaFin, fechaInicio];
    let query = `
      ${SELECT_CON_ESPACIO}
      WHERE m.espacio_id = ?
        AND m.fecha_inicio < ?
        AND m.fecha_fin > ?
    `;
    if (excludeId) {
      query += " AND m.id != ?";
      params.push(excludeId);
    }
    const [rows] = await pool.query(query, params);
    return (rows as Record<string, unknown>[]).map(toMantenimiento);
  },

  // Reservaciones activas que se traslapen con el rango datetime del mantenimiento
  async findReservacionesEnRango(
    espacioId: string,
    fechaInicio: string,
    fechaFin: string
  ): Promise<{ id: string; folio: string }[]> {
    const [rows] = await pool.query(
      `SELECT r.id, r.folio
       FROM reservaciones r
       WHERE r.espacio_id = ?
         AND r.estado IN ('pendiente_revision', 'aprobada', 'en_uso')
         AND TIMESTAMP(r.fecha, r.hora_fin)   > ?
         AND TIMESTAMP(r.fecha, r.hora_inicio) < ?`,
      [espacioId, fechaInicio, fechaFin]
    );
    return (rows as Record<string, unknown>[]).map((row) => ({
      id: row.id as string,
      folio: row.folio as string,
    }));
  },

  async create(data: {
    espacioId: string;
    fechaInicio: string;
    fechaFin: string;
    motivo: string;
  }): Promise<Mantenimiento> {
    const id = randomUUID();
    await pool.query(
      "INSERT INTO mantenimientos (id, espacio_id, fecha_inicio, fecha_fin, motivo) VALUES (?, ?, ?, ?, ?)",
      [id, data.espacioId, data.fechaInicio, data.fechaFin, data.motivo]
    );
    return (await this.findById(id))!;
  },

  async delete(id: string): Promise<void> {
    await pool.query("DELETE FROM mantenimientos WHERE id = ?", [id]);
  },
};
