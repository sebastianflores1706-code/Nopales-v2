import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "nopales_dev_secret_changeme";

interface JwtPayload {
  id: string;
  rol: "admin" | "ciudadano";
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.auth_token;

  if (!token) {
    return res.status(401).json({ error: "No autorizado: token requerido" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.usuario = { id: payload.id, rol: payload.rol };
    next();
  } catch {
    return res.status(401).json({ error: "No autorizado: token inválido o expirado" });
  }
}
