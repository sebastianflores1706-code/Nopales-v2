import { randomUUID } from "crypto";
import type { CreateEspacioDto, UpdateEspacioDto } from "../validators/espacios.schema";

export interface Espacio {
  id: string;
  nombre: string;
  tipo: string;
  ubicacion: string;
  capacidad: number;
  costoHora: number;
  estado: string;
  descripcion?: string;
  reglas?: string;
  horarioDisponible?: string;
}

const espacios: Espacio[] = [
  {
    id: "ESP-001",
    nombre: "Plaza Central",
    tipo: "plaza",
    ubicacion: "Centro Histórico, Calle Principal #1",
    capacidad: 500,
    costoHora: 2500,
    estado: "activo",
  },
  {
    id: "ESP-002",
    nombre: "Auditorio Municipal",
    tipo: "auditorio",
    ubicacion: "Av. Independencia #450, Col. Centro",
    capacidad: 350,
    costoHora: 3500,
    estado: "activo",
  },
  {
    id: "ESP-003",
    nombre: "Parque Bicentenario",
    tipo: "parque",
    ubicacion: "Blvd. de la Paz #200, Fracc. Las Flores",
    capacidad: 300,
    costoHora: 1800,
    estado: "en_proceso",
  },
  {
    id: "ESP-004",
    nombre: "Salón de Usos Múltiples",
    tipo: "salon",
    ubicacion: "Calle Morelos #78, Col. Centro",
    capacidad: 150,
    costoHora: 1200,
    estado: "activo",
  },
  {
    id: "ESP-005",
    nombre: "Cancha Deportiva Norte",
    tipo: "cancha",
    ubicacion: "Av. del Deporte #15, Col. Norte",
    capacidad: 200,
    costoHora: 800,
    estado: "activo",
  },
  {
    id: "ESP-006",
    nombre: "Centro Cultural Reforma",
    tipo: "centro_cultural",
    ubicacion: "Calle Reforma #320, Col. Juárez",
    capacidad: 120,
    costoHora: 2000,
    estado: "inactivo",
  },
];

export const espaciosRepository = {
  findAll(): Espacio[] {
    return espacios;
  },

  findById(id: string): Espacio | undefined {
    return espacios.find((e) => e.id === id);
  },

  create(data: CreateEspacioDto): Espacio {
    const nuevo: Espacio = { id: randomUUID(), ...data };
    espacios.push(nuevo);
    return nuevo;
  },

  update(id: string, data: UpdateEspacioDto): Espacio | undefined {
    const index = espacios.findIndex((e) => e.id === id);
    if (index === -1) return undefined;
    espacios[index] = { ...espacios[index], ...data };
    return espacios[index];
  },

  delete(id: string): boolean {
    const index = espacios.findIndex((e) => e.id === id);
    if (index === -1) return false;
    espacios.splice(index, 1);
    return true;
  },
};
