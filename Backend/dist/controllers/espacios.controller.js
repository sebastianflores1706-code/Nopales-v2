"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.espaciosController = void 0;
const espacios_service_1 = require("../services/espacios.service");
const espacios_schema_1 = require("../validators/espacios.schema");
exports.espaciosController = {
    async getAll(_req, res) {
        const espacios = await espacios_service_1.espaciosService.getAll();
        res.json(espacios);
    },
    async getById(req, res) {
        try {
            const id = req.params.id;
            const espacio = await espacios_service_1.espaciosService.getById(id);
            res.json(espacio);
        }
        catch {
            res.status(404).json({ error: "Espacio no encontrado" });
        }
    },
    async create(req, res) {
        const result = espacios_schema_1.createEspacioSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                error: "Datos inválidos",
                details: result.error.flatten(),
            });
        }
        const nuevoEspacio = await espacios_service_1.espaciosService.create(result.data);
        return res.status(201).json(nuevoEspacio);
    },
    async update(req, res) {
        const result = espacios_schema_1.updateEspacioSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                error: "Datos inválidos",
                details: result.error.flatten(),
            });
        }
        try {
            const id = req.params.id;
            const espacioActualizado = await espacios_service_1.espaciosService.update(id, result.data);
            return res.json(espacioActualizado);
        }
        catch {
            return res.status(404).json({ error: "Espacio no encontrado" });
        }
    },
    async delete(req, res) {
        try {
            const id = req.params.id;
            await espacios_service_1.espaciosService.delete(id);
            return res.status(204).send();
        }
        catch {
            return res.status(404).json({ error: "Espacio no encontrado" });
        }
    },
};
