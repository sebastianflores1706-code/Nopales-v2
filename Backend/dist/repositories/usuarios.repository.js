"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usuariosRepository = void 0;
const crypto_1 = require("crypto");
const db_postgres_1 = __importDefault(require("../lib/db.postgres"));
function toUsuario(row) {
    return {
        id: row.id,
        nombre: row.nombre,
        correo: row.correo,
        hashContrasena: row.hash_contrasena,
        rol: row.rol,
    };
}
function toUsuarioPublico(row) {
    return {
        id: row.id,
        nombre: row.nombre,
        correo: row.correo,
        rol: row.rol,
        creadoEn: row.creado_en instanceof Date
            ? row.creado_en.toISOString()
            : String(row.creado_en ?? ""),
    };
}
exports.usuariosRepository = {
    async findAll() {
        const { rows } = await db_postgres_1.default.query("SELECT id, nombre, correo, rol, creado_en FROM usuarios ORDER BY nombre ASC");
        return rows.map(toUsuarioPublico);
    },
    async findByCorreo(correo) {
        const { rows } = await db_postgres_1.default.query("SELECT id, nombre, correo, hash_contrasena, rol FROM usuarios WHERE correo = $1", [correo]);
        const list = rows;
        if (list.length === 0)
            return undefined;
        return toUsuario(list[0]);
    },
    async findById(id) {
        const { rows } = await db_postgres_1.default.query("SELECT id, nombre, correo, hash_contrasena, rol FROM usuarios WHERE id = $1", [id]);
        const list = rows;
        if (list.length === 0)
            return undefined;
        return toUsuario(list[0]);
    },
    async create(data) {
        const id = (0, crypto_1.randomUUID)();
        const rol = data.rol ?? "ciudadano";
        await db_postgres_1.default.query("INSERT INTO usuarios (id, nombre, correo, hash_contrasena, rol) VALUES ($1, $2, $3, $4, $5)", [id, data.nombre, data.correo, data.hashContrasena, rol]);
        const usuario = await this.findById(id);
        return usuario;
    },
};
