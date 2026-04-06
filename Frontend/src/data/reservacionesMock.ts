import type { EstadoType } from "./mockData";

export interface Reservacion {
  id: string;
  espacio: string;
  espacioId: string;
  solicitante: string;
  tipoEvento: string;
  nombreEvento: string;
  fecha: string;
  horario: string;
  asistentes: number;
  estado: EstadoType;
  pago: EstadoType;
  montoPago: number;
  descripcion: string;
  documentos: { nombre: string; tipo: string; fecha: string }[];
  historialCambios: { accion: string; usuario: string; fecha: string }[];
}

export const estadosReservacion = [
  { label: "Todos", value: "todos" },
  { label: "Pendiente revisión", value: "pendiente_revision" },
  { label: "Aprobada", value: "aprobada" },
  { label: "En curso", value: "en_curso" },
  { label: "Rechazada", value: "rechazada" },
  { label: "Cancelada", value: "cancelada" },
  { label: "Finalizada", value: "finalizada" },
];

export const espaciosFiltro = [
  { label: "Todos", value: "todos" },
  { label: "Plaza Central", value: "ESP-001" },
  { label: "Auditorio Municipal", value: "ESP-002" },
  { label: "Parque Bicentenario", value: "ESP-003" },
  { label: "Salón de Usos Múltiples", value: "ESP-004" },
  { label: "Cancha Deportiva Norte", value: "ESP-005" },
  { label: "Centro Cultural Reforma", value: "ESP-006" },
];

export const tiposEvento = [
  "Festival cultural",
  "Conferencia",
  "Partido de fútbol",
  "Evento comunitario",
  "Concierto",
  "Conferencia municipal",
  "Reunión vecinal",
  "Graduación",
  "Feria artesanal",
  "Torneo deportivo",
];

export const reservacionesMock: Reservacion[] = [
  {
    id: "RES-2026-001",
    espacio: "Plaza Central",
    espacioId: "ESP-001",
    solicitante: "María López García",
    tipoEvento: "Festival cultural",
    nombreEvento: "Festival de Primavera 2026",
    fecha: "2026-03-12",
    horario: "10:00 - 20:00",
    asistentes: 350,
    estado: "aprobado",
    pago: "completado",
    montoPago: 25000,
    descripcion: "Festival cultural anual con presentaciones de música, danza y gastronomía regional. Incluye puestos de artesanías y actividades para niños.",
    documentos: [
      { nombre: "Solicitud firmada.pdf", tipo: "Solicitud", fecha: "2026-02-20" },
      { nombre: "Contrato de uso.pdf", tipo: "Contrato", fecha: "2026-02-25" },
      { nombre: "Comprobante de pago.pdf", tipo: "Pago", fecha: "2026-02-28" },
      { nombre: "Póliza de seguro.pdf", tipo: "Seguro", fecha: "2026-03-01" },
    ],
    historialCambios: [
      { accion: "Solicitud creada", usuario: "María López García", fecha: "2026-02-20 09:30" },
      { accion: "Documentación recibida", usuario: "Admin", fecha: "2026-02-22 14:15" },
      { accion: "Solicitud aprobada", usuario: "Dir. Espacios Públicos", fecha: "2026-02-25 10:00" },
      { accion: "Contrato generado", usuario: "Admin", fecha: "2026-02-25 11:30" },
      { accion: "Pago registrado", usuario: "Admin", fecha: "2026-02-28 16:45" },
    ],
  },
  {
    id: "RES-2026-002",
    espacio: "Auditorio Municipal",
    espacioId: "ESP-002",
    solicitante: "Carlos Ramírez Torres",
    tipoEvento: "Conferencia municipal",
    nombreEvento: "Foro de Desarrollo Urbano",
    fecha: "2026-03-15",
    horario: "09:00 - 18:00",
    asistentes: 280,
    estado: "pendiente",
    pago: "pendiente",
    montoPago: 31500,
    descripcion: "Foro municipal sobre planificación urbana y desarrollo sostenible con panelistas nacionales e internacionales.",
    documentos: [
      { nombre: "Solicitud firmada.pdf", tipo: "Solicitud", fecha: "2026-03-01" },
      { nombre: "Programa del evento.pdf", tipo: "Programa", fecha: "2026-03-02" },
    ],
    historialCambios: [
      { accion: "Solicitud creada", usuario: "Carlos Ramírez Torres", fecha: "2026-03-01 11:00" },
      { accion: "En revisión por comité", usuario: "Admin", fecha: "2026-03-03 09:00" },
    ],
  },
  {
    id: "RES-2026-003",
    espacio: "Parque Bicentenario",
    espacioId: "ESP-003",
    solicitante: "Asociación Vecinal Sur",
    tipoEvento: "Evento comunitario",
    nombreEvento: "Jornada Comunitaria de Salud",
    fecha: "2026-03-20",
    horario: "08:00 - 15:00",
    asistentes: 200,
    estado: "pendiente",
    pago: "pendiente",
    montoPago: 12600,
    descripcion: "Jornada de salud comunitaria con brigadas médicas, vacunación y talleres de nutrición para familias del sector sur.",
    documentos: [
      { nombre: "Solicitud firmada.pdf", tipo: "Solicitud", fecha: "2026-03-05" },
    ],
    historialCambios: [
      { accion: "Solicitud creada", usuario: "Asociación Vecinal Sur", fecha: "2026-03-05 10:30" },
    ],
  },
  {
    id: "RES-2026-004",
    espacio: "Cancha Deportiva Norte",
    espacioId: "ESP-005",
    solicitante: "Liga Municipal de Fútbol",
    tipoEvento: "Torneo deportivo",
    nombreEvento: "Torneo Intermunicipal de Fútbol Rápido",
    fecha: "2026-03-22",
    horario: "08:00 - 20:00",
    asistentes: 180,
    estado: "aprobado",
    pago: "pendiente",
    montoPago: 9600,
    descripcion: "Torneo de fútbol rápido con 16 equipos de municipios vecinos. Incluye premiación y convivencia deportiva.",
    documentos: [
      { nombre: "Solicitud firmada.pdf", tipo: "Solicitud", fecha: "2026-03-02" },
      { nombre: "Contrato de uso.pdf", tipo: "Contrato", fecha: "2026-03-08" },
    ],
    historialCambios: [
      { accion: "Solicitud creada", usuario: "Liga Municipal de Fútbol", fecha: "2026-03-02 15:00" },
      { accion: "Solicitud aprobada", usuario: "Dir. Deportes", fecha: "2026-03-08 09:30" },
      { accion: "Contrato generado", usuario: "Admin", fecha: "2026-03-08 10:00" },
    ],
  },
  {
    id: "RES-2026-005",
    espacio: "Auditorio Municipal",
    espacioId: "ESP-002",
    solicitante: "Escuela Preparatoria #3",
    tipoEvento: "Graduación",
    nombreEvento: "Ceremonia de Graduación Generación 2023-2026",
    fecha: "2026-04-05",
    horario: "17:00 - 22:00",
    asistentes: 320,
    estado: "pendiente",
    pago: "pendiente",
    montoPago: 17500,
    descripcion: "Ceremonia de graduación de la generación 2023-2026 con protocolo formal, entrega de reconocimientos y evento social.",
    documentos: [
      { nombre: "Solicitud firmada.pdf", tipo: "Solicitud", fecha: "2026-03-10" },
    ],
    historialCambios: [
      { accion: "Solicitud creada", usuario: "Escuela Preparatoria #3", fecha: "2026-03-10 08:45" },
    ],
  },
  {
    id: "RES-2026-006",
    espacio: "Plaza Central",
    espacioId: "ESP-001",
    solicitante: "Gobierno Municipal",
    tipoEvento: "Concierto",
    nombreEvento: "Concierto de Aniversario Municipal",
    fecha: "2026-04-10",
    horario: "18:00 - 23:00",
    asistentes: 500,
    estado: "aprobado",
    pago: "completado",
    montoPago: 12500,
    descripcion: "Concierto conmemorativo del aniversario del municipio con artistas locales y regionales. Evento gratuito para la ciudadanía.",
    documentos: [
      { nombre: "Oficio de solicitud.pdf", tipo: "Solicitud", fecha: "2026-02-15" },
      { nombre: "Contrato de uso.pdf", tipo: "Contrato", fecha: "2026-02-20" },
      { nombre: "Orden de pago.pdf", tipo: "Pago", fecha: "2026-02-22" },
    ],
    historialCambios: [
      { accion: "Solicitud creada", usuario: "Gobierno Municipal", fecha: "2026-02-15 10:00" },
      { accion: "Solicitud aprobada", usuario: "Presidencia", fecha: "2026-02-18 12:00" },
      { accion: "Pago registrado", usuario: "Tesorería", fecha: "2026-02-22 09:00" },
    ],
  },
  {
    id: "RES-2026-007",
    espacio: "Salón de Usos Múltiples",
    espacioId: "ESP-004",
    solicitante: "Comité Vecinal Norte",
    tipoEvento: "Reunión vecinal",
    nombreEvento: "Asamblea Vecinal Ordinaria",
    fecha: "2026-03-25",
    horario: "18:00 - 20:00",
    asistentes: 80,
    estado: "aprobado",
    pago: "completado",
    montoPago: 2400,
    descripcion: "Asamblea ordinaria del comité vecinal para tratar temas de seguridad, alumbrado público y obras en la colonia.",
    documentos: [
      { nombre: "Solicitud firmada.pdf", tipo: "Solicitud", fecha: "2026-03-08" },
      { nombre: "Comprobante de pago.pdf", tipo: "Pago", fecha: "2026-03-10" },
    ],
    historialCambios: [
      { accion: "Solicitud creada", usuario: "Comité Vecinal Norte", fecha: "2026-03-08 16:00" },
      { accion: "Solicitud aprobada", usuario: "Admin", fecha: "2026-03-09 10:00" },
      { accion: "Pago registrado", usuario: "Admin", fecha: "2026-03-10 11:30" },
    ],
  },
  {
    id: "RES-2026-008",
    espacio: "Centro Cultural Reforma",
    espacioId: "ESP-006",
    solicitante: "Colectivo Artístico Municipal",
    tipoEvento: "Festival cultural",
    nombreEvento: "Exposición de Arte Contemporáneo",
    fecha: "2026-03-18",
    horario: "10:00 - 19:00",
    asistentes: 100,
    estado: "rechazado",
    pago: "cancelado",
    montoPago: 18000,
    descripcion: "Exposición de arte contemporáneo con obras de artistas locales y talleres abiertos al público.",
    documentos: [
      { nombre: "Solicitud firmada.pdf", tipo: "Solicitud", fecha: "2026-02-28" },
    ],
    historialCambios: [
      { accion: "Solicitud creada", usuario: "Colectivo Artístico Municipal", fecha: "2026-02-28 14:00" },
      { accion: "Solicitud rechazada - Espacio inactivo", usuario: "Admin", fecha: "2026-03-02 09:00" },
    ],
  },
  {
    id: "RES-2026-009",
    espacio: "Plaza Central",
    espacioId: "ESP-001",
    solicitante: "Asociación de Comerciantes",
    tipoEvento: "Feria artesanal",
    nombreEvento: "Feria de Artesanías de Semana Santa",
    fecha: "2026-03-28",
    horario: "09:00 - 21:00",
    asistentes: 400,
    estado: "pendiente",
    pago: "pendiente",
    montoPago: 30000,
    descripcion: "Feria artesanal con más de 50 expositores de artesanías tradicionales, gastronomía y productos regionales.",
    documentos: [
      { nombre: "Solicitud firmada.pdf", tipo: "Solicitud", fecha: "2026-03-07" },
      { nombre: "Lista de expositores.pdf", tipo: "Anexo", fecha: "2026-03-07" },
    ],
    historialCambios: [
      { accion: "Solicitud creada", usuario: "Asociación de Comerciantes", fecha: "2026-03-07 11:00" },
      { accion: "Documentación adicional solicitada", usuario: "Admin", fecha: "2026-03-09 14:00" },
    ],
  },
  {
    id: "RES-2026-010",
    espacio: "Cancha Deportiva Norte",
    espacioId: "ESP-005",
    solicitante: "Club Deportivo Azteca",
    tipoEvento: "Partido de fútbol",
    nombreEvento: "Final Liga Juvenil 2026",
    fecha: "2026-04-12",
    horario: "16:00 - 20:00",
    asistentes: 150,
    estado: "pendiente",
    pago: "pendiente",
    montoPago: 3200,
    descripcion: "Partido final de la liga juvenil municipal con premiación a los equipos participantes.",
    documentos: [
      { nombre: "Solicitud firmada.pdf", tipo: "Solicitud", fecha: "2026-03-10" },
    ],
    historialCambios: [
      { accion: "Solicitud creada", usuario: "Club Deportivo Azteca", fecha: "2026-03-10 17:00" },
    ],
  },
];
