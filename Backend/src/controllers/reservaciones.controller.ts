import type { Request, Response } from "express";
import { reservacionesService } from "../services/reservaciones.service";
import { createReservacionSchema, cambiarEstadoSchema } from "../validators/reservaciones.schema";

export const reservacionesController = {
  async getAll(_req: Request, res: Response) {
    const reservaciones = await reservacionesService.getAll({});
    res.json(reservaciones);
  },

  async getMias(req: Request, res: Response) {
    const { id: usuarioId } = req.usuario!;
    const reservaciones = await reservacionesService.getAll({ usuarioId });
    res.json(reservaciones);
  },

  async getById(req: Request, res: Response) {
    try {
      const reservacion = await reservacionesService.getById(req.params.id);
      res.json(reservacion);
    } catch {
      res.status(404).json({ error: "Reservación no encontrada" });
    }
  },

  async create(req: Request, res: Response) {
    const result = createReservacionSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: result.error.flatten(),
      });
    }

    const { id: authUserId, rol } = req.usuario!;

    // Ciudadano: usuario_id siempre del token
    // Admin: puede especificar usuario_id en el body (Opción B), o queda null
    let usuarioId: string | null;
    if (rol === "ciudadano") {
      usuarioId = authUserId;
    } else {
      const bodyUsuarioId = req.body.usuario_id;
      usuarioId =
        typeof bodyUsuarioId === "string" && bodyUsuarioId.length > 0 ? bodyUsuarioId : null;
    }

    try {
      const nueva = await reservacionesService.create(result.data, usuarioId);
      return res.status(201).json(nueva);
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  },

  async marcarReembolsoProcesado(req: Request, res: Response) {
    try {
      const actualizada = await reservacionesService.marcarReembolsoProcesado(req.params.id);
      return res.json(actualizada);
    } catch (err) {
      const message = (err as Error).message;
      const status = message.includes("no encontrada") ? 404 : 400;
      return res.status(status).json({ error: message });
    }
  },

  async cambiarEstado(req: Request, res: Response) {
    const result = cambiarEstadoSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: result.error.flatten(),
      });
    }

    try {
      const actualizada = await reservacionesService.cambiarEstado(req.params.id, result.data);
      return res.json(actualizada);
    } catch (err) {
      const message = (err as Error).message;
      const status = message.includes("no encontrada") ? 404 : 400;
      return res.status(status).json({ error: message });
    }
  },
};
