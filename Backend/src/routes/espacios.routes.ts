import { Router } from "express";
import { espaciosController } from "../controllers/espacios.controller";

const router = Router();

router.get("/", espaciosController.getAll);
router.get("/:id", espaciosController.getById);
router.post("/", espaciosController.create);
router.put("/:id", espaciosController.update);
router.delete("/:id", espaciosController.delete);

export default router;
