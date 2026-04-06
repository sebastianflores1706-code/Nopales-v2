export type EstadoCalendario = "pendiente_revision" | "aprobada" | "en_curso" | "cancelada" | "en_uso" | "finalizada" | "mantenimiento";

export interface EventoCalendario {
  id: string;
  folio: string;
  espacio: string;
  espacioId: string;
  nombreEvento: string;
  organizador: string;
  tipoEvento: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  asistentes: number;
  estado: EstadoCalendario;
  pago: "pendiente" | "anticipo" | "completado" | "cancelado";
  montoPago: number;
  totalPagado: number;
  saldoPendiente: number;
  descripcion: string;
  documentos: { nombre: string; tipo: string }[];
}

export const estadoCalendarioConfig: Record<EstadoCalendario, { label: string; color: string; bgClass: string; textClass: string; dotClass: string }> = {
  pendiente_revision: {
    label: "Pendiente revisión",
    color: "warning",
    bgClass: "bg-warning/15 border-warning/30",
    textClass: "text-warning",
    dotClass: "bg-warning",
  },
  aprobada: {
    label: "Aprobada",
    color: "info",
    bgClass: "bg-info/15 border-info/30",
    textClass: "text-info",
    dotClass: "bg-info",
  },
  en_curso: {
    label: "En curso",
    color: "success",
    bgClass: "bg-success/15 border-success/30",
    textClass: "text-success",
    dotClass: "bg-success",
  },
  cancelada: {
    label: "Cancelada",
    color: "destructive",
    bgClass: "bg-muted border-border",
    textClass: "text-muted-foreground line-through",
    dotClass: "bg-muted-foreground",
  },
  en_uso: {
    label: "En uso",
    color: "success",
    bgClass: "bg-success/15 border-success/30",
    textClass: "text-success",
    dotClass: "bg-success",
  },
  finalizada: {
    label: "Finalizada",
    color: "muted",
    bgClass: "bg-muted/50 border-border",
    textClass: "text-muted-foreground",
    dotClass: "bg-muted-foreground",
  },
  mantenimiento: {
    label: "Mantenimiento",
    color: "destructive",
    bgClass: "bg-destructive/10 border-destructive/20",
    textClass: "text-destructive",
    dotClass: "bg-destructive",
  },
};

export const espaciosCalendario = [
  { id: "ESP-001", nombre: "Plaza Central", tipo: "Plaza" },
  { id: "ESP-002", nombre: "Auditorio Municipal", tipo: "Auditorio" },
  { id: "ESP-003", nombre: "Parque Bicentenario", tipo: "Parque" },
  { id: "ESP-004", nombre: "Salón de Usos Múltiples", tipo: "Salón" },
  { id: "ESP-005", nombre: "Cancha Deportiva Norte", tipo: "Cancha" },
  { id: "ESP-006", nombre: "Centro Cultural Reforma", tipo: "Centro Cultural" },
];

export const eventosCalendario: EventoCalendario[] = [
  {
    id: "CAL-001", folio: "RES-2026-001", espacio: "Plaza Central", espacioId: "ESP-001",
    nombreEvento: "Festival de Primavera 2026", organizador: "María López García",
    tipoEvento: "Festival cultural", fecha: "2026-03-12", horaInicio: "10:00", horaFin: "20:00",
    asistentes: 350, estado: "en_uso", pago: "completado", montoPago: 25000, totalPagado: 25000, saldoPendiente: 0,
    descripcion: "Festival cultural anual con música, danza y gastronomía regional.",
    documentos: [{ nombre: "Contrato de uso.pdf", tipo: "Contrato" }, { nombre: "Comprobante de pago.pdf", tipo: "Pago" }],
  },
  {
    id: "CAL-002", folio: "RES-2026-002", espacio: "Auditorio Municipal", espacioId: "ESP-002",
    nombreEvento: "Foro de Desarrollo Urbano", organizador: "Carlos Ramírez Torres",
    tipoEvento: "Conferencia municipal", fecha: "2026-03-15", horaInicio: "09:00", horaFin: "18:00",
    asistentes: 280, estado: "pendiente_revision", pago: "pendiente", montoPago: 31500, totalPagado: 0, saldoPendiente: 31500,
    descripcion: "Foro municipal sobre planificación urbana y desarrollo sostenible.",
    documentos: [{ nombre: "Solicitud firmada.pdf", tipo: "Solicitud" }],
  },
  {
    id: "CAL-003", folio: "RES-2026-003", espacio: "Parque Bicentenario", espacioId: "ESP-003",
    nombreEvento: "Jornada Comunitaria de Salud", organizador: "Asociación Vecinal Sur",
    tipoEvento: "Evento comunitario", fecha: "2026-03-20", horaInicio: "08:00", horaFin: "15:00",
    asistentes: 200, estado: "aprobada", pago: "pendiente", montoPago: 12600, totalPagado: 0, saldoPendiente: 12600,
    descripcion: "Jornada de salud comunitaria con brigadas médicas y talleres de nutrición.",
    documentos: [{ nombre: "Solicitud firmada.pdf", tipo: "Solicitud" }],
  },
  {
    id: "CAL-004", folio: "RES-2026-004", espacio: "Cancha Deportiva Norte", espacioId: "ESP-005",
    nombreEvento: "Torneo Intermunicipal de Fútbol", organizador: "Liga Municipal de Fútbol",
    tipoEvento: "Torneo deportivo", fecha: "2026-03-22", horaInicio: "08:00", horaFin: "20:00",
    asistentes: 180, estado: "aprobada", pago: "pendiente", montoPago: 9600, totalPagado: 0, saldoPendiente: 9600,
    descripcion: "Torneo de fútbol rápido con 16 equipos de municipios vecinos.",
    documentos: [{ nombre: "Contrato de uso.pdf", tipo: "Contrato" }],
  },
  {
    id: "CAL-005", folio: "RES-2026-006", espacio: "Plaza Central", espacioId: "ESP-001",
    nombreEvento: "Concierto de Aniversario Municipal", organizador: "Gobierno Municipal",
    tipoEvento: "Concierto", fecha: "2026-03-28", horaInicio: "18:00", horaFin: "23:00",
    asistentes: 500, estado: "aprobada", pago: "completado", montoPago: 12500, totalPagado: 12500, saldoPendiente: 0,
    descripcion: "Concierto conmemorativo del aniversario del municipio.",
    documentos: [{ nombre: "Contrato de uso.pdf", tipo: "Contrato" }, { nombre: "Orden de pago.pdf", tipo: "Pago" }],
  },
  {
    id: "CAL-006", folio: "RES-2026-007", espacio: "Salón de Usos Múltiples", espacioId: "ESP-004",
    nombreEvento: "Asamblea Vecinal Ordinaria", organizador: "Comité Vecinal Norte",
    tipoEvento: "Reunión vecinal", fecha: "2026-03-25", horaInicio: "18:00", horaFin: "20:00",
    asistentes: 80, estado: "aprobada", pago: "completado", montoPago: 2400, totalPagado: 2400, saldoPendiente: 0,
    descripcion: "Asamblea ordinaria del comité vecinal.",
    documentos: [{ nombre: "Comprobante de pago.pdf", tipo: "Pago" }],
  },
  {
    id: "CAL-007", folio: "RES-2026-009", espacio: "Plaza Central", espacioId: "ESP-001",
    nombreEvento: "Feria de Artesanías de Semana Santa", organizador: "Asociación de Comerciantes",
    tipoEvento: "Feria artesanal", fecha: "2026-03-29", horaInicio: "09:00", horaFin: "21:00",
    asistentes: 400, estado: "pendiente_revision", pago: "pendiente", montoPago: 30000, totalPagado: 0, saldoPendiente: 30000,
    descripcion: "Feria artesanal con más de 50 expositores.",
    documentos: [{ nombre: "Solicitud firmada.pdf", tipo: "Solicitud" }],
  },
  {
    id: "CAL-008", folio: "RES-2026-010", espacio: "Cancha Deportiva Norte", espacioId: "ESP-005",
    nombreEvento: "Final Liga Juvenil 2026", organizador: "Club Deportivo Azteca",
    tipoEvento: "Partido de fútbol", fecha: "2026-04-12", horaInicio: "16:00", horaFin: "20:00",
    asistentes: 150, estado: "pendiente_revision", pago: "pendiente", montoPago: 3200, totalPagado: 0, saldoPendiente: 3200,
    descripcion: "Partido final de la liga juvenil municipal.",
    documentos: [{ nombre: "Solicitud firmada.pdf", tipo: "Solicitud" }],
  },
  {
    id: "CAL-009", folio: "RES-2026-005", espacio: "Auditorio Municipal", espacioId: "ESP-002",
    nombreEvento: "Graduación Generación 2023-2026", organizador: "Escuela Preparatoria #3",
    tipoEvento: "Graduación", fecha: "2026-04-05", horaInicio: "17:00", horaFin: "22:00",
    asistentes: 320, estado: "aprobada", pago: "pendiente", montoPago: 17500, totalPagado: 0, saldoPendiente: 17500,
    descripcion: "Ceremonia de graduación con protocolo formal.",
    documentos: [{ nombre: "Solicitud firmada.pdf", tipo: "Solicitud" }],
  },
  {
    id: "CAL-010", folio: "RES-2026-011", espacio: "Salón de Usos Múltiples", espacioId: "ESP-004",
    nombreEvento: "Ensayo General - Orquesta Municipal", organizador: "Dir. de Cultura",
    tipoEvento: "Ensayo general", fecha: "2026-03-18", horaInicio: "10:00", horaFin: "14:00",
    asistentes: 45, estado: "aprobada", pago: "completado", montoPago: 1200, totalPagado: 1200, saldoPendiente: 0,
    descripcion: "Ensayo general de la orquesta municipal para el concierto de aniversario.",
    documentos: [],
  },
  {
    id: "CAL-011", folio: "RES-2026-012", espacio: "Auditorio Municipal", espacioId: "ESP-002",
    nombreEvento: "Conferencia de Seguridad Pública", organizador: "Dir. de Seguridad",
    tipoEvento: "Conferencia municipal", fecha: "2026-03-27", horaInicio: "09:00", horaFin: "13:00",
    asistentes: 200, estado: "aprobada", pago: "completado", montoPago: 8000, totalPagado: 8000, saldoPendiente: 0,
    descripcion: "Conferencia sobre estrategias de seguridad pública municipal.",
    documentos: [{ nombre: "Oficio de solicitud.pdf", tipo: "Solicitud" }],
  },
  // Maintenance blocks
  {
    id: "CAL-MNT-001", folio: "MNT-2026-001", espacio: "Centro Cultural Reforma", espacioId: "ESP-006",
    nombreEvento: "Mantenimiento - Reparación de techumbre", organizador: "Dir. de Obras Públicas",
    tipoEvento: "Mantenimiento", fecha: "2026-03-14", horaInicio: "07:00", horaFin: "18:00",
    asistentes: 0, estado: "mantenimiento", pago: "completado", montoPago: 0, totalPagado: 0, saldoPendiente: 0,
    descripcion: "Reparación programada de la techumbre del centro cultural.",
    documentos: [{ nombre: "Orden de trabajo.pdf", tipo: "Orden" }],
  },
  {
    id: "CAL-MNT-002", folio: "MNT-2026-002", espacio: "Centro Cultural Reforma", espacioId: "ESP-006",
    nombreEvento: "Mantenimiento - Pintura interior", organizador: "Dir. de Obras Públicas",
    tipoEvento: "Mantenimiento", fecha: "2026-03-15", horaInicio: "07:00", horaFin: "18:00",
    asistentes: 0, estado: "mantenimiento", pago: "completado", montoPago: 0, totalPagado: 0, saldoPendiente: 0,
    descripcion: "Pintura interior programada.",
    documentos: [],
  },
  {
    id: "CAL-MNT-003", folio: "MNT-2026-003", espacio: "Cancha Deportiva Norte", espacioId: "ESP-005",
    nombreEvento: "Mantenimiento - Resellado de cancha", organizador: "Dir. de Deportes",
    tipoEvento: "Mantenimiento", fecha: "2026-03-17", horaInicio: "07:00", horaFin: "17:00",
    asistentes: 0, estado: "mantenimiento", pago: "completado", montoPago: 0, totalPagado: 0, saldoPendiente: 0,
    descripcion: "Resellado y pintura de líneas de la cancha deportiva.",
    documentos: [{ nombre: "Orden de trabajo.pdf", tipo: "Orden" }],
  },
  {
    id: "CAL-MNT-004", folio: "MNT-2026-004", espacio: "Parque Bicentenario", espacioId: "ESP-003",
    nombreEvento: "Mantenimiento - Poda y jardinería", organizador: "Dir. de Parques",
    tipoEvento: "Mantenimiento", fecha: "2026-04-01", horaInicio: "06:00", horaFin: "14:00",
    asistentes: 0, estado: "mantenimiento", pago: "completado", montoPago: 0, totalPagado: 0, saldoPendiente: 0,
    descripcion: "Poda general de árboles y mantenimiento de áreas verdes.",
    documentos: [],
  },
];

export const estadosFiltroCalendario = [
  { label: "Todos", value: "todos" },
  { label: "Pendiente revisión", value: "pendiente_revision" },
  { label: "Aprobada", value: "aprobada" },
  { label: "En curso", value: "en_curso" },
  { label: "Cancelada", value: "cancelada" },
  { label: "Finalizada", value: "finalizada" },
  { label: "Mantenimiento", value: "mantenimiento" },
];

export const espaciosFiltroCalendario = [
  { label: "Todos los espacios", value: "todos" },
  ...espaciosCalendario.map((e) => ({ label: e.nombre, value: e.id })),
];
