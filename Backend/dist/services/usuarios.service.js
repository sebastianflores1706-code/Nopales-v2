"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usuariosService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const usuarios_repository_1 = require("../repositories/usuarios.repository");
exports.usuariosService = {
    async getAll() {
        return usuarios_repository_1.usuariosRepository.findAll();
    },
    async create(data) {
        const existe = await usuarios_repository_1.usuariosRepository.findByCorreo(data.correo);
        if (existe)
            throw new Error("Ya existe una cuenta con ese correo");
        const hashContrasena = await bcryptjs_1.default.hash(data.contrasena, 10);
        return usuarios_repository_1.usuariosRepository.create({
            nombre: data.nombre,
            correo: data.correo,
            hashContrasena,
            rol: data.rol,
        });
    },
};
