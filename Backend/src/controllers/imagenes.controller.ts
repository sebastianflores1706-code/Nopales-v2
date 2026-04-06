import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { imagenesEspacioRepository } from "../repositories/imagenesEspacio.repository";

export const imagenesController = {
  async subirImagenes(req: Request, res: Response) {
    try {
      const { id: espacioId } = req.params;
      const files = req.files as Express.Multer.File[] | undefined;

      if (!files || files.length === 0) {
        res.status(400).json({ error: "No se recibieron archivos" });
        return;
      }

      const imagenes = await Promise.all(
        files.map((file) => {
          const url = `/uploads/espacios/${file.filename}`;
          return imagenesEspacioRepository.create(espacioId, url);
        })
      );

      res.status(201).json(imagenes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al subir imágenes" });
    }
  },

  async eliminarImagen(req: Request, res: Response) {
    try {
      const { imagenId } = req.params;

      const imagen = await imagenesEspacioRepository.findById(imagenId);
      if (!imagen) {
        res.status(404).json({ error: "Imagen no encontrada" });
        return;
      }

      // Eliminar el archivo del disco
      const filePath = path.resolve(process.cwd(), imagen.url.replace(/^\//, ""));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await imagenesEspacioRepository.delete(imagenId);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al eliminar la imagen" });
    }
  },
};
