import { Router } from "express";
import { reservacionesController } from "../controllers/reservaciones.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// /mis DEBE ir antes de /:id para que Express no lo trate como un parámetro
router.get("/mis", requireAuth, reservacionesController.getMias);

// Sin auth — panel admin
router.get("/", reservacionesController.getAll);
router.get("/:id", reservacionesController.getById);

// Con auth — escritura
router.post("/", requireAuth, reservacionesController.create);
router.patch("/:id/estado", requireAuth, reservacionesController.cambiarEstado);
router.patch("/:id/reembolso", requireAuth, reservacionesController.marcarReembolsoProcesado);

export default router;
