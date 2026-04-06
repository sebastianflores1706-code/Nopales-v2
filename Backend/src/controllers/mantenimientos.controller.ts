import type { Request, Response } from "express";
import { mantenimientosService } from "../services/mantenimientos.service";

export const mantenimientosController = {
  async getAll(_req: Request, res: Response) {
    try {
      const data = await mantenimientosService.getAll();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const data = await mantenimientosService.getById(req.params.id);
      res.json(data);
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  },

  async create(req: Request, res: Response) {
    const { espacioId, fechaInicio, fechaFin, motivo } = req.body;
    if (!espacioId || !fechaInicio || !fechaFin || !motivo) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }
    try {
      const data = await mantenimientosService.create({ espacioId, fechaInicio, fechaFin, motivo });
      res.status(201).json(data);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      await mantenimientosService.delete(req.params.id);
      res.json({ ok: true });
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  },
};
