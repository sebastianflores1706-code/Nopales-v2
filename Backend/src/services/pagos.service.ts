import { pagosRepository, type Pago } from "../repositories/pagos.repository";
import { reservacionesRepository } from "../repositories/reservaciones.repository";
import type { CreatePagoDto, CambiarEstadoPagoDto } from "../validators/pagos.schema";

async function enrich(pago: Pago) {
  const [reservacion, todosPagos] = await Promise.all([
    reservacionesRepository.findById(pago.reservacionId),
    pagosRepository.findByReservacionId(pago.reservacionId),
  ]);

  const montoTotal = reservacion?.montoTotal ?? 0;
  // Solo contar pagos no cancelados para el cálculo financiero
  const pagosValidos = todosPagos.filter((p) => p.estado !== "cancelado");
  const totalPagado = pagosValidos.reduce((sum, p) => sum + p.monto, 0);
  const saldoPendiente = Math.max(0, montoTotal - totalPagado);
  // Estado financiero de la reservación, independiente del estado del pago individual
  const estadoFinanciero =
    totalPagado === 0
      ? "pendiente"
      : saldoPendiente > 0
      ? "anticipo"
      : "pagado";

  return {
    ...pago,
    reservacionFolio:  reservacion?.folio             ?? "—",
    espacioNombre:     reservacion?.espacioNombre      ?? "—",
    solicitanteNombre: reservacion?.solicitanteNombre  ?? "—",
    tipoEvento:        reservacion?.tipoEvento         ?? "—",
    fechaEvento:       reservacion?.fecha              ?? "—",
    horaInicio:        reservacion?.horaInicio         ?? "—",
    horaFin:           reservacion?.horaFin            ?? "—",
    reservacionId:     pago.reservacionId,
    montoTotal,
    totalPagado,
    saldoPendiente,
    estadoFinanciero,
  };
}

export const pagosService = {
  async getAll() {
    const pagos = await pagosRepository.findAll();
    return Promise.all(pagos.map(enrich));
  },

  async getMios(usuarioId: string) {
    const pagos = await pagosRepository.findByUsuarioId(usuarioId);
    return Promise.all(pagos.map(enrich));
  },

  async getById(id: string) {
    const pago = await pagosRepository.findById(id);
    if (!pago) throw new Error("Pago no encontrado");
    return enrich(pago);
  },

  async create(data: CreatePagoDto) {
    // Regla 1: la reservación debe existir
    const reservacion = await reservacionesRepository.findById(data.reservacionId);
    if (!reservacion) throw new Error("La reservación especificada no existe");

    // Regla 2: la reservación debe estar aprobada
    if (reservacion.estado !== "aprobada") {
      throw new Error(
        `Solo se pueden registrar pagos para reservaciones aprobadas (estado actual: ${reservacion.estado})`
      );
    }

    const nuevoPago = await pagosRepository.create(data);

    // Regla 3: si el total acumulado ya cubre el monto completo de la reservación,
    // marcar todos los pagos anteriores "pendiente" como "pagado".
    // Esto preserva el historial sin dejar inconsistencias de estado.
    if (reservacion.montoTotal > 0) {
      const todosPagos = await pagosRepository.findByReservacionId(data.reservacionId);
      const totalPagado = todosPagos
        .filter((p) => p.estado !== "cancelado")
        .reduce((sum, p) => sum + p.monto, 0);
      if (totalPagado >= reservacion.montoTotal) {
        await pagosRepository.markAllPendienteAsPagado(data.reservacionId);
      }
    }

    return nuevoPago;
  },

  async cambiarEstado(id: string, data: CambiarEstadoPagoDto) {
    const pago = await pagosRepository.findById(id);
    if (!pago) throw new Error("Pago no encontrado");

    return pagosRepository.updateEstado(id, data.estado);
  },
};
