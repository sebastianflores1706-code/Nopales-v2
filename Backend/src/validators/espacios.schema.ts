import { z } from "zod";

export const tipoEspacioEnum = z.enum([
  "plaza",
  "auditorio",
  "parque",
  "salon",
  "cancha",
  "centro_cultural",
]);

export const estadoEspacioEnum = z.enum(["activo", "inactivo"]);

export const createEspacioSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  tipo: tipoEspacioEnum,
  ubicacion: z.string().min(1, "La ubicación es requerida"),
  capacidad: z.number().int().positive("La capacidad debe ser un número positivo"),
  costoHora: z.number().positive("El costo por hora debe ser un número positivo"),
  estado: estadoEspacioEnum.default("activo"),
  descripcion: z.string().optional(),
  reglas: z.string().optional(),
  horarioDisponible: z.string().optional(),
});

export const updateEspacioSchema = createEspacioSchema.partial();

export type CreateEspacioDto = z.infer<typeof createEspacioSchema>;
export type UpdateEspacioDto = z.infer<typeof updateEspacioSchema>;
