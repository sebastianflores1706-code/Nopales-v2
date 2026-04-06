import { randomUUID } from "crypto";
import pool from "../lib/db";

export interface Documento {
  id: string;
  reservacionId: string;
  tipo: string;
  nombreArchivo: string;
  contenido: string;
  createdAt: string;
  pdfPath?: string;
}

function toDocumento(row: Record<string, unknown>): Documento {
  return {
    id:            row.id as string,
    reservacionId: row.reservacion_id as string,
    tipo:          row.tipo as string,
    nombreArchivo: row.nombre_archivo as string,
    contenido:     row.contenido as string,
    createdAt:     row.creado_en instanceof Date
                     ? row.creado_en.toISOString()
                     : String(row.creado_en),
    pdfPath:       (row.pdf_path as string | null) ?? undefined,
  };
}

export const documentosRepository = {
  async findAll(): Promise<Documento[]> {
    const [rows] = await pool.query(
      "SELECT * FROM documentos ORDER BY creado_en DESC"
    );
    return (rows as Record<string, unknown>[]).map(toDocumento);
  },

  async findById(id: string): Promise<Documento | undefined> {
    const [rows] = await pool.query(
      "SELECT * FROM documentos WHERE id = ?",
      [id]
    );
    const list = rows as Record<string, unknown>[];
    return list.length ? toDocumento(list[0]) : undefined;
  },

  async findByReservacionId(reservacionId: string): Promise<Documento[]> {
    const [rows] = await pool.query(
      "SELECT * FROM documentos WHERE reservacion_id = ? ORDER BY creado_en DESC",
      [reservacionId]
    );
    return (rows as Record<string, unknown>[]).map(toDocumento);
  },

  async findByUsuarioId(usuarioId: string): Promise<Documento[]> {
    const [rows] = await pool.query(
      `SELECT d.*
       FROM documentos d
       INNER JOIN reservaciones r ON r.id = d.reservacion_id
       WHERE r.usuario_id = ?
       ORDER BY d.creado_en DESC`,
      [usuarioId]
    );
    return (rows as Record<string, unknown>[]).map(toDocumento);
  },

  async create(data: Omit<Documento, "id" | "createdAt" | "pdfPath">): Promise<Documento> {
    const id = randomUUID();
    await pool.query(
      `INSERT INTO documentos (id, reservacion_id, tipo, nombre_archivo, contenido)
       VALUES (?, ?, ?, ?, ?)`,
      [id, data.reservacionId, data.tipo, data.nombreArchivo, data.contenido]
    );
    return (await this.findById(id))!;
  },

  async updatePdfPath(id: string, pdfPath: string): Promise<Documento | undefined> {
    await pool.query(
      "UPDATE documentos SET pdf_path = ? WHERE id = ?",
      [pdfPath, id]
    );
    return this.findById(id);
  },
};
