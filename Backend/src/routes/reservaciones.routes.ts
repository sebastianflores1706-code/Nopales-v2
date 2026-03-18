import { Router } from "express";
import { reservacionesController } from "../controllers/reservaciones.controller";

const router = Router();

router.get("/", reservacionesController.getAll);
router.get("/:id", reservacionesController.getById);
router.post("/", reservacionesController.create);
router.patch("/:id/estado", reservacionesController.cambiarEstado);

export default router;
