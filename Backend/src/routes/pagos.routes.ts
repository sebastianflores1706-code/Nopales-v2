import { Router } from "express";
import { pagosController } from "../controllers/pagos.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// /mis DEBE ir antes de /:id para que Express no lo trate como parámetro
router.get("/mis", requireAuth, pagosController.getMios);

// Sin auth — panel admin
router.get("/", pagosController.getAll);
router.get("/:id", pagosController.getById);

// Con auth — escritura
router.post("/", requireAuth, pagosController.create);
router.patch("/:id/estado", requireAuth, pagosController.cambiarEstado);

export default router;
