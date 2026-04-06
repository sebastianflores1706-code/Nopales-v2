import type { Request, Response } from "express";
import { z } from "zod";
import { authService } from "../services/auth.service";
import { usuariosRepository } from "../repositories/usuarios.repository";

const COOKIE_NAME = "auth_token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
  secure: process.env.NODE_ENV === "production",
};

const loginSchema = z.object({
  correo: z.string().email("Correo inválido"),
  contrasena: z.string().min(1, "La contraseña es requerida"),
});

const registerSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  correo: z.string().email("Correo inválido"),
  contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const authController = {
  async login(req: Request, res: Response) {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Datos inválidos", details: result.error.flatten() });
    }
    try {
      const data = await authService.login(result.data.correo, result.data.contrasena);
      res.cookie(COOKIE_NAME, data.token, COOKIE_OPTIONS);
      return res.json({ usuario: data.usuario });
    } catch (err) {
      return res.status(401).json({ error: (err as Error).message });
    }
  },

  async register(req: Request, res: Response) {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Datos inválidos", details: result.error.flatten() });
    }
    try {
      const data = await authService.register(
        result.data.nombre,
        result.data.correo,
        result.data.contrasena
      );
      res.cookie(COOKIE_NAME, data.token, COOKIE_OPTIONS);
      return res.status(201).json({ usuario: data.usuario });
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  },

  async me(req: Request, res: Response) {
    // req.usuario ya viene del middleware requireAuth
    const usuario = await usuariosRepository.findById(req.usuario!.id);
    if (!usuario) return res.status(401).json({ error: "Usuario no encontrado" });
    return res.json({
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
    });
  },

  logout(_req: Request, res: Response) {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
    return res.json({ ok: true });
  },
};
