"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagosRepository = void 0;
const crypto_1 = require("crypto");
const db_postgres_1 = __importDefault(require("../lib/db.postgres"));
function hoy() {
    return new Date().toISOString().slice(0, 10);
}
function toDateStr(val) {
    if (val instanceof Date) {
        const y = val.getFullYear();
        const m = String(val.getMonth() + 1).padStart(2, "0");
        const d = String(val.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }
    return String(val).substring(0, 10);
}
function toPago(row) {
    return {
        id: row.id,
        reservacionId: row.reservacion_id,
        monto: parseFloat(row.monto),
        estado: row.estado,
        metodo: row.metodo,
        referencia: row.referencia,
        fechaPago: row.fecha_pago ? toDateStr(row.fecha_pago) : undefined,
    };
}
exports.pagosRepository = {
    async findAll() {
        const { rows } = await db_postgres_1.default.query("SELECT * FROM pagos ORDER BY creado_en ASC");
        return rows.map(toPago);
    },
    async findById(id) {
        const { rows } = await db_postgres_1.default.query("SELECT * FROM pagos WHERE id = $1", [id]);
        const list = rows;
        if (list.length === 0)
            return undefined;
        return toPago(list[0]);
    },
    async findByReservacionId(reservacionId) {
        const { rows } = await db_postgres_1.default.query("SELECT * FROM pagos WHERE reservacion_id = $1 ORDER BY creado_en ASC", [reservacionId]);
        return rows.map(toPago);
    },
    async findByUsuarioId(usuarioId) {
        const { rows } = await db_postgres_1.default.query(`SELECT p.*
       FROM pagos p
       INNER JOIN reservaciones r ON r.id = p.reservacion_id
       WHERE r.usuario_id = $1
       ORDER BY p.creado_en ASC`, [usuarioId]);
        return rows.map(toPago);
    },
    async create(data) {
        const id = (0, crypto_1.randomUUID)();
        const fechaPago = data.fechaPago ?? (data.estado === "pagado" ? hoy() : null);
        await db_postgres_1.default.query(`INSERT INTO pagos (id, reservacion_id, monto, metodo, estado, referencia, fecha_pago)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
            id,
            data.reservacionId,
            data.monto,
            data.metodo,
            data.estado,
            data.referencia ?? null,
            fechaPago,
        ]);
        return (await this.findById(id));
    },
    async markAllPendienteAsPagado(reservacionId) {
        const fecha = hoy();
        await db_postgres_1.default.query(`UPDATE pagos
       SET estado = 'pagado', fecha_pago = COALESCE(fecha_pago, $1)
       WHERE reservacion_id = $2 AND estado = 'pendiente'`, [fecha, reservacionId]);
    },
    async updateEstado(id, estado) {
        const existing = await this.findById(id);
        if (!existing)
            return undefined;
        // Auto-asignar fecha_pago solo si transiciona a "pagado" y aún no tiene fecha
        const fechaPago = estado === "pagado" && !existing.fechaPago ? hoy() : (existing.fechaPago ?? null);
        await db_postgres_1.default.query("UPDATE pagos SET estado = $1, fecha_pago = $2 WHERE id = $3", [estado, fechaPago, id]);
        return this.findById(id);
    },
};
