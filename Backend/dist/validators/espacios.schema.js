"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEspacioSchema = exports.createEspacioSchema = exports.estadoEspacioEnum = exports.tipoEspacioEnum = void 0;
const zod_1 = require("zod");
exports.tipoEspacioEnum = zod_1.z.enum([
    "plaza",
    "auditorio",
    "parque",
    "salon",
    "cancha",
    "centro_cultural",
]);
exports.estadoEspacioEnum = zod_1.z.enum(["activo", "inactivo"]);
exports.createEspacioSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1, "El nombre es requerido"),
    tipo: exports.tipoEspacioEnum,
    ubicacion: zod_1.z.string().min(1, "La ubicación es requerida"),
    capacidad: zod_1.z.number().int().positive("La capacidad debe ser un número positivo"),
    costoHora: zod_1.z.number().positive("El costo por hora debe ser un número positivo"),
    estado: exports.estadoEspacioEnum.default("activo"),
    descripcion: zod_1.z.string().optional(),
    reglas: zod_1.z.string().optional(),
    horarioDisponible: zod_1.z.string().optional(),
});
exports.updateEspacioSchema = exports.createEspacioSchema.partial();
