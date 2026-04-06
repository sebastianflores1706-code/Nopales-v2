import { Router } from "express";
import { imagenesController } from "../controllers/imagenes.controller";
import { uploadImagenes } from "../lib/upload";

const router = Router({ mergeParams: true });

// POST /api/espacios/:id/imagenes  — sube una o varias imágenes
router.post("/", uploadImagenes.array("imagenes", 6), imagenesController.subirImagenes);

// DELETE /api/espacios/:id/imagenes/:imagenId  — elimina una imagen
router.delete("/:imagenId", imagenesController.eliminarImagen);

export default router;
