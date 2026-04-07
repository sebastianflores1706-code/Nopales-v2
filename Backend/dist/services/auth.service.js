"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const usuarios_repository_1 = require("../repositories/usuarios.repository");
const JWT_SECRET = process.env.JWT_SECRET ?? "nopales_dev_secret_changeme";
const JWT_EXPIRES_IN = "7d";
function generarToken(id, rol) {
    return jsonwebtoken_1.default.sign({ id, rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
exports.authService = {
    async login(correo, contrasena) {
        const usuario = await usuarios_repository_1.usuariosRepository.findByCorreo(correo);
        if (!usuario)
            throw new Error("Credenciales incorrectas");
        const valido = await bcryptjs_1.default.compare(contrasena, usuario.hashContrasena);
        if (!valido)
            throw new Error("Credenciales incorrectas");
        const token = generarToken(usuario.id, usuario.rol);
        return {
            token,
            usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
        };
    },
    async register(nombre, correo, contrasena) {
        const existe = await usuarios_repository_1.usuariosRepository.findByCorreo(correo);
        if (existe)
            throw new Error("Ya existe una cuenta con ese correo");
        const hashContrasena = await bcryptjs_1.default.hash(contrasena, 10);
        const usuario = await usuarios_repository_1.usuariosRepository.create({ nombre, correo, hashContrasena });
        const token = generarToken(usuario.id, usuario.rol);
        return {
            token,
            usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
        };
    },
};
