import { randomUUID } from "crypto";
import pool from "../lib/db";
import type { CreateEspacioDto, UpdateEspacioDto } from "../validators/espacios.schema";

export interface Espacio {
  id: string;
  nombre: string;
  tipo: string;
  ubicacion: string;
  capacidad: number;
  costoHora: number;
  estado: string;
  descripcion?: string;
  reglas?: string;
  horarioDisponible?: string;
}

// Mapea una fila de MySQL al tipo Espacio del dominio.
// Necesario porque MySQL usa snake_case y el dominio usa camelCase.
function toEspacio(row: Record<string, unknown>): Espacio {
  return {
    id:                 row.id as string,
    nombre:             row.nombre as string,
    tipo:               row.tipo as string,
    ubicacion:          row.ubicacion as string,
    capacidad:          row.capacidad as number,
    costoHora:          row.costo_hora as number,
    estado:             row.estado as string,
    descripcion:        row.descripcion as string | undefined,
    reglas:             row.reglas as string | undefined,
    horarioDisponible:  row.horario_disponible as string | undefined,
  };
}

export const espaciosRepository = {
  async findAll(): Promise<Espacio[]> {
    const [rows] = await pool.query("SELECT * FROM espacios ORDER BY creado_en ASC");
    return (rows as Record<string, unknown>[]).map(toEspacio);
  },

  async findById(id: string): Promise<Espacio | undefined> {
    const [rows] = await pool.query(
      "SELECT * FROM espacios WHERE id = ?",
      [id]
    );
    const list = rows as Record<string, unknown>[];
    if (list.length === 0) return undefined;
    return toEspacio(list[0]);
  },

  async create(data: CreateEspacioDto): Promise<Espacio> {
    const id = randomUUID();
    await pool.query(
      `INSERT INTO espacios
        (id, nombre, tipo, ubicacion, capacidad, costo_hora, estado, descripcion, reglas, horario_disponible)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.nombre,
        data.tipo,
        data.ubicacion,
        data.capacidad,
        data.costoHora,
        data.estado ?? "activo",
        data.descripcion   ?? null,
        data.reglas        ?? null,
        data.horarioDisponible ?? null,
      ]
    );
    return (await this.findById(id))!;
  },

  async update(id: string, data: UpdateEspacioDto): Promise<Espacio | undefined> {
    // Construye dinámicamente solo las columnas que vienen en el payload.
    const columnMap: Record<string, string> = {
      nombre:            "nombre",
      tipo:              "tipo",
      ubicacion:         "ubicacion",
      capacidad:         "capacidad",
      costoHora:         "costo_hora",
      estado:            "estado",
      descripcion:       "descripcion",
      reglas:            "reglas",
      horarioDisponible: "horario_disponible",
    };

    const sets: string[] = [];
    const values: unknown[] = [];

    for (const [key, col] of Object.entries(columnMap)) {
      if (key in data) {
        sets.push(`${col} = ?`);
        values.push((data as Record<string, unknown>)[key]);
      }
    }

    if (sets.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(
      `UPDATE espacios SET ${sets.join(", ")} WHERE id = ?`,
      values
    );
    return this.findById(id);
  },

  async delete(id: string): Promise<boolean> {
    const [result] = await pool.query(
      "DELETE FROM espacios WHERE id = ?",
      [id]
    );
    return (result as { affectedRows: number }).affectedRows > 0;
  },
};
