import { randomUUID } from "crypto";
import type { CreateReservacionDto } from "../validators/reservaciones.schema";

export interface Reservacion {
  id: string;
  folio: string;
  espacioId: string;
  espacioNombre: string;
  solicitanteNombre: string;
  tipoEvento: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  asistentes: number;
  estado: string;
  pagoEstado: string;
}

const reservaciones: Reservacion[] = [
  {
    id: randomUUID(),
    folio: "RES-2026-001",
    espacioId: "ESP-001",
    espacioNombre: "Plaza Central",
    solicitanteNombre: "María González",
    tipoEvento: "Festival cultural",
    fecha: "2026-03-20",
    horaInicio: "10:00",
    horaFin: "14:00",
    asistentes: 300,
    estado: "aprobada",
    pagoEstado: "pagado",
  },
  {
    id: randomUUID(),
    folio: "RES-2026-002",
    espacioId: "ESP-002",
    espacioNombre: "Auditorio Municipal",
    solicitanteNombre: "Carlos Mendoza",
    tipoEvento: "Conferencia",
    fecha: "2026-03-25",
    horaInicio: "09:00",
    horaFin: "13:00",
    asistentes: 200,
    estado: "pendiente_revision",
    pagoEstado: "pendiente",
  },
];

let folioCounter = reservaciones.length + 1;

function generarFolio(): string {
  const anio = new Date().getFullYear();
  const numero = String(folioCounter++).padStart(3, "0");
  return `RES-${anio}-${numero}`;
}

export const reservacionesRepository = {
  findAll(): Reservacion[] {
    return reservaciones;
  },

  findById(id: string): Reservacion | undefined {
    return reservaciones.find((r) => r.id === id);
  },

  findByEspacioFecha(espacioId: string, fecha: string): Reservacion[] {
    return reservaciones.filter((r) => r.espacioId === espacioId && r.fecha === fecha);
  },

  create(data: CreateReservacionDto, espacioNombre: string): Reservacion {
    const nueva: Reservacion = {
      id: randomUUID(),
      folio: generarFolio(),
      espacioId: data.espacioId,
      espacioNombre,
      solicitanteNombre: data.solicitanteNombre,
      tipoEvento: data.tipoEvento,
      fecha: data.fecha,
      horaInicio: data.horaInicio,
      horaFin: data.horaFin,
      asistentes: data.asistentes,
      estado: "pendiente_revision",
      pagoEstado: data.pagoEstado,
    };
    reservaciones.push(nueva);
    return nueva;
  },

  updateEstado(id: string, estado: string): Reservacion | undefined {
    const index = reservaciones.findIndex((r) => r.id === id);
    if (index === -1) return undefined;
    reservaciones[index] = { ...reservaciones[index], estado };
    return reservaciones[index];
  },
};
