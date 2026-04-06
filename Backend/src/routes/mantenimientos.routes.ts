import { Router } from "express";
import { mantenimientosController } from "../controllers/mantenimientos.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", mantenimientosController.getAll);
router.get("/:id", mantenimientosController.getById);
router.post("/", requireAuth, mantenimientosController.create);
router.delete("/:id", requireAuth, mantenimientosController.delete);

export default router;
