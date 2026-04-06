import { randomUUID } from "crypto";
import pool from "../lib/db";

export interface ImagenEspacio {
  id: string;
  espacioId: string;
  url: string;
  creadoEn: string;
}

function toImagen(row: Record<string, unknown>): ImagenEspacio {
  return {
    id:        row.id as string,
    espacioId: row.espacio_id as string,
    url:       row.url as string,
    creadoEn:  row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

export const imagenesEspacioRepository = {
  async findByEspacioId(espacioId: string): Promise<ImagenEspacio[]> {
    const [rows] = await pool.query(
      "SELECT * FROM imagenes_espacio WHERE espacio_id = ? ORDER BY created_at ASC",
      [espacioId]
    );
    return (rows as Record<string, unknown>[]).map(toImagen);
  },

  async findById(id: string): Promise<ImagenEspacio | undefined> {
    const [rows] = await pool.query("SELECT * FROM imagenes_espacio WHERE id = ?", [id]);
    const list = rows as Record<string, unknown>[];
    return list.length ? toImagen(list[0]) : undefined;
  },

  async create(espacioId: string, url: string): Promise<ImagenEspacio> {
    const id = randomUUID();
    await pool.query(
      "INSERT INTO imagenes_espacio (id, espacio_id, url) VALUES (?, ?, ?)",
      [id, espacioId, url]
    );
    return (await this.findById(id))!;
  },

  async delete(id: string): Promise<void> {
    await pool.query("DELETE FROM imagenes_espacio WHERE id = ?", [id]);
  },
};
