import type { Request, Response } from "express";
import { pagosService } from "../services/pagos.service";
import { createPagoSchema, cambiarEstadoPagoSchema } from "../validators/pagos.schema";

export const pagosController = {
  getAll(_req: Request, res: Response) {
    const pagos = pagosService.getAll();
    res.json(pagos);
  },

  getById(req: Request, res: Response) {
    try {
      const pago = pagosService.getById(req.params.id);
      res.json(pago);
    } catch {
      res.status(404).json({ error: "Pago no encontrado" });
    }
  },

  create(req: Request, res: Response) {
    const result = createPagoSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: result.error.flatten(),
      });
    }

    try {
      const nuevoPago = pagosService.create(result.data);
      return res.status(201).json(nuevoPago);
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  },

  cambiarEstado(req: Request, res: Response) {
    const result = cambiarEstadoPagoSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: result.error.flatten(),
      });
    }

    try {
      const pagoActualizado = pagosService.cambiarEstado(req.params.id, result.data);
      return res.json(pagoActualizado);
    } catch (err) {
      return res.status(404).json({ error: (err as Error).message });
    }
  },
};
