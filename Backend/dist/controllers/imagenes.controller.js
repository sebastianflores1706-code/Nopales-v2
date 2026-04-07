"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imagenesController = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const imagenesEspacio_repository_1 = require("../repositories/imagenesEspacio.repository");
exports.imagenesController = {
    async subirImagenes(req, res) {
        try {
            const { id: espacioId } = req.params;
            const files = req.files;
            if (!files || files.length === 0) {
                res.status(400).json({ error: "No se recibieron archivos" });
                return;
            }
            const imagenes = await Promise.all(files.map((file) => {
                const url = `/uploads/espacios/${file.filename}`;
                return imagenesEspacio_repository_1.imagenesEspacioRepository.create(espacioId, url);
            }));
            res.status(201).json(imagenes);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al subir imágenes" });
        }
    },
    async eliminarImagen(req, res) {
        try {
            const { imagenId } = req.params;
            const imagen = await imagenesEspacio_repository_1.imagenesEspacioRepository.findById(imagenId);
            if (!imagen) {
                res.status(404).json({ error: "Imagen no encontrada" });
                return;
            }
            // Eliminar el archivo del disco
            const filePath = path_1.default.resolve(process.cwd(), imagen.url.replace(/^\//, ""));
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
            await imagenesEspacio_repository_1.imagenesEspacioRepository.delete(imagenId);
            res.status(204).send();
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al eliminar la imagen" });
        }
    },
};
