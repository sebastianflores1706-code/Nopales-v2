"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usuariosController = void 0;
const zod_1 = require("zod");
const usuarios_service_1 = require("../services/usuarios.service");
const createSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1, "El nombre es requerido"),
    correo: zod_1.z.string().email("Correo inválido"),
    contrasena: zod_1.z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    rol: zod_1.z.enum(["admin", "ciudadano"], { message: "Rol inválido" }),
});
exports.usuariosController = {
    async getAll(req, res) {
        if (req.usuario?.rol !== "admin") {
            return res.status(403).json({ error: "Acceso denegado: solo administradores" });
        }
        try {
            const usuarios = await usuarios_service_1.usuariosService.getAll();
            res.json(usuarios);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async create(req, res) {
        if (req.usuario?.rol !== "admin") {
            return res.status(403).json({ error: "Acceso denegado: solo administradores" });
        }
        const result = createSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: "Datos inválidos", details: result.error.flatten() });
        }
        try {
            const usuario = await usuarios_service_1.usuariosService.create(result.data);
            return res.status(201).json(usuario);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },
};
