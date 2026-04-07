"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const imagenes_controller_1 = require("../controllers/imagenes.controller");
const upload_1 = require("../lib/upload");
const router = (0, express_1.Router)({ mergeParams: true });
// POST /api/espacios/:id/imagenes  — sube una o varias imágenes
router.post("/", upload_1.uploadImagenes.array("imagenes", 6), imagenes_controller_1.imagenesController.subirImagenes);
// DELETE /api/espacios/:id/imagenes/:imagenId  — elimina una imagen
router.delete("/:imagenId", imagenes_controller_1.imagenesController.eliminarImagen);
exports.default = router;
