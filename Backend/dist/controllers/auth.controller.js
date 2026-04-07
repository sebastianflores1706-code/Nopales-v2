"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const zod_1 = require("zod");
const auth_service_1 = require("../services/auth.service");
const usuarios_repository_1 = require("../repositories/usuarios.repository");
const COOKIE_NAME = "auth_token";
const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
    secure: process.env.NODE_ENV === "production",
};
const loginSchema = zod_1.z.object({
    correo: zod_1.z.string().email("Correo inválido"),
    contrasena: zod_1.z.string().min(1, "La contraseña es requerida"),
});
const registerSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1, "El nombre es requerido"),
    correo: zod_1.z.string().email("Correo inválido"),
    contrasena: zod_1.z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});
exports.authController = {
    async login(req, res) {
        const result = loginSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: "Datos inválidos", details: result.error.flatten() });
        }
        try {
            const data = await auth_service_1.authService.login(result.data.correo, result.data.contrasena);
            res.cookie(COOKIE_NAME, data.token, COOKIE_OPTIONS);
            return res.json({ usuario: data.usuario });
        }
        catch (err) {
            return res.status(401).json({ error: err.message });
        }
    },
    async register(req, res) {
        const result = registerSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: "Datos inválidos", details: result.error.flatten() });
        }
        try {
            const data = await auth_service_1.authService.register(result.data.nombre, result.data.correo, result.data.contrasena);
            res.cookie(COOKIE_NAME, data.token, COOKIE_OPTIONS);
            return res.status(201).json({ usuario: data.usuario });
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },
    async me(req, res) {
        // req.usuario ya viene del middleware requireAuth
        const usuario = await usuarios_repository_1.usuariosRepository.findById(req.usuario.id);
        if (!usuario)
            return res.status(401).json({ error: "Usuario no encontrado" });
        return res.json({
            usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
        });
    },
    logout(_req, res) {
        res.clearCookie(COOKIE_NAME, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: process.env.NODE_ENV === "production",
        });
        return res.json({ ok: true });
    },
};
