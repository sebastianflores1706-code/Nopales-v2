export const dashboardMetrics = {
  solicitudesPendientes: 12,
  pagosPendientes: 8,
  incidenciasAbiertas: 5,
  espaciosActivos: 34,
  reservacionesHoy: 7,
  ingresosMes: 156800,
};

export const espaciosMasUtilizados = [
  { nombre: "Plaza Central", reservaciones: 45, ocupacion: 92 },
  { nombre: "Auditorio Municipal", reservaciones: 38, ocupacion: 85 },
  { nombre: "Parque Bicentenario", reservaciones: 32, ocupacion: 78 },
  { nombre: "Salón de Usos Múltiples", reservaciones: 28, ocupacion: 71 },
  { nombre: "Cancha Deportiva Norte", reservaciones: 22, ocupacion: 64 },
];

export const actividadReciente = [
  { id: 1, tipo: "reservacion", descripcion: "Nueva reservación en Plaza Central", usuario: "María López", fecha: "Hace 15 min", estado: "pendiente" as const },
  { id: 2, tipo: "pago", descripcion: "Pago recibido - Auditorio Municipal", usuario: "Carlos Ramírez", fecha: "Hace 30 min", estado: "completado" as const },
  { id: 3, tipo: "incidencia", descripcion: "Reporte de daño en Parque Bicentenario", usuario: "Juan Hernández", fecha: "Hace 1 hora", estado: "abierta" as const },
  { id: 4, tipo: "reservacion", descripcion: "Reservación aprobada - Salón de Usos Múltiples", usuario: "Ana García", fecha: "Hace 2 horas", estado: "aprobado" as const },
  { id: 5, tipo: "mantenimiento", descripcion: "Mantenimiento programado - Cancha Norte", usuario: "Sistema", fecha: "Hace 3 horas", estado: "en_proceso" as const },
  { id: 6, tipo: "pago", descripcion: "Pago pendiente - Plaza Central", usuario: "Roberto Díaz", fecha: "Hace 4 horas", estado: "pendiente" as const },
];

export const solicitudesPendientes = [
  { id: "SOL-001", solicitante: "María López", espacio: "Plaza Central", fecha: "2026-03-12", tipo: "Evento cultural", estado: "pendiente" as const },
  { id: "SOL-002", solicitante: "Carlos Ramírez", espacio: "Auditorio Municipal", fecha: "2026-03-15", tipo: "Conferencia", estado: "pendiente" as const },
  { id: "SOL-003", solicitante: "Ana García", espacio: "Parque Bicentenario", fecha: "2026-03-18", tipo: "Festival", estado: "en_revision" as const },
  { id: "SOL-004", solicitante: "Pedro Martínez", espacio: "Salón de Usos Múltiples", fecha: "2026-03-20", tipo: "Reunión vecinal", estado: "pendiente" as const },
];

export type EstadoType = "pendiente" | "completado" | "abierta" | "aprobado" | "en_proceso" | "en_revision" | "rechazado" | "cerrada" | "cancelado" | "activo" | "inactivo" | "realizada" | "pagado" | "reembolsado" | "pendiente_revision" | "aprobada" | "rechazada" | "cancelada" | "en_uso" | "finalizada";
