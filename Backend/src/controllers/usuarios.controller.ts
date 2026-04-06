import type { Request, Response } from "express";
import { z } from "zod";
import { usuariosService } from "../services/usuarios.service";

const createSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  correo: z.string().email("Correo inválido"),
  contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rol: z.enum(["admin", "ciudadano"], { message: "Rol inválido" }),
});

export const usuariosController = {
  async getAll(req: Request, res: Response) {
    if (req.usuario?.rol !== "admin") {
      return res.status(403).json({ error: "Acceso denegado: solo administradores" });
    }
    try {
      const usuarios = await usuariosService.getAll();
      res.json(usuarios);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  },

  async create(req: Request, res: Response) {
    if (req.usuario?.rol !== "admin") {
      return res.status(403).json({ error: "Acceso denegado: solo administradores" });
    }
    const result = createSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Datos inválidos", details: result.error.flatten() });
    }
    try {
      const usuario = await usuariosService.create(result.data);
      return res.status(201).json(usuario);
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  },
};
