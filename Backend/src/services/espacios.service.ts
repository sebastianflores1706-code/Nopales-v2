import { espaciosRepository } from "../repositories/espacios.repository";
import type { CreateEspacioDto, UpdateEspacioDto } from "../validators/espacios.schema";

export const espaciosService = {
  getAll() {
    return espaciosRepository.findAll();
  },

  getById(id: string) {
    const espacio = espaciosRepository.findById(id);
    if (!espacio) throw new Error("Espacio no encontrado");
    return espacio;
  },

  create(data: CreateEspacioDto) {
    return espaciosRepository.create(data);
  },

  update(id: string, data: UpdateEspacioDto) {
    const espacio = espaciosRepository.update(id, data);
    if (!espacio) throw new Error("Espacio no encontrado");
    return espacio;
  },

  delete(id: string) {
    const deleted = espaciosRepository.delete(id);
    if (!deleted) throw new Error("Espacio no encontrado");
  },
};
