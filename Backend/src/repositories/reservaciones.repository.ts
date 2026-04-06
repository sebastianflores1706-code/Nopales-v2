import { randomUUID } from "crypto";
import pool from "../lib/db.postgres";
import type { CreateReservacionDto } from "../validators/reservaciones.schema";

export interface Reservacion {
  id: string;
  folio: string;
  espacioId: string;
  espacioNombre: string;
  espacioImagenUrl?: string;
  solicitanteNombre: string;
  tipoEvento: string;
  descripcionEvento?: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  asistentes: number;
  estado: string;
  pagoEstado: string;
  costoHora: number;
  montoTotal: number;
  reembolsoEstado?: string;
  reembolsoMonto: number;
}

// pg devuelve columnas DATE como objetos Date.
// String(date) produce "Fri Mar 20 2026 …", no "2026-03-20".
// Esta función extrae la fecha en formato ISO usando los getters locales del objeto Date.
function toDateStr(val: unknown): string {
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    const d = String(val.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(val).substring(0, 10);
}

function calcularMontoTotal(costoHora: number, horaInicio: string, horaFin: string): number {
  const [hIni, mIni] = horaInicio.split(":").map(Number);
  const [hFin, mFin] = horaFin.split(":").map(Number);
  const duracionHoras = (hFin * 60 + mFin - (hIni * 60 + mIni)) / 60;
  return Math.round(costoHora * duracionHoras * 100) / 100;
}

function toReservacion(row: Record<string, unknown>): Reservacion {
  const horaInicio = String(row.hora_inicio).substring(0, 5);
  const horaFin    = String(row.hora_fin).substring(0, 5);
  const costoHora  = parseFloat(row.costo_hora as string) || 0;

  return {
    id:                row.id as string,
    folio:             row.folio as string,
    espacioId:         row.espacio_id as string,
    espacioNombre:     (row.espacio_nombre ?? "") as string,
    espacioImagenUrl:  (row.espacio_imagen_url as string | null) ?? undefined,
    solicitanteNombre: row.solicitante_nombre as string,
    tipoEvento:        row.tipo_evento as string,
    descripcionEvento: (row.descripcion_evento as string | null) ?? undefined,
    fecha:             toDateStr(row.fecha),
    horaInicio,
    horaFin,
    asistentes:        row.asistentes as number,
    estado:            row.estado as string,
    pagoEstado:        "pendiente", // sobreescrito por enrichReservacion en el service
    costoHora,
    montoTotal:        calcularMontoTotal(costoHora, horaInicio, horaFin),
    reembolsoEstado:   (row.reembolso_estado as string | null) ?? undefined,
    reembolsoMonto:    parseFloat(row.reembolso_monto as string) || 0,
  };
}

const SELECT_CON_ESPACIO = `
  SELECT
    r.*,
    e.nombre     AS espacio_nombre,
    e.costo_hora AS costo_hora,
    (SELECT url FROM imagenes_espacio WHERE espacio_id = e.id ORDER BY created_at ASC LIMIT 1) AS espacio_imagen_url
  FROM reservaciones r
  LEFT JOIN espacios e ON e.id = r.espacio_id
`;

async function generarFolio(): Promise<string> {
  const anio = new Date().getFullYear();
  // SPLIT_PART(folio, '-', 3) extrae la parte numérica de 'RES-2026-001'
  const { rows } = await pool.query(
    `SELECT MAX(CAST(SPLIT_PART(folio, '-', 3) AS INTEGER)) AS max_num
     FROM reservaciones
     WHERE folio LIKE $1`,
    [`RES-${anio}-%`]
  );
  const maxNum = (rows as Record<string, unknown>[])[0].max_num as number | null;
  const siguiente = (maxNum ?? 0) + 1;
  return `RES-${anio}-${String(siguiente).padStart(3, "0")}`;
}

export const reservacionesRepository = {
  async findAll(): Promise<Reservacion[]> {
    const { rows } = await pool.query(`${SELECT_CON_ESPACIO} ORDER BY r.creado_en ASC`);
    return (rows as Record<string, unknown>[]).map(toReservacion);
  },

  async findByUsuarioId(usuarioId: string): Promise<Reservacion[]> {
    const { rows } = await pool.query(
      `${SELECT_CON_ESPACIO} WHERE r.usuario_id = $1 ORDER BY r.creado_en ASC`,
      [usuarioId]
    );
    return (rows as Record<string, unknown>[]).map(toReservacion);
  },

  async findById(id: string): Promise<Reservacion | undefined> {
    const { rows } = await pool.query(
      `${SELECT_CON_ESPACIO} WHERE r.id = $1`,
      [id]
    );
    const list = rows as Record<string, unknown>[];
    if (list.length === 0) return undefined;
    return toReservacion(list[0]);
  },

  async findByEspacioFecha(espacioId: string, fecha: string): Promise<Reservacion[]> {
    const { rows } = await pool.query(
      `${SELECT_CON_ESPACIO} WHERE r.espacio_id = $1 AND r.fecha = $2`,
      [espacioId, fecha]
    );
    return (rows as Record<string, unknown>[]).map(toReservacion);
  },

  async create(
    data: CreateReservacionDto,
    espacioNombre: string,
    usuarioId: string | null = null
  ): Promise<Reservacion> {
    const id = randomUUID();
    const folio = await generarFolio();

    await pool.query(
      `INSERT INTO reservaciones
        (id, folio, espacio_id, usuario_id, solicitante_nombre, tipo_evento, descripcion_evento, fecha, hora_inicio, hora_fin, asistentes, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pendiente_revision')`,
      [
        id,
        folio,
        data.espacioId,
        usuarioId,
        data.solicitanteNombre,
        data.tipoEvento,
        data.descripcionEvento ?? null,
        data.fecha,
        data.horaInicio,
        data.horaFin,
        data.asistentes,
      ]
    );

    // Retornar el registro completo con JOIN para incluir espacioNombre
    const reservacion = await this.findById(id);
    return reservacion!;
  },

  async updateEstado(id: string, estado: string): Promise<Reservacion | undefined> {
    await pool.query(
      "UPDATE reservaciones SET estado = $1 WHERE id = $2",
      [estado, id]
    );
    return this.findById(id);
  },

  async updateCancelacion(
    id: string,
    reembolsoEstado: string,
    reembolsoMonto: number
  ): Promise<Reservacion | undefined> {
    await pool.query(
      "UPDATE reservaciones SET estado = 'cancelada', reembolso_estado = $1, reembolso_monto = $2 WHERE id = $3",
      [reembolsoEstado, reembolsoMonto, id]
    );
    return this.findById(id);
  },

  async updateReembolsoEstado(id: string, reembolsoEstado: string): Promise<Reservacion | undefined> {
    await pool.query(
      "UPDATE reservaciones SET reembolso_estado = $1 WHERE id = $2",
      [reembolsoEstado, id]
    );
    return this.findById(id);
  },

  async finalizarVencidas(): Promise<void> {
    // PostgreSQL: DATE + TIME = TIMESTAMP (equivalente a TIMESTAMP(fecha, hora) de MySQL)
    await pool.query(`
      UPDATE reservaciones
      SET estado = 'finalizada'
      WHERE estado IN ('aprobada', 'en_uso')
        AND (fecha + hora_fin) < NOW()
    `);
  },
};
