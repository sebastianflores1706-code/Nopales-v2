import { z } from "zod";

export const estadoReservacionEnum = z.enum([
  "pendiente_revision",
  "aprobada",
  "rechazada",
  "cancelada",
  "finalizada",
]);

export const pagoEstadoEnum = z.enum(["pendiente", "pagado", "cancelado"]);

const horaRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const createReservacionSchema = z.object({
  espacioId: z.string().min(1, "El espacioId es requerido"),
  solicitanteNombre: z.string().min(1, "El nombre del solicitante es requerido"),
  tipoEvento: z.string().min(1, "El tipo de evento es requerido"),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD"),
  horaInicio: z.string().regex(horaRegex, "La hora de inicio debe tener formato HH:MM"),
  horaFin: z.string().regex(horaRegex, "La hora de fin debe tener formato HH:MM"),
  asistentes: z.number().int().positive("El número de asistentes debe ser positivo"),
  descripcionEvento: z.string().optional(),
  pagoEstado: pagoEstadoEnum.default("pendiente"),
}).refine((d) => d.horaInicio < d.horaFin, {
  message: "La hora de fin debe ser posterior a la hora de inicio",
  path: ["horaFin"],
});

export const cambiarEstadoSchema = z.object({
  estado: estadoReservacionEnum,
});

export type CreateReservacionDto = z.infer<typeof createReservacionSchema>;
export type CambiarEstadoDto = z.infer<typeof cambiarEstadoSchema>;
