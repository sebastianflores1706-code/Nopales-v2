"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagosController = void 0;
const pagos_service_1 = require("../services/pagos.service");
const pagos_schema_1 = require("../validators/pagos.schema");
exports.pagosController = {
    async getAll(_req, res) {
        const pagos = await pagos_service_1.pagosService.getAll();
        res.json(pagos);
    },
    async getMios(req, res) {
        const { id: usuarioId } = req.usuario;
        const pagos = await pagos_service_1.pagosService.getMios(usuarioId);
        res.json(pagos);
    },
    async getById(req, res) {
        try {
            const pago = await pagos_service_1.pagosService.getById(req.params.id);
            res.json(pago);
        }
        catch {
            res.status(404).json({ error: "Pago no encontrado" });
        }
    },
    async create(req, res) {
        const result = pagos_schema_1.createPagoSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                error: "Datos inválidos",
                details: result.error.flatten(),
            });
        }
        try {
            const nuevoPago = await pagos_service_1.pagosService.create(result.data);
            return res.status(201).json(nuevoPago);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },
    async cambiarEstado(req, res) {
        const result = pagos_schema_1.cambiarEstadoPagoSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                error: "Datos inválidos",
                details: result.error.flatten(),
            });
        }
        try {
            const pagoActualizado = await pagos_service_1.pagosService.cambiarEstado(req.params.id, result.data);
            return res.json(pagoActualizado);
        }
        catch (err) {
            return res.status(404).json({ error: err.message });
        }
    },
};
