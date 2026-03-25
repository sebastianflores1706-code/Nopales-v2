import { reservacionesRepository, type Reservacion } from "../repositories/reservaciones.repository";
import { espaciosRepository } from "../repositories/espacios.repository";
import { pagosRepository } from "../repositories/pagos.repository";
import type { CreateReservacionDto, CambiarEstadoDto } from "../validators/reservaciones.schema";

async function enrichReservacion(reservacion: Reservacion) {
  const pagos = await pagosRepository.findByReservacionId(reservacion.id);
  const pagoEstado = pagos.length > 0 ? pagos[pagos.length - 1].estado : "pendiente";
  const totalPagado = pagos.reduce((sum, p) => sum + p.monto, 0);
  const saldoPendiente = Math.max(0, reservacion.montoTotal - totalPagado);
  return { ...reservacion, pagoEstado, totalPagado, saldoPendiente };
}

const ESTADOS_CON_OCUPACION = new Set(["pendiente_revision", "aprobada", "en_uso"]);

const TRANSICIONES_VALIDAS: Record<string, string[]> = {
  pendiente_revision: ["aprobada", "rechazada", "cancelada"],
  aprobada: ["en_uso", "cancelada"],
  en_uso: ["finalizada"],
  rechazada: [],
  cancelada: [],
  finalizada: [],
};

function hayTraslape(
  inicioNueva: string,
  finNueva: string,
  inicioExistente: string,
  finExistente: string
): boolean {
  return inicioNueva < finExistente && inicioExistente < finNueva;
}

export const reservacionesService = {
  async getAll() {
    const reservaciones = await reservacionesRepository.findAll();
    return Promise.all(reservaciones.map(enrichReservacion));
  },

  async getById(id: string) {
    const reservacion = await reservacionesRepository.findById(id);
    if (!reservacion) throw new Error("Reservación no encontrada");
    return enrichReservacion(reservacion);
  },

  async create(data: CreateReservacionDto) {
    // Regla 2: el espacio debe existir
    const espacio = await espaciosRepository.findById(data.espacioId);
    if (!espacio) throw new Error("El espacio especificado no existe");

    // Regla 3: el espacio no puede estar inactivo
    if (espacio.estado === "inactivo") {
      throw new Error("No se puede reservar un espacio inactivo");
    }

    // Regla 4: asistentes no puede superar la capacidad
    if (data.asistentes > espacio.capacidad) {
      throw new Error(
        `El número de asistentes (${data.asistentes}) supera la capacidad del espacio (${espacio.capacidad})`
      );
    }

    // Regla 5: validar traslape de horario
    const reservacionesMismoDia = await reservacionesRepository.findByEspacioFecha(
      data.espacioId,
      data.fecha
    );

    const traslape = reservacionesMismoDia.find(
      (r) =>
        ESTADOS_CON_OCUPACION.has(r.estado) &&
        hayTraslape(data.horaInicio, data.horaFin, r.horaInicio, r.horaFin)
    );

    if (traslape) {
      throw new Error(
        `El espacio ya tiene una reservación (${traslape.folio}) en ese horario: ${traslape.horaInicio} – ${traslape.horaFin}`
      );
    }

    return reservacionesRepository.create(data, espacio.nombre);
  },

  async cambiarEstado(id: string, data: CambiarEstadoDto) {
    const reservacion = await reservacionesRepository.findById(id);
    if (!reservacion) throw new Error("Reservación no encontrada");

    const transicionesPermitidas = TRANSICIONES_VALIDAS[reservacion.estado] ?? [];
    if (!transicionesPermitidas.includes(data.estado)) {
      throw new Error(
        `Transición inválida: no se puede pasar de "${reservacion.estado}" a "${data.estado}"`
      );
    }

    // Regla extra: cancelar una reservación aprobada solo es válido
    // si el evento aún no ha iniciado.
    if (reservacion.estado === "aprobada" && data.estado === "cancelada") {
      const inicioEvento = new Date(`${reservacion.fecha}T${reservacion.horaInicio}:00`);
      if (new Date() >= inicioEvento) {
        throw new Error(
          "No se puede cancelar una reservación aprobada cuyo evento ya inició o ya pasó"
        );
      }
    }

    return reservacionesRepository.updateEstado(id, data.estado);
  },
};
