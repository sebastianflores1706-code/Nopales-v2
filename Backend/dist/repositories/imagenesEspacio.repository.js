"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imagenesEspacioRepository = void 0;
const crypto_1 = require("crypto");
const db_postgres_1 = __importDefault(require("../lib/db.postgres"));
function toImagen(row) {
    return {
        id: row.id,
        espacioId: row.espacio_id,
        url: row.url,
        creadoEn: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    };
}
exports.imagenesEspacioRepository = {
    async findByEspacioId(espacioId) {
        const { rows } = await db_postgres_1.default.query("SELECT * FROM imagenes_espacio WHERE espacio_id = $1 ORDER BY created_at ASC", [espacioId]);
        return rows.map(toImagen);
    },
    async findById(id) {
        const { rows } = await db_postgres_1.default.query("SELECT * FROM imagenes_espacio WHERE id = $1", [id]);
        const list = rows;
        return list.length ? toImagen(list[0]) : undefined;
    },
    async create(espacioId, url) {
        const id = (0, crypto_1.randomUUID)();
        await db_postgres_1.default.query("INSERT INTO imagenes_espacio (id, espacio_id, url) VALUES ($1, $2, $3)", [id, espacioId, url]);
        return (await this.findById(id));
    },
    async delete(id) {
        await db_postgres_1.default.query("DELETE FROM imagenes_espacio WHERE id = $1", [id]);
    },
};
