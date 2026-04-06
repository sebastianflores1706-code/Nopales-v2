import type { EstadoType } from "./mockData";

export interface Espacio {
  id: string;
  nombre: string;
  tipo: string;
  ubicacion: string;
  capacidad: number;
  costoPorHora: number;
  estado: EstadoType;
  proximaReservacion: string | null;
  descripcion: string;
  reglas: string;
  horarioDisponible: string;
  imagenes: string[];
}

export interface ReservacionEspacio {
  id: string;
  solicitante: string;
  fecha: string;
  horario: string;
  tipo: string;
  estado: EstadoType;
}

export interface IncidenciaEspacio {
  id: string;
  descripcion: string;
  reportadoPor: string;
  fecha: string;
  estado: EstadoType;
}

export const tiposEspacio = [
  { label: "Todos", value: "todos" },
  { label: "Plaza", value: "plaza" },
  { label: "Auditorio", value: "auditorio" },
  { label: "Parque", value: "parque" },
  { label: "Salón", value: "salon" },
  { label: "Cancha", value: "cancha" },
  { label: "Centro cultural", value: "centro_cultural" },
];

export const estadosEspacio = [
  { label: "Todos", value: "todos" },
  { label: "Activo", value: "activo" },
  { label: "Inactivo", value: "inactivo" },
  { label: "En mantenimiento", value: "en_mantenimiento" },
];

export const espaciosMock: Espacio[] = [
  {
    id: "ESP-001",
    nombre: "Plaza Central",
    tipo: "Plaza",
    ubicacion: "Centro Histórico, Calle Principal #1",
    capacidad: 500,
    costoPorHora: 2500,
    estado: "activo",
    proximaReservacion: "2026-03-12",
    descripcion: "Espacio abierto ubicado en el corazón del centro histórico. Ideal para eventos culturales, ferias y ceremonias cívicas. Cuenta con iluminación nocturna, acceso para personas con discapacidad y conexiones eléctricas distribuidas.",
    reglas: "No se permite venta de alcohol sin permiso especial. Horario máximo hasta las 22:00 hrs. El organizador es responsable de la limpieza posterior al evento. Se requiere seguro de responsabilidad civil para eventos con más de 200 asistentes.",
    horarioDisponible: "06:00 - 22:00",
    imagenes: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
  },
  {
    id: "ESP-002",
    nombre: "Auditorio Municipal",
    tipo: "Auditorio",
    ubicacion: "Av. Independencia #450, Col. Centro",
    capacidad: 350,
    costoPorHora: 3500,
    estado: "activo",
    proximaReservacion: "2026-03-15",
    descripcion: "Auditorio cerrado con capacidad para 350 personas sentadas. Equipado con sistema de audio profesional, proyector HD, escenario con iluminación teatral y camerinos. Climatización central y estacionamiento para 80 vehículos.",
    reglas: "Prohibido introducir alimentos al área de butacas. Se requiere técnico de audio certificado para manejo del equipo. Reservación mínima de 4 horas. Depósito de garantía requerido.",
    horarioDisponible: "08:00 - 23:00",
    imagenes: ["/placeholder.svg", "/placeholder.svg"],
  },
  {
    id: "ESP-003",
    nombre: "Parque Bicentenario",
    tipo: "Parque",
    ubicacion: "Blvd. de la Paz #200, Fracc. Las Flores",
    capacidad: 300,
    costoPorHora: 1800,
    estado: "en_proceso",
    proximaReservacion: null,
    descripcion: "Parque urbano con áreas verdes, senderos peatonales, zona de juegos infantiles y kiosco central. Ideal para eventos familiares, festivales al aire libre y actividades deportivas recreativas.",
    reglas: "No se permite el uso de fuego abierto. Respetar áreas verdes y jardines. Eventos con amplificación de sonido requieren permiso especial. Prohibido el acceso de vehículos motorizados al interior.",
    horarioDisponible: "07:00 - 21:00",
    imagenes: ["/placeholder.svg"],
  },
  {
    id: "ESP-004",
    nombre: "Salón de Usos Múltiples",
    tipo: "Salón",
    ubicacion: "Calle Morelos #78, Col. Centro",
    capacidad: 150,
    costoPorHora: 1200,
    estado: "activo",
    proximaReservacion: "2026-03-20",
    descripcion: "Salón versátil con capacidad para 150 personas. Configuración flexible para juntas vecinales, talleres, cursos y celebraciones comunitarias. Incluye mesas, sillas plegables, pizarrón y acceso a internet.",
    reglas: "El solicitante debe dejar el espacio en las mismas condiciones. No se permite fumar. Se requiere aviso con 48 horas de anticipación para cancelaciones. Capacidad máxima estricta por normas de protección civil.",
    horarioDisponible: "07:00 - 22:00",
    imagenes: ["/placeholder.svg", "/placeholder.svg"],
  },
  {
    id: "ESP-005",
    nombre: "Cancha Deportiva Norte",
    tipo: "Cancha",
    ubicacion: "Av. del Deporte #15, Col. Norte",
    capacidad: 200,
    costoPorHora: 800,
    estado: "activo",
    proximaReservacion: "2026-03-14",
    descripcion: "Cancha deportiva multiusos con piso sintético. Incluye vestidores, sanitarios, gradas para espectadores e iluminación para uso nocturno. Apta para fútbol rápido, básquetbol y voleibol.",
    reglas: "Uso obligatorio de calzado deportivo adecuado. Prohibido introducir bebidas en envase de vidrio. Reservación por bloques de 2 horas mínimo. El usuario es responsable del equipo deportivo.",
    horarioDisponible: "06:00 - 22:00",
    imagenes: ["/placeholder.svg"],
  },
  {
    id: "ESP-006",
    nombre: "Centro Cultural Reforma",
    tipo: "Centro cultural",
    ubicacion: "Calle Reforma #320, Col. Juárez",
    capacidad: 120,
    costoPorHora: 2000,
    estado: "inactivo",
    proximaReservacion: null,
    descripcion: "Espacio cultural con galería de exposiciones, sala de conferencias y taller de artes. Equipado con sistema de iluminación especializado para exhibiciones y proyector para presentaciones.",
    reglas: "No tocar las obras en exhibición. Se requiere proyecto cultural aprobado para uso de galería. Prohibido alterar la infraestructura del inmueble. Limpieza obligatoria al término del evento.",
    horarioDisponible: "09:00 - 20:00",
    imagenes: ["/placeholder.svg", "/placeholder.svg"],
  },
];

export const reservacionesEspacioMock: Record<string, ReservacionEspacio[]> = {
  "ESP-001": [
    { id: "RES-101", solicitante: "María López", fecha: "2026-03-12", horario: "10:00 - 14:00", tipo: "Evento cultural", estado: "aprobado" },
    { id: "RES-102", solicitante: "Gobierno Municipal", fecha: "2026-03-18", horario: "08:00 - 13:00", tipo: "Ceremonia cívica", estado: "pendiente" },
    { id: "RES-103", solicitante: "Asociación de Comerciantes", fecha: "2026-03-25", horario: "09:00 - 20:00", tipo: "Feria artesanal", estado: "pendiente" },
  ],
  "ESP-002": [
    { id: "RES-201", solicitante: "Carlos Ramírez", fecha: "2026-03-15", horario: "18:00 - 22:00", tipo: "Conferencia", estado: "aprobado" },
    { id: "RES-202", solicitante: "Escuela Preparatoria #3", fecha: "2026-03-22", horario: "10:00 - 14:00", tipo: "Graduación", estado: "pendiente" },
  ],
  "ESP-004": [
    { id: "RES-401", solicitante: "Comité Vecinal Norte", fecha: "2026-03-20", horario: "18:00 - 20:00", tipo: "Reunión vecinal", estado: "aprobado" },
  ],
  "ESP-005": [
    { id: "RES-501", solicitante: "Liga Municipal de Fútbol", fecha: "2026-03-14", horario: "16:00 - 20:00", tipo: "Torneo deportivo", estado: "aprobado" },
    { id: "RES-502", solicitante: "Club Deportivo Azteca", fecha: "2026-03-21", horario: "08:00 - 12:00", tipo: "Entrenamiento", estado: "pendiente" },
  ],
};

export const historialReservacionesMock: Record<string, ReservacionEspacio[]> = {
  "ESP-001": [
    { id: "RES-050", solicitante: "Festival de Primavera", fecha: "2026-02-28", horario: "09:00 - 21:00", tipo: "Festival", estado: "completado" },
    { id: "RES-045", solicitante: "Gobierno Municipal", fecha: "2026-02-16", horario: "08:00 - 12:00", tipo: "Ceremonia cívica", estado: "completado" },
  ],
  "ESP-002": [
    { id: "RES-060", solicitante: "Universidad Estatal", fecha: "2026-02-20", horario: "16:00 - 21:00", tipo: "Congreso académico", estado: "completado" },
  ],
};

export const incidenciasEspacioMock: Record<string, IncidenciaEspacio[]> = {
  "ESP-001": [
    { id: "INC-001", descripcion: "Luminaria dañada en esquina noroeste", reportadoPor: "Personal de vigilancia", fecha: "2026-03-05", estado: "abierta" },
  ],
  "ESP-003": [
    { id: "INC-003", descripcion: "Banca rota en área de descanso", reportadoPor: "Juan Hernández", fecha: "2026-03-08", estado: "abierta" },
    { id: "INC-004", descripcion: "Sistema de riego averiado en zona norte", reportadoPor: "Jardinería municipal", fecha: "2026-03-02", estado: "en_proceso" },
  ],
  "ESP-005": [
    { id: "INC-005", descripcion: "Piso sintético despegado en área central", reportadoPor: "Liga Municipal de Fútbol", fecha: "2026-03-01", estado: "en_proceso" },
  ],
};
