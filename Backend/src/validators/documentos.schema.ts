import { z } from "zod";

export const tipoDocumentoEnum = z.enum(["contrato"]);

export const generarContratoSchema = z.object({
  reservacionId: z.string().min(1, "El reservacionId es requerido"),
});

export type GenerarContratoDto = z.infer<typeof generarContratoSchema>;
