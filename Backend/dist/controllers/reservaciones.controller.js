"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservacionesController = void 0;
const reservaciones_service_1 = require("../services/reservaciones.service");
const reservaciones_schema_1 = require("../validators/reservaciones.schema");
exports.reservacionesController = {
    async getAll(_req, res) {
        const reservaciones = await reservaciones_service_1.reservacionesService.getAll({});
        res.json(reservaciones);
    },
    async getMias(req, res) {
        const { id: usuarioId } = req.usuario;
        const reservaciones = await reservaciones_service_1.reservacionesService.getAll({ usuarioId });
        res.json(reservaciones);
    },
    async getById(req, res) {
        try {
            const reservacion = await reservaciones_service_1.reservacionesService.getById(req.params.id);
            res.json(reservacion);
        }
        catch {
            res.status(404).json({ error: "Reservación no encontrada" });
        }
    },
    async create(req, res) {
        const result = reservaciones_schema_1.createReservacionSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                error: "Datos inválidos",
                details: result.error.flatten(),
            });
        }
        const { id: authUserId, rol } = req.usuario;
        // Ciudadano: usuario_id siempre del token
        // Admin: puede especificar usuario_id en el body (Opción B), o queda null
        let usuarioId;
        if (rol === "ciudadano") {
            usuarioId = authUserId;
        }
        else {
            const bodyUsuarioId = req.body.usuario_id;
            usuarioId =
                typeof bodyUsuarioId === "string" && bodyUsuarioId.length > 0 ? bodyUsuarioId : null;
        }
        try {
            const nueva = await reservaciones_service_1.reservacionesService.create(result.data, usuarioId);
            return res.status(201).json(nueva);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },
    async marcarReembolsoProcesado(req, res) {
        try {
            const actualizada = await reservaciones_service_1.reservacionesService.marcarReembolsoProcesado(req.params.id);
            return res.json(actualizada);
        }
        catch (err) {
            const message = err.message;
            const status = message.includes("no encontrada") ? 404 : 400;
            return res.status(status).json({ error: message });
        }
    },
    async cambiarEstado(req, res) {
        const result = reservaciones_schema_1.cambiarEstadoSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                error: "Datos inválidos",
                details: result.error.flatten(),
            });
        }
        try {
            const actualizada = await reservaciones_service_1.reservacionesService.cambiarEstado(req.params.id, result.data);
            return res.json(actualizada);
        }
        catch (err) {
            const message = err.message;
            const status = message.includes("no encontrada") ? 404 : 400;
            return res.status(status).json({ error: message });
        }
    },
};
