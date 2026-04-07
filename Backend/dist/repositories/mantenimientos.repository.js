"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mantenimientosRepository = void 0;
const crypto_1 = require("crypto");
const db_postgres_1 = __importDefault(require("../lib/db.postgres"));
function toISOStr(val) {
    if (val instanceof Date)
        return val.toISOString();
    return String(val ?? "");
}
function toMantenimiento(row) {
    return {
        id: row.id,
        espacioId: row.espacio_id,
        espacioNombre: (row.espacio_nombre ?? ""),
        fechaInicio: toISOStr(row.fecha_inicio),
        fechaFin: toISOStr(row.fecha_fin),
        motivo: row.motivo,
        creadoEn: toISOStr(row.creado_en),
    };
}
const SELECT_CON_ESPACIO = `
  SELECT m.*, e.nombre AS espacio_nombre
  FROM mantenimientos m
  LEFT JOIN espacios e ON e.id = m.espacio_id
`;
exports.mantenimientosRepository = {
    async findAll() {
        const { rows } = await db_postgres_1.default.query(`${SELECT_CON_ESPACIO} ORDER BY m.fecha_inicio ASC`);
        return rows.map(toMantenimiento);
    },
    async findById(id) {
        const { rows } = await db_postgres_1.default.query(`${SELECT_CON_ESPACIO} WHERE m.id = $1`, [id]);
        const list = rows;
        if (list.length === 0)
            return undefined;
        return toMantenimiento(list[0]);
    },
    // Mantenimientos del mismo espacio que se traslapen con [fechaInicio, fechaFin)
    async findTraslapeMantenimiento(espacioId, fechaInicio, fechaFin, excludeId) {
        const params = [espacioId, fechaFin, fechaInicio];
        let query = `
      ${SELECT_CON_ESPACIO}
      WHERE m.espacio_id = $1
        AND m.fecha_inicio < $2
        AND m.fecha_fin > $3
    `;
        if (excludeId) {
            query += " AND m.id != $4";
            params.push(excludeId);
        }
        const { rows } = await db_postgres_1.default.query(query, params);
        return rows.map(toMantenimiento);
    },
    // Reservaciones activas que se traslapen con el rango datetime del mantenimiento.
    // PostgreSQL: DATE + TIME = TIMESTAMP (equivalente a TIMESTAMP(fecha, hora) de MySQL)
    async findReservacionesEnRango(espacioId, fechaInicio, fechaFin) {
        const { rows } = await db_postgres_1.default.query(`SELECT r.id, r.folio
       FROM reservaciones r
       WHERE r.espacio_id = $1
         AND r.estado IN ('pendiente_revision', 'aprobada', 'en_uso')
         AND (r.fecha + r.hora_fin)   > $2
         AND (r.fecha + r.hora_inicio) < $3`, [espacioId, fechaInicio, fechaFin]);
        return rows.map((row) => ({
            id: row.id,
            folio: row.folio,
        }));
    },
    async create(data) {
        const id = (0, crypto_1.randomUUID)();
        await db_postgres_1.default.query("INSERT INTO mantenimientos (id, espacio_id, fecha_inicio, fecha_fin, motivo) VALUES ($1, $2, $3, $4, $5)", [id, data.espacioId, data.fechaInicio, data.fechaFin, data.motivo]);
        return (await this.findById(id));
    },
    async delete(id) {
        await db_postgres_1.default.query("DELETE FROM mantenimientos WHERE id = $1", [id]);
    },
};
