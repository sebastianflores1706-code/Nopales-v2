import type { Request, Response } from "express";
import { espaciosService } from "../services/espacios.service";
import {
  createEspacioSchema,
  updateEspacioSchema,
} from "../validators/espacios.schema";

export const espaciosController = {
  async getAll(_req: Request, res: Response) {
    const espacios = await espaciosService.getAll();
    res.json(espacios);
  },

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const espacio = await espaciosService.getById(id);
      res.json(espacio);
    } catch {
      res.status(404).json({ error: "Espacio no encontrado" });
    }
  },

  async create(req: Request, res: Response) {
    const result = createEspacioSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: result.error.flatten(),
      });
    }

    const nuevoEspacio = await espaciosService.create(result.data);
    return res.status(201).json(nuevoEspacio);
  },

  async update(req: Request, res: Response) {
    const result = updateEspacioSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: result.error.flatten(),
      });
    }

    try {
      const id = req.params.id as string;
      const espacioActualizado = await espaciosService.update(id, result.data);
      return res.json(espacioActualizado);
    } catch {
      return res.status(404).json({ error: "Espacio no encontrado" });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await espaciosService.delete(id);
      return res.status(204).send();
    } catch {
      return res.status(404).json({ error: "Espacio no encontrado" });
    }
  },
};
