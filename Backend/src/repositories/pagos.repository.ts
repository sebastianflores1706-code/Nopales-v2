import { randomUUID } from "crypto";
import type { CreatePagoDto } from "../validators/pagos.schema";

export interface Pago {
  id: string;
  reservacionId: string;
  monto: number;
  estado: string;
  metodo: string;
  referencia?: string;
  fechaPago?: string;
}

const pagos: Pago[] = [];

function hoy(): string {
  return new Date().toISOString().slice(0, 10);
}

export const pagosRepository = {
  findAll(): Pago[] {
    return pagos;
  },

  findById(id: string): Pago | undefined {
    return pagos.find((p) => p.id === id);
  },

  findByReservacionId(reservacionId: string): Pago[] {
    return pagos.filter((p) => p.reservacionId === reservacionId);
  },

  create(data: CreatePagoDto): Pago {
    const nuevo: Pago = {
      id: randomUUID(),
      reservacionId: data.reservacionId,
      monto: data.monto,
      estado: data.estado,
      metodo: data.metodo,
      referencia: data.referencia,
      fechaPago: data.estado === "pagado" ? hoy() : undefined,
    };
    pagos.push(nuevo);
    return nuevo;
  },

  updateEstado(id: string, estado: string): Pago | undefined {
    const index = pagos.findIndex((p) => p.id === id);
    if (index === -1) return undefined;
    const fechaPago =
      estado === "pagado" && !pagos[index].fechaPago ? hoy() : pagos[index].fechaPago;
    pagos[index] = { ...pagos[index], estado, fechaPago };
    return pagos[index];
  },
};
