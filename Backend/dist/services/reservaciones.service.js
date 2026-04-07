"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservacionesService = void 0;
const reservaciones_repository_1 = require("../repositories/reservaciones.repository");
const espacios_repository_1 = require("../repositories/espacios.repository");
const pagos_repository_1 = require("../repositories/pagos.repository");
const mantenimientos_repository_1 = require("../repositories/mantenimientos.repository");
async function enrichReservacion(reservacion) {
    const pagos = await pagos_repository_1.pagosRepository.findByReservacionId(reservacion.id);
    // Solo contar pagos no cancelados para el cálculo financiero
    const pagosValidos = pagos.filter((p) => p.estado !== "cancelado");
    const totalPagado = pagosValidos.reduce((sum, p) => sum + p.monto, 0);
    const saldoPendiente = Math.max(0, reservacion.montoTotal - totalPagado);
    // Estado financiero basado en montos, no en el estado individual de cada pago
    const pagoEstado = totalPagado === 0
        ? "pendiente"
        : saldoPendiente > 0
            ? "anticipo"
            : "pagado";
    // Para reservaciones canceladas sin datos de reembolso en BD (canceladas antes de la migración),
    // derivar el estado dinámicamente desde los pagos ya calculados arriba.
    let reembolsoEstado = reservacion.reembolsoEstado;
    let reembolsoMonto = reservacion.reembolsoMonto;
    if (reservacion.estado === "cancelada" && !reembolsoEstado) {
        reembolsoEstado = totalPagado > 0 ? "pendiente" : "no_aplica";
        reembolsoMonto = totalPagado;
    }
    return { ...reservacion, pagoEstado, totalPagado, saldoPendiente, reembolsoEstado, reembolsoMonto };
}
const ESTADOS_CON_OCUPACION = new Set(["pendiente_revision", "aprobada", "en_uso"]);
const TRANSICIONES_VALIDAS = {
    pendiente_revision: ["aprobada", "rechazada", "cancelada"],
    aprobada: ["cancelada"],
    rechazada: [],
    cancelada: [],
    finalizada: [],
};
function hayTraslape(inicioNueva, finNueva, inicioExistente, finExistente) {
    return inicioNueva < finExistente && inicioExistente < finNueva;
}
exports.reservacionesService = {
    async getAll(filter) {
        await reservaciones_repository_1.reservacionesRepository.finalizarVencidas();
        const reservaciones = filter?.usuarioId
            ? await reservaciones_repository_1.reservacionesRepository.findByUsuarioId(filter.usuarioId)
            : await reservaciones_repository_1.reservacionesRepository.findAll();
        return Promise.all(reservaciones.map(enrichReservacion));
    },
    async getById(id) {
        await reservaciones_repository_1.reservacionesRepository.finalizarVencidas();
        const reservacion = await reservaciones_repository_1.reservacionesRepository.findById(id);
        if (!reservacion)
            throw new Error("Reservación no encontrada");
        return enrichReservacion(reservacion);
    },
    async create(data, usuarioId = null) {
        // Regla 2: el espacio debe existir
        const espacio = await espacios_repository_1.espaciosRepository.findById(data.espacioId);
        if (!espacio)
            throw new Error("El espacio especificado no existe");
        // Regla 3: el espacio no puede estar inactivo
        if (espacio.estado === "inactivo") {
            throw new Error("No se puede reservar un espacio inactivo");
        }
        // Regla 4: asistentes no puede superar la capacidad
        if (data.asistentes > espacio.capacidad) {
            throw new Error(`El número de asistentes (${data.asistentes}) supera la capacidad del espacio (${espacio.capacidad})`);
        }
        // Regla 5: validar traslape de horario
        const reservacionesMismoDia = await reservaciones_repository_1.reservacionesRepository.findByEspacioFecha(data.espacioId, data.fecha);
        const traslape = reservacionesMismoDia.find((r) => ESTADOS_CON_OCUPACION.has(r.estado) &&
            hayTraslape(data.horaInicio, data.horaFin, r.horaInicio, r.horaFin));
        if (traslape) {
            throw new Error(`El espacio ya tiene una reservación (${traslape.folio}) en ese horario: ${traslape.horaInicio} – ${traslape.horaFin}`);
        }
        // Regla 6: validar que no haya mantenimiento programado en ese horario
        const mantenimientoEnRango = await mantenimientos_repository_1.mantenimientosRepository.findTraslapeMantenimiento(data.espacioId, `${data.fecha}T${data.horaInicio}:00`, `${data.fecha}T${data.horaFin}:00`);
        if (mantenimientoEnRango.length > 0) {
            throw new Error("No se puede crear la reservación: el espacio tiene mantenimiento programado en ese horario");
        }
        return reservaciones_repository_1.reservacionesRepository.create(data, espacio.nombre, usuarioId);
    },
    async marcarReembolsoProcesado(id) {
        const reservacion = await reservaciones_repository_1.reservacionesRepository.findById(id);
        if (!reservacion)
            throw new Error("Reservación no encontrada");
        if (reservacion.estado !== "cancelada")
            throw new Error("Solo se puede procesar el reembolso de reservaciones canceladas");
        // Calcular monto real desde pagos (cubre tanto registros nuevos como históricos con reembolso_monto = 0)
        const pagos = await pagos_repository_1.pagosRepository.findByReservacionId(id);
        const pagosValidos = pagos.filter((p) => p.estado !== "cancelado");
        const totalPagado = pagosValidos.reduce((s, p) => s + p.monto, 0);
        if (totalPagado === 0)
            throw new Error("Esta reservación no tiene pagos que reembolsar");
        // Permitir marcar como procesado si está pendiente o si es null (registro histórico)
        const estadoActual = reservacion.reembolsoEstado;
        if (estadoActual && estadoActual !== "pendiente")
            throw new Error("El reembolso no está en estado pendiente");
        return reservaciones_repository_1.reservacionesRepository.updateCancelacion(id, "procesado", totalPagado);
    },
    async cambiarEstado(id, data) {
        const reservacion = await reservaciones_repository_1.reservacionesRepository.findById(id);
        if (!reservacion)
            throw new Error("Reservación no encontrada");
        const transicionesPermitidas = TRANSICIONES_VALIDAS[reservacion.estado] ?? [];
        if (!transicionesPermitidas.includes(data.estado)) {
            throw new Error(`Transición inválida: no se puede pasar de "${reservacion.estado}" a "${data.estado}"`);
        }
        // Regla extra: cancelar una reservación aprobada solo es válido
        // si el evento aún no ha iniciado.
        if (reservacion.estado === "aprobada" && data.estado === "cancelada") {
            const inicioEvento = new Date(`${reservacion.fecha}T${reservacion.horaInicio}:00`);
            if (new Date() >= inicioEvento) {
                throw new Error("No se puede cancelar una reservación aprobada cuyo evento ya inició o ya pasó");
            }
        }
        // Al cancelar: calcular si hay monto abonado para determinar reembolso
        if (data.estado === "cancelada") {
            const pagos = await pagos_repository_1.pagosRepository.findByReservacionId(id);
            const pagosValidos = pagos.filter((p) => p.estado !== "cancelado");
            const totalPagado = pagosValidos.reduce((s, p) => s + p.monto, 0);
            const reembolsoEstado = totalPagado > 0 ? "pendiente" : "no_aplica";
            return reservaciones_repository_1.reservacionesRepository.updateCancelacion(id, reembolsoEstado, totalPagado);
        }
        return reservaciones_repository_1.reservacionesRepository.updateEstado(id, data.estado);
    },
};
