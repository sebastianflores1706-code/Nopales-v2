"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cambiarEstadoSchema = exports.createReservacionSchema = exports.pagoEstadoEnum = exports.estadoReservacionEnum = void 0;
const zod_1 = require("zod");
exports.estadoReservacionEnum = zod_1.z.enum([
    "pendiente_revision",
    "aprobada",
    "rechazada",
    "cancelada",
    "finalizada",
]);
exports.pagoEstadoEnum = zod_1.z.enum(["pendiente", "pagado", "cancelado"]);
const horaRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
exports.createReservacionSchema = zod_1.z.object({
    espacioId: zod_1.z.string().min(1, "El espacioId es requerido"),
    solicitanteNombre: zod_1.z.string().min(1, "El nombre del solicitante es requerido"),
    tipoEvento: zod_1.z.string().min(1, "El tipo de evento es requerido"),
    fecha: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD"),
    horaInicio: zod_1.z.string().regex(horaRegex, "La hora de inicio debe tener formato HH:MM"),
    horaFin: zod_1.z.string().regex(horaRegex, "La hora de fin debe tener formato HH:MM"),
    asistentes: zod_1.z.number().int().positive("El número de asistentes debe ser positivo"),
    descripcionEvento: zod_1.z.string().optional(),
    pagoEstado: exports.pagoEstadoEnum.default("pendiente"),
}).refine((d) => d.horaInicio < d.horaFin, {
    message: "La hora de fin debe ser posterior a la hora de inicio",
    path: ["horaFin"],
});
exports.cambiarEstadoSchema = zod_1.z.object({
    estado: exports.estadoReservacionEnum,
});
