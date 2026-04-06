import { mantenimientosRepository } from "../repositories/mantenimientos.repository";

export const mantenimientosService = {
  async getAll() {
    return mantenimientosRepository.findAll();
  },

  async getById(id: string) {
    const m = await mantenimientosRepository.findById(id);
    if (!m) throw new Error("Mantenimiento no encontrado");
    return m;
  },

  async create(data: {
    espacioId: string;
    fechaInicio: string;
    fechaFin: string;
    motivo: string;
  }) {
    if (data.fechaFin <= data.fechaInicio) {
      throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
    }

    const traslapesMnt = await mantenimientosRepository.findTraslapeMantenimiento(
      data.espacioId,
      data.fechaInicio,
      data.fechaFin
    );
    if (traslapesMnt.length > 0) {
      throw new Error(
        "El espacio ya tiene un mantenimiento programado que se traslapa con ese periodo"
      );
    }

    const traslapeRes = await mantenimientosRepository.findReservacionesEnRango(
      data.espacioId,
      data.fechaInicio,
      data.fechaFin
    );
    if (traslapeRes.length > 0) {
      const folios = traslapeRes.map((r) => r.folio).join(", ");
      throw new Error(
        `El espacio tiene reservaciones activas en ese periodo: ${folios}`
      );
    }

    const mantenimiento = await mantenimientosRepository.create(data);
    return mantenimiento;
  },

  async delete(id: string) {
    const m = await mantenimientosRepository.findById(id);
    if (!m) throw new Error("Mantenimiento no encontrado");
    await mantenimientosRepository.delete(id);
  },
};
