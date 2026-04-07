"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mantenimientosService = void 0;
const mantenimientos_repository_1 = require("../repositories/mantenimientos.repository");
exports.mantenimientosService = {
    async getAll() {
        return mantenimientos_repository_1.mantenimientosRepository.findAll();
    },
    async getById(id) {
        const m = await mantenimientos_repository_1.mantenimientosRepository.findById(id);
        if (!m)
            throw new Error("Mantenimiento no encontrado");
        return m;
    },
    async create(data) {
        if (data.fechaFin <= data.fechaInicio) {
            throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
        }
        const traslapesMnt = await mantenimientos_repository_1.mantenimientosRepository.findTraslapeMantenimiento(data.espacioId, data.fechaInicio, data.fechaFin);
        if (traslapesMnt.length > 0) {
            throw new Error("El espacio ya tiene un mantenimiento programado que se traslapa con ese periodo");
        }
        const traslapeRes = await mantenimientos_repository_1.mantenimientosRepository.findReservacionesEnRango(data.espacioId, data.fechaInicio, data.fechaFin);
        if (traslapeRes.length > 0) {
            const folios = traslapeRes.map((r) => r.folio).join(", ");
            throw new Error(`El espacio tiene reservaciones activas en ese periodo: ${folios}`);
        }
        const mantenimiento = await mantenimientos_repository_1.mantenimientosRepository.create(data);
        return mantenimiento;
    },
    async delete(id) {
        const m = await mantenimientos_repository_1.mantenimientosRepository.findById(id);
        if (!m)
            throw new Error("Mantenimiento no encontrado");
        await mantenimientos_repository_1.mantenimientosRepository.delete(id);
    },
};
