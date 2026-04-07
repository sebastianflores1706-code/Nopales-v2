"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET ?? "nopales_dev_secret_changeme";
function requireAuth(req, res, next) {
    const token = req.cookies?.auth_token;
    if (!token) {
        return res.status(401).json({ error: "No autorizado: token requerido" });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.usuario = { id: payload.id, rol: payload.rol };
        next();
    }
    catch {
        return res.status(401).json({ error: "No autorizado: token inválido o expirado" });
    }
}
