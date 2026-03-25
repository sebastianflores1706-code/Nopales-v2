import { espaciosRepository } from "../repositories/espacios.repository";
import type { CreateEspacioDto, UpdateEspacioDto } from "../validators/espacios.schema";

export const espaciosService = {
  async getAll() {
    return espaciosRepository.findAll();
  },

  async getById(id: string) {
    const espacio = await espaciosRepository.findById(id);
    if (!espacio) throw new Error("Espacio no encontrado");
    return espacio;
  },

  async create(data: CreateEspacioDto) {
    return espaciosRepository.create(data);
  },

  async update(id: string, data: UpdateEspacioDto) {
    const espacio = await espaciosRepository.update(id, data);
    if (!espacio) throw new Error("Espacio no encontrado");
    return espacio;
  },

  async delete(id: string) {
    const deleted = await espaciosRepository.delete(id);
    if (!deleted) throw new Error("Espacio no encontrado");
  },
};
