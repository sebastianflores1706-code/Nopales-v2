import { pagosRepository, type Pago } from "../repositories/pagos.repository";
import { reservacionesRepository } from "../repositories/reservaciones.repository";
import type { CreatePagoDto, CambiarEstadoPagoDto } from "../validators/pagos.schema";

function enrich(pago: Pago) {
  const reservacion = reservacionesRepository.findById(pago.reservacionId);
  return {
    ...pago,
    reservacionFolio: reservacion?.folio ?? "—",
    espacioNombre: reservacion?.espacioNombre ?? "—",
    solicitanteNombre: reservacion?.solicitanteNombre ?? "—",
  };
}

export const pagosService = {
  getAll() {
    return pagosRepository.findAll().map(enrich);
  },

  getById(id: string) {
    const pago = pagosRepository.findById(id);
    if (!pago) throw new Error("Pago no encontrado");
    return enrich(pago);
  },

  create(data: CreatePagoDto) {
    // Regla 1: la reservación debe existir
    const reservacion = reservacionesRepository.findById(data.reservacionId);
    if (!reservacion) throw new Error("La reservación especificada no existe");

    // Regla 2: la reservación debe estar aprobada
    if (reservacion.estado !== "aprobada") {
      throw new Error(
        `Solo se pueden registrar pagos para reservaciones aprobadas (estado actual: ${reservacion.estado})`
      );
    }

    return pagosRepository.create(data);
  },

  cambiarEstado(id: string, data: CambiarEstadoPagoDto) {
    const pago = pagosRepository.findById(id);
    if (!pago) throw new Error("Pago no encontrado");

    return pagosRepository.updateEstado(id, data.estado);
  },
};
