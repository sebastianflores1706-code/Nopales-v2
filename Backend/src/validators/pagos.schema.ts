import { z } from "zod";

export const estadoPagoEnum = z.enum(["pendiente", "pagado", "cancelado"]);

export const metodoPagoEnum = z.enum(["efectivo", "transferencia", "tarjeta"]);

export const createPagoSchema = z.object({
  reservacionId: z.string().min(1, "El reservacionId es requerido"),
  monto: z.number().positive("El monto debe ser un número positivo"),
  estado: estadoPagoEnum.default("pendiente"),
  metodo: metodoPagoEnum,
  referencia: z.string().optional(),
});

export const cambiarEstadoPagoSchema = z.object({
  estado: estadoPagoEnum,
});

export type CreatePagoDto = z.infer<typeof createPagoSchema>;
export type CambiarEstadoPagoDto = z.infer<typeof cambiarEstadoPagoSchema>;
