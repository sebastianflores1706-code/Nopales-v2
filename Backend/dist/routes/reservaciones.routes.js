"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reservaciones_controller_1 = require("../controllers/reservaciones.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// /mis DEBE ir antes de /:id para que Express no lo trate como un parámetro
router.get("/mis", auth_middleware_1.requireAuth, reservaciones_controller_1.reservacionesController.getMias);
// Sin auth — panel admin
router.get("/", reservaciones_controller_1.reservacionesController.getAll);
router.get("/:id", reservaciones_controller_1.reservacionesController.getById);
// Con auth — escritura
router.post("/", auth_middleware_1.requireAuth, reservaciones_controller_1.reservacionesController.create);
router.patch("/:id/estado", auth_middleware_1.requireAuth, reservaciones_controller_1.reservacionesController.cambiarEstado);
router.patch("/:id/reembolso", auth_middleware_1.requireAuth, reservaciones_controller_1.reservacionesController.marcarReembolsoProcesado);
exports.default = router;
