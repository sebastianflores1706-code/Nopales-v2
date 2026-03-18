import { Router } from "express";
import { documentosController } from "../controllers/documentos.controller";

const router = Router();

router.post("/generar-contrato", documentosController.generarContrato);
router.get("/reservacion/:reservacionId", documentosController.getByReservacionId);

export default router;
