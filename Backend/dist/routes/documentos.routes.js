"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const documentos_controller_1 = require("../controllers/documentos.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// /mis DEBE ir antes de rutas con parámetros
router.get("/mis", auth_middleware_1.requireAuth, documentos_controller_1.documentosController.getMios);
// Sin auth — panel admin
router.get("/", documentos_controller_1.documentosController.getAll);
router.get("/reservacion/:reservacionId", documentos_controller_1.documentosController.getByReservacionId);
// Con auth — escritura
router.post("/generar-contrato", auth_middleware_1.requireAuth, documentos_controller_1.documentosController.generarContrato);
router.post("/:id/generar-pdf", auth_middleware_1.requireAuth, documentos_controller_1.documentosController.generarPdf);
// Servir PDF — público (ID opaco = UUID)
router.get("/:id/pdf", documentos_controller_1.documentosController.servirPdf);
exports.default = router;
