"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentosRepository = void 0;
const crypto_1 = require("crypto");
const db_postgres_1 = __importDefault(require("../lib/db.postgres"));
function toDocumento(row) {
    return {
        id: row.id,
        reservacionId: row.reservacion_id,
        tipo: row.tipo,
        nombreArchivo: row.nombre_archivo,
        contenido: row.contenido,
        createdAt: row.creado_en instanceof Date
            ? row.creado_en.toISOString()
            : String(row.creado_en),
        pdfPath: row.pdf_path ?? undefined,
    };
}
exports.documentosRepository = {
    async findAll() {
        const { rows } = await db_postgres_1.default.query("SELECT * FROM documentos ORDER BY creado_en DESC");
        return rows.map(toDocumento);
    },
    async findById(id) {
        const { rows } = await db_postgres_1.default.query("SELECT * FROM documentos WHERE id = $1", [id]);
        const list = rows;
        return list.length ? toDocumento(list[0]) : undefined;
    },
    async findByReservacionId(reservacionId) {
        const { rows } = await db_postgres_1.default.query("SELECT * FROM documentos WHERE reservacion_id = $1 ORDER BY creado_en DESC", [reservacionId]);
        return rows.map(toDocumento);
    },
    async findByUsuarioId(usuarioId) {
        const { rows } = await db_postgres_1.default.query(`SELECT d.*
       FROM documentos d
       INNER JOIN reservaciones r ON r.id = d.reservacion_id
       WHERE r.usuario_id = $1
       ORDER BY d.creado_en DESC`, [usuarioId]);
        return rows.map(toDocumento);
    },
    async create(data) {
        const id = (0, crypto_1.randomUUID)();
        await db_postgres_1.default.query(`INSERT INTO documentos (id, reservacion_id, tipo, nombre_archivo, contenido)
       VALUES ($1, $2, $3, $4, $5)`, [id, data.reservacionId, data.tipo, data.nombreArchivo, data.contenido]);
        return (await this.findById(id));
    },
    async updatePdfPath(id, pdfPath) {
        await db_postgres_1.default.query("UPDATE documentos SET pdf_path = $1 WHERE id = $2", [pdfPath, id]);
        return this.findById(id);
    },
};
