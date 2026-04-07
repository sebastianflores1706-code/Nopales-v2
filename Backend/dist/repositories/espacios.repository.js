"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.espaciosRepository = void 0;
const crypto_1 = require("crypto");
const db_postgres_1 = __importDefault(require("../lib/db.postgres"));
// Mapea una fila de MySQL al tipo Espacio del dominio.
// Necesario porque MySQL usa snake_case y el dominio usa camelCase.
function toEspacio(row) {
    return {
        id: row.id,
        nombre: row.nombre,
        tipo: row.tipo,
        ubicacion: row.ubicacion,
        capacidad: row.capacidad,
        costoHora: row.costo_hora,
        estado: row.estado,
        descripcion: row.descripcion,
        reglas: row.reglas,
        horarioDisponible: row.horario_disponible,
    };
}
exports.espaciosRepository = {
    async findAll() {
        const { rows } = await db_postgres_1.default.query("SELECT * FROM espacios ORDER BY creado_en ASC");
        return rows.map(toEspacio);
    },
    async findById(id) {
        const { rows } = await db_postgres_1.default.query("SELECT * FROM espacios WHERE id = $1", [id]);
        const list = rows;
        if (list.length === 0)
            return undefined;
        const espacio = toEspacio(list[0]);
        try {
            const { rows: imgRows } = await db_postgres_1.default.query("SELECT id, url FROM imagenes_espacio WHERE espacio_id = $1 ORDER BY created_at ASC", [id]);
            espacio.imagenes = imgRows.map((r) => ({
                id: r.id,
                url: r.url,
            }));
        }
        catch {
            espacio.imagenes = [];
        }
        return espacio;
    },
    async create(data) {
        const id = (0, crypto_1.randomUUID)();
        await db_postgres_1.default.query(`INSERT INTO espacios
        (id, nombre, tipo, ubicacion, capacidad, costo_hora, estado, descripcion, reglas, horario_disponible)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
            id,
            data.nombre,
            data.tipo,
            data.ubicacion,
            data.capacidad,
            data.costoHora,
            data.estado ?? "activo",
            data.descripcion ?? null,
            data.reglas ?? null,
            data.horarioDisponible ?? null,
        ]);
        return (await this.findById(id));
    },
    async update(id, data) {
        // Construye dinámicamente solo las columnas que vienen en el payload.
        // PostgreSQL usa placeholders numerados ($1, $2...), no posicionales (?).
        const columnMap = {
            nombre: "nombre",
            tipo: "tipo",
            ubicacion: "ubicacion",
            capacidad: "capacidad",
            costoHora: "costo_hora",
            estado: "estado",
            descripcion: "descripcion",
            reglas: "reglas",
            horarioDisponible: "horario_disponible",
        };
        const sets = [];
        const values = [];
        for (const [key, col] of Object.entries(columnMap)) {
            if (key in data) {
                sets.push(`${col} = $${sets.length + 1}`);
                values.push(data[key]);
            }
        }
        if (sets.length === 0)
            return this.findById(id);
        values.push(id);
        await db_postgres_1.default.query(`UPDATE espacios SET ${sets.join(", ")} WHERE id = $${values.length}`, values);
        return this.findById(id);
    },
    async delete(id) {
        const result = await db_postgres_1.default.query("DELETE FROM espacios WHERE id = $1", [id]);
        return result.rowCount !== null && result.rowCount > 0;
    },
};
