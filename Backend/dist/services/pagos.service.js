"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagosService = void 0;
const pagos_repository_1 = require("../repositories/pagos.repository");
const reservaciones_repository_1 = require("../repositories/reservaciones.repository");
async function enrich(pago) {
    const [reservacion, todosPagos] = await Promise.all([
        reservaciones_repository_1.reservacionesRepository.findById(pago.reservacionId),
        pagos_repository_1.pagosRepository.findByReservacionId(pago.reservacionId),
    ]);
    const montoTotal = reservacion?.montoTotal ?? 0;
    // Solo contar pagos no cancelados para el cálculo financiero
    const pagosValidos = todosPagos.filter((p) => p.estado !== "cancelado");
    const totalPagado = pagosValidos.reduce((sum, p) => sum + p.monto, 0);
    const saldoPendiente = Math.max(0, montoTotal - totalPagado);
    // Estado financiero de la reservación, independiente del estado del pago individual
    const estadoFinanciero = totalPagado === 0
        ? "pendiente"
        : saldoPendiente > 0
            ? "anticipo"
            : "pagado";
    return {
        ...pago,
        reservacionFolio: reservacion?.folio ?? "—",
        espacioNombre: reservacion?.espacioNombre ?? "—",
        solicitanteNombre: reservacion?.solicitanteNombre ?? "—",
        tipoEvento: reservacion?.tipoEvento ?? "—",
        fechaEvento: reservacion?.fecha ?? "—",
        horaInicio: reservacion?.horaInicio ?? "—",
        horaFin: reservacion?.horaFin ?? "—",
        reservacionId: pago.reservacionId,
        montoTotal,
        totalPagado,
        saldoPendiente,
        estadoFinanciero,
    };
}
exports.pagosService = {
    async getAll() {
        const pagos = await pagos_repository_1.pagosRepository.findAll();
        return Promise.all(pagos.map(enrich));
    },
    async getMios(usuarioId) {
        const pagos = await pagos_repository_1.pagosRepository.findByUsuarioId(usuarioId);
        return Promise.all(pagos.map(enrich));
    },
    async getById(id) {
        const pago = await pagos_repository_1.pagosRepository.findById(id);
        if (!pago)
            throw new Error("Pago no encontrado");
        return enrich(pago);
    },
    async create(data) {
        // Regla 1: la reservación debe existir
        const reservacion = await reservaciones_repository_1.reservacionesRepository.findById(data.reservacionId);
        if (!reservacion)
            throw new Error("La reservación especificada no existe");
        // Regla 2: la reservación debe estar aprobada
        if (reservacion.estado !== "aprobada") {
            throw new Error(`Solo se pueden registrar pagos para reservaciones aprobadas (estado actual: ${reservacion.estado})`);
        }
        const nuevoPago = await pagos_repository_1.pagosRepository.create(data);
        // Regla 3: si el total acumulado ya cubre el monto completo de la reservación,
        // marcar todos los pagos anteriores "pendiente" como "pagado".
        // Esto preserva el historial sin dejar inconsistencias de estado.
        if (reservacion.montoTotal > 0) {
            const todosPagos = await pagos_repository_1.pagosRepository.findByReservacionId(data.reservacionId);
            const totalPagado = todosPagos
                .filter((p) => p.estado !== "cancelado")
                .reduce((sum, p) => sum + p.monto, 0);
            if (totalPagado >= reservacion.montoTotal) {
                await pagos_repository_1.pagosRepository.markAllPendienteAsPagado(data.reservacionId);
            }
        }
        return nuevoPago;
    },
    async cambiarEstado(id, data) {
        const pago = await pagos_repository_1.pagosRepository.findById(id);
        if (!pago)
            throw new Error("Pago no encontrado");
        return pagos_repository_1.pagosRepository.updateEstado(id, data.estado);
    },
};
