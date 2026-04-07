"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pagos_controller_1 = require("../controllers/pagos.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// /mis DEBE ir antes de /:id para que Express no lo trate como parámetro
router.get("/mis", auth_middleware_1.requireAuth, pagos_controller_1.pagosController.getMios);
// Sin auth — panel admin
router.get("/", pagos_controller_1.pagosController.getAll);
router.get("/:id", pagos_controller_1.pagosController.getById);
// Con auth — escritura
router.post("/", auth_middleware_1.requireAuth, pagos_controller_1.pagosController.create);
router.patch("/:id/estado", auth_middleware_1.requireAuth, pagos_controller_1.pagosController.cambiarEstado);
exports.default = router;
