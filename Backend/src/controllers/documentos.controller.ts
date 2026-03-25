import type { Request, Response } from "express";
import { documentosService } from "../services/documentos.service";
import { generarContratoSchema } from "../validators/documentos.schema";

export const documentosController = {
  async getAll(_req: Request, res: Response) {
    try {
      const documentos = await documentosService.getAll();
      res.json(documentos);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  },

  async getByReservacionId(req: Request, res: Response) {
    try {
      const documentos = await documentosService.getByReservacionId(req.params.reservacionId);
      res.json(documentos);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  },

  async generarContrato(req: Request, res: Response) {
    const result = generarContratoSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: result.error.flatten(),
      });
    }

    try {
      const { duplicado, documento } = await documentosService.generarContrato(result.data);

      if (duplicado) {
        return res.status(409).json({
          error: "Ya existe un contrato para esta reservación",
          documento,
        });
      }

      return res.status(201).json(documento);
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  },
};
