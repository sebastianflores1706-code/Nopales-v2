"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.espaciosService = void 0;
const espacios_repository_1 = require("../repositories/espacios.repository");
exports.espaciosService = {
    async getAll() {
        return espacios_repository_1.espaciosRepository.findAll();
    },
    async getById(id) {
        const espacio = await espacios_repository_1.espaciosRepository.findById(id);
        if (!espacio)
            throw new Error("Espacio no encontrado");
        return espacio;
    },
    async create(data) {
        return espacios_repository_1.espaciosRepository.create(data);
    },
    async update(id, data) {
        const espacio = await espacios_repository_1.espaciosRepository.update(id, data);
        if (!espacio)
            throw new Error("Espacio no encontrado");
        return espacio;
    },
    async delete(id) {
        const deleted = await espacios_repository_1.espaciosRepository.delete(id);
        if (!deleted)
            throw new Error("Espacio no encontrado");
    },
};
