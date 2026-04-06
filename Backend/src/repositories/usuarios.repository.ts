import { randomUUID } from "crypto";
import pool from "../lib/db.postgres";

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  hashContrasena: string;
  rol: "admin" | "ciudadano";
}

export interface UsuarioPublico {
  id: string;
  nombre: string;
  correo: string;
  rol: "admin" | "ciudadano";
  creadoEn: string;
}

function toUsuario(row: Record<string, unknown>): Usuario {
  return {
    id: row.id as string,
    nombre: row.nombre as string,
    correo: row.correo as string,
    hashContrasena: row.hash_contrasena as string,
    rol: row.rol as "admin" | "ciudadano",
  };
}

function toUsuarioPublico(row: Record<string, unknown>): UsuarioPublico {
  return {
    id: row.id as string,
    nombre: row.nombre as string,
    correo: row.correo as string,
    rol: row.rol as "admin" | "ciudadano",
    creadoEn:
      row.creado_en instanceof Date
        ? row.creado_en.toISOString()
        : String(row.creado_en ?? ""),
  };
}

export const usuariosRepository = {
  async findAll(): Promise<UsuarioPublico[]> {
    const { rows } = await pool.query(
      "SELECT id, nombre, correo, rol, creado_en FROM usuarios ORDER BY nombre ASC"
    );
    return (rows as Record<string, unknown>[]).map(toUsuarioPublico);
  },

  async findByCorreo(correo: string): Promise<Usuario | undefined> {
    const { rows } = await pool.query(
      "SELECT id, nombre, correo, hash_contrasena, rol FROM usuarios WHERE correo = $1",
      [correo]
    );
    const list = rows as Record<string, unknown>[];
    if (list.length === 0) return undefined;
    return toUsuario(list[0]);
  },

  async findById(id: string): Promise<Usuario | undefined> {
    const { rows } = await pool.query(
      "SELECT id, nombre, correo, hash_contrasena, rol FROM usuarios WHERE id = $1",
      [id]
    );
    const list = rows as Record<string, unknown>[];
    if (list.length === 0) return undefined;
    return toUsuario(list[0]);
  },

  async create(data: {
    nombre: string;
    correo: string;
    hashContrasena: string;
    rol?: "admin" | "ciudadano";
  }): Promise<Usuario> {
    const id = randomUUID();
    const rol = data.rol ?? "ciudadano";
    await pool.query(
      "INSERT INTO usuarios (id, nombre, correo, hash_contrasena, rol) VALUES ($1, $2, $3, $4, $5)",
      [id, data.nombre, data.correo, data.hashContrasena, rol]
    );
    const usuario = await this.findById(id);
    return usuario!;
  },
};
