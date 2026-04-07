"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cambiarEstadoPagoSchema = exports.createPagoSchema = exports.metodoPagoEnum = exports.estadoPagoEnum = void 0;
const zod_1 = require("zod");
exports.estadoPagoEnum = zod_1.z.enum(["pendiente", "pagado", "cancelado"]);
exports.metodoPagoEnum = zod_1.z.enum(["efectivo", "transferencia", "tarjeta"]);
exports.createPagoSchema = zod_1.z.object({
    reservacionId: zod_1.z.string().min(1, "El reservacionId es requerido"),
    monto: zod_1.z.number().positive("El monto debe ser un número positivo"),
    estado: exports.estadoPagoEnum.default("pendiente"),
    metodo: exports.metodoPagoEnum,
    referencia: zod_1.z.string().optional(),
    fechaPago: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)").optional(),
});
exports.cambiarEstadoPagoSchema = zod_1.z.object({
    estado: exports.estadoPagoEnum,
});
