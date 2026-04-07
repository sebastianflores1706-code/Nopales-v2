"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mantenimientosController = void 0;
const mantenimientos_service_1 = require("../services/mantenimientos.service");
exports.mantenimientosController = {
    async getAll(_req, res) {
        try {
            const data = await mantenimientos_service_1.mantenimientosService.getAll();
            res.json(data);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async getById(req, res) {
        try {
            const data = await mantenimientos_service_1.mantenimientosService.getById(req.params.id);
            res.json(data);
        }
        catch (err) {
            res.status(404).json({ error: err.message });
        }
    },
    async create(req, res) {
        const { espacioId, fechaInicio, fechaFin, motivo } = req.body;
        if (!espacioId || !fechaInicio || !fechaFin || !motivo) {
            return res.status(400).json({ error: "Todos los campos son requeridos" });
        }
        try {
            const data = await mantenimientos_service_1.mantenimientosService.create({ espacioId, fechaInicio, fechaFin, motivo });
            res.status(201).json(data);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    async delete(req, res) {
        try {
            await mantenimientos_service_1.mantenimientosService.delete(req.params.id);
            res.json({ ok: true });
        }
        catch (err) {
            res.status(404).json({ error: err.message });
        }
    },
};
