import { Router } from "express";
import { documentosController } from "../controllers/documentos.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// /mis DEBE ir antes de rutas con parámetros
router.get("/mis", requireAuth, documentosController.getMios);

// Sin auth — panel admin
router.get("/", documentosController.getAll);
router.get("/reservacion/:reservacionId", documentosController.getByReservacionId);

// Con auth — escritura
router.post("/generar-contrato", requireAuth, documentosController.generarContrato);
router.post("/:id/generar-pdf", requireAuth, documentosController.generarPdf);

// Servir PDF — público (ID opaco = UUID)
router.get("/:id/pdf", documentosController.servirPdf);

export default router;
