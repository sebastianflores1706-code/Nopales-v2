import { Router } from "express";
import { usuariosController } from "../controllers/usuarios.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, usuariosController.getAll);
router.post("/", requireAuth, usuariosController.create);

export default router;
