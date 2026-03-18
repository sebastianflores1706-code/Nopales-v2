import { Router } from "express";
import { pagosController } from "../controllers/pagos.controller";

const router = Router();

router.get("/", pagosController.getAll);
router.get("/:id", pagosController.getById);
router.post("/", pagosController.create);
router.patch("/:id/estado", pagosController.cambiarEstado);

export default router;
