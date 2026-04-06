import { randomUUID } from "crypto";
import pool from "../lib/db.postgres";
import type { CreatePagoDto } from "../validators/pagos.schema";

export interface Pago {
  id: string;
  reservacionId: string;
  monto: number;
  estado: string;
  metodo: string;
  referencia?: string;
  fechaPago?: string;
}

function hoy(): string {
  return new Date().toISOString().slice(0, 10);
}

function toDateStr(val: unknown): string {
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    const d = String(val.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(val).substring(0, 10);
}

function toPago(row: Record<string, unknown>): Pago {
  return {
    id:            row.id as string,
    reservacionId: row.reservacion_id as string,
    monto:         parseFloat(row.monto as string),
    estado:        row.estado as string,
    metodo:        row.metodo as string,
    referencia:    row.referencia as string | undefined,
    fechaPago:     row.fecha_pago ? toDateStr(row.fecha_pago) : undefined,
  };
}

export const pagosRepository = {
  async findAll(): Promise<Pago[]> {
    const { rows } = await pool.query("SELECT * FROM pagos ORDER BY creado_en ASC");
    return (rows as Record<string, unknown>[]).map(toPago);
  },

  async findById(id: string): Promise<Pago | undefined> {
    const { rows } = await pool.query("SELECT * FROM pagos WHERE id = $1", [id]);
    const list = rows as Record<string, unknown>[];
    if (list.length === 0) return undefined;
    return toPago(list[0]);
  },

  async findByReservacionId(reservacionId: string): Promise<Pago[]> {
    const { rows } = await pool.query(
      "SELECT * FROM pagos WHERE reservacion_id = $1 ORDER BY creado_en ASC",
      [reservacionId]
    );
    return (rows as Record<string, unknown>[]).map(toPago);
  },

  async findByUsuarioId(usuarioId: string): Promise<Pago[]> {
    const { rows } = await pool.query(
      `SELECT p.*
       FROM pagos p
       INNER JOIN reservaciones r ON r.id = p.reservacion_id
       WHERE r.usuario_id = $1
       ORDER BY p.creado_en ASC`,
      [usuarioId]
    );
    return (rows as Record<string, unknown>[]).map(toPago);
  },

  async create(data: CreatePagoDto): Promise<Pago> {
    const id = randomUUID();
    const fechaPago = data.fechaPago ?? (data.estado === "pagado" ? hoy() : null);

    await pool.query(
      `INSERT INTO pagos (id, reservacion_id, monto, metodo, estado, referencia, fecha_pago)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        id,
        data.reservacionId,
        data.monto,
        data.metodo,
        data.estado,
        data.referencia ?? null,
        fechaPago,
      ]
    );

    return (await this.findById(id))!;
  },

  async markAllPendienteAsPagado(reservacionId: string): Promise<void> {
    const fecha = hoy();
    await pool.query(
      `UPDATE pagos
       SET estado = 'pagado', fecha_pago = COALESCE(fecha_pago, $1)
       WHERE reservacion_id = $2 AND estado = 'pendiente'`,
      [fecha, reservacionId]
    );
  },

  async updateEstado(id: string, estado: string): Promise<Pago | undefined> {
    const existing = await this.findById(id);
    if (!existing) return undefined;

    // Auto-asignar fecha_pago solo si transiciona a "pagado" y aún no tiene fecha
    const fechaPago =
      estado === "pagado" && !existing.fechaPago ? hoy() : (existing.fechaPago ?? null);

    await pool.query(
      "UPDATE pagos SET estado = $1, fecha_pago = $2 WHERE id = $3",
      [estado, fechaPago, id]
    );

    return this.findById(id);
  },
};
