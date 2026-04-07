"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generarContratoSchema = exports.tipoDocumentoEnum = void 0;
const zod_1 = require("zod");
exports.tipoDocumentoEnum = zod_1.z.enum(["contrato"]);
exports.generarContratoSchema = zod_1.z.object({
    reservacionId: zod_1.z.string().min(1, "El reservacionId es requerido"),
});
