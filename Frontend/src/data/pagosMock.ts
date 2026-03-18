export type EstadoPago = "pendiente" | "pagado" | "cancelado" | "reembolsado";
export type MetodoPago = "transferencia" | "efectivo" | "tarjeta" | "cheque";

export interface HistorialPago {
  accion: string;
  usuario: string;
  fecha: string;
  monto?: number;
}

export interface Pago {
  id: string;
  folioReservacion: string;
  espacio: string;
  espacioId: string;
  solicitante: string;
  tipoEvento: string;
  fechaEvento: string;
  montoTotal: number;
  anticipo: number;
  saldoPendiente: number;
  metodoPago: MetodoPago;
  referencia: string;
  fechaPago: string;
  estado: EstadoPago;
  comprobante: string | null;
  historial: HistorialPago[];
}

export const metodosPago: { label: string; value: MetodoPago }[] = [
  { label: "Transferencia bancaria", value: "transferencia" },
  { label: "Efectivo", value: "efectivo" },
  { label: "Tarjeta", value: "tarjeta" },
  { label: "Cheque", value: "cheque" },
];

export const estadosPagoFiltro = [
  { label: "Todos", value: "todos" },
  { label: "Pendiente", value: "pendiente" },
  { label: "Pagado", value: "pagado" },
  { label: "Cancelado", value: "cancelado" },
  { label: "Reembolsado", value: "reembolsado" },
];

export const espaciosPagoFiltro = [
  { label: "Todos", value: "todos" },
  { label: "Plaza Central", value: "ESP-001" },
  { label: "Auditorio Municipal", value: "ESP-002" },
  { label: "Parque Bicentenario", value: "ESP-003" },
  { label: "Salón de Usos Múltiples", value: "ESP-004" },
  { label: "Cancha Deportiva Norte", value: "ESP-005" },
  { label: "Centro Cultural Reforma", value: "ESP-006" },
];

export const metodosPagoFiltro = [
  { label: "Todos", value: "todos" },
  ...metodosPago,
];

export const pagosMock: Pago[] = [
  {
    id: "PAG-2026-001",
    folioReservacion: "RES-2026-001",
    espacio: "Plaza Central",
    espacioId: "ESP-001",
    solicitante: "María López García",
    tipoEvento: "Festival cultural",
    fechaEvento: "2026-03-12",
    montoTotal: 25000,
    anticipo: 12500,
    saldoPendiente: 0,
    metodoPago: "transferencia",
    referencia: "SPEI-20260228-001",
    fechaPago: "2026-02-28",
    estado: "pagado",
    comprobante: "comprobante_PAG001.pdf",
    historial: [
      { accion: "Pago generado", usuario: "Admin", fecha: "2026-02-25 11:30", monto: 25000 },
      { accion: "Anticipo registrado", usuario: "Admin", fecha: "2026-02-26 10:00", monto: 12500 },
      { accion: "Saldo liquidado", usuario: "Admin", fecha: "2026-02-28 16:45", monto: 12500 },
      { accion: "Pago validado", usuario: "Tesorería", fecha: "2026-02-28 17:00" },
    ],
  },
  {
    id: "PAG-2026-002",
    folioReservacion: "RES-2026-002",
    espacio: "Auditorio Municipal",
    espacioId: "ESP-002",
    solicitante: "Carlos Ramírez Torres",
    tipoEvento: "Conferencia municipal",
    fechaEvento: "2026-03-15",
    montoTotal: 31500,
    anticipo: 0,
    saldoPendiente: 31500,
    metodoPago: "transferencia",
    referencia: "",
    fechaPago: "",
    estado: "pendiente",
    comprobante: null,
    historial: [
      { accion: "Pago generado", usuario: "Admin", fecha: "2026-03-01 11:00", monto: 31500 },
    ],
  },
  {
    id: "PAG-2026-003",
    folioReservacion: "RES-2026-003",
    espacio: "Parque Bicentenario",
    espacioId: "ESP-003",
    solicitante: "Asociación Vecinal Sur",
    tipoEvento: "Evento comunitario",
    fechaEvento: "2026-03-20",
    montoTotal: 12600,
    anticipo: 0,
    saldoPendiente: 12600,
    metodoPago: "efectivo",
    referencia: "",
    fechaPago: "",
    estado: "pendiente",
    comprobante: null,
    historial: [
      { accion: "Pago generado", usuario: "Admin", fecha: "2026-03-05 10:30", monto: 12600 },
    ],
  },
  {
    id: "PAG-2026-004",
    folioReservacion: "RES-2026-004",
    espacio: "Cancha Deportiva Norte",
    espacioId: "ESP-005",
    solicitante: "Liga Municipal de Fútbol",
    tipoEvento: "Torneo deportivo",
    fechaEvento: "2026-03-22",
    montoTotal: 9600,
    anticipo: 4800,
    saldoPendiente: 4800,
    metodoPago: "efectivo",
    referencia: "REC-EFE-20260310",
    fechaPago: "2026-03-10",
    estado: "pendiente",
    comprobante: "recibo_anticipo_PAG004.pdf",
    historial: [
      { accion: "Pago generado", usuario: "Admin", fecha: "2026-03-08 10:00", monto: 9600 },
      { accion: "Anticipo registrado", usuario: "Admin", fecha: "2026-03-10 14:00", monto: 4800 },
    ],
  },
  {
    id: "PAG-2026-005",
    folioReservacion: "RES-2026-005",
    espacio: "Auditorio Municipal",
    espacioId: "ESP-002",
    solicitante: "Escuela Preparatoria #3",
    tipoEvento: "Graduación",
    fechaEvento: "2026-04-05",
    montoTotal: 17500,
    anticipo: 0,
    saldoPendiente: 17500,
    metodoPago: "cheque",
    referencia: "",
    fechaPago: "",
    estado: "pendiente",
    comprobante: null,
    historial: [
      { accion: "Pago generado", usuario: "Admin", fecha: "2026-03-10 08:45", monto: 17500 },
    ],
  },
  {
    id: "PAG-2026-006",
    folioReservacion: "RES-2026-006",
    espacio: "Plaza Central",
    espacioId: "ESP-001",
    solicitante: "Gobierno Municipal",
    tipoEvento: "Concierto",
    fechaEvento: "2026-04-10",
    montoTotal: 12500,
    anticipo: 12500,
    saldoPendiente: 0,
    metodoPago: "cheque",
    referencia: "CHQ-GOB-2026-0045",
    fechaPago: "2026-02-22",
    estado: "pagado",
    comprobante: "orden_pago_PAG006.pdf",
    historial: [
      { accion: "Pago generado", usuario: "Admin", fecha: "2026-02-20 10:00", monto: 12500 },
      { accion: "Pago registrado vía cheque", usuario: "Tesorería", fecha: "2026-02-22 09:00", monto: 12500 },
      { accion: "Pago validado", usuario: "Tesorería", fecha: "2026-02-22 10:30" },
    ],
  },
  {
    id: "PAG-2026-007",
    folioReservacion: "RES-2026-007",
    espacio: "Salón de Usos Múltiples",
    espacioId: "ESP-004",
    solicitante: "Comité Vecinal Norte",
    tipoEvento: "Reunión vecinal",
    fechaEvento: "2026-03-25",
    montoTotal: 2400,
    anticipo: 2400,
    saldoPendiente: 0,
    metodoPago: "efectivo",
    referencia: "REC-EFE-20260310-B",
    fechaPago: "2026-03-10",
    estado: "pagado",
    comprobante: "recibo_PAG007.pdf",
    historial: [
      { accion: "Pago generado", usuario: "Admin", fecha: "2026-03-09 10:00", monto: 2400 },
      { accion: "Pago en efectivo registrado", usuario: "Admin", fecha: "2026-03-10 11:30", monto: 2400 },
      { accion: "Pago validado", usuario: "Admin", fecha: "2026-03-10 11:45" },
    ],
  },
  {
    id: "PAG-2026-008",
    folioReservacion: "RES-2026-008",
    espacio: "Centro Cultural Reforma",
    espacioId: "ESP-006",
    solicitante: "Colectivo Artístico Municipal",
    tipoEvento: "Festival cultural",
    fechaEvento: "2026-03-18",
    montoTotal: 18000,
    anticipo: 0,
    saldoPendiente: 0,
    metodoPago: "transferencia",
    referencia: "",
    fechaPago: "",
    estado: "cancelado",
    comprobante: null,
    historial: [
      { accion: "Pago generado", usuario: "Admin", fecha: "2026-02-28 14:00", monto: 18000 },
      { accion: "Pago cancelado - Reservación rechazada", usuario: "Admin", fecha: "2026-03-02 09:00" },
    ],
  },
  {
    id: "PAG-2026-009",
    folioReservacion: "RES-2026-009",
    espacio: "Plaza Central",
    espacioId: "ESP-001",
    solicitante: "Asociación de Comerciantes",
    tipoEvento: "Feria artesanal",
    fechaEvento: "2026-03-28",
    montoTotal: 30000,
    anticipo: 0,
    saldoPendiente: 30000,
    metodoPago: "tarjeta",
    referencia: "",
    fechaPago: "",
    estado: "pendiente",
    comprobante: null,
    historial: [
      { accion: "Pago generado", usuario: "Admin", fecha: "2026-03-07 11:00", monto: 30000 },
    ],
  },
  {
    id: "PAG-2026-010",
    folioReservacion: "RES-2026-010",
    espacio: "Cancha Deportiva Norte",
    espacioId: "ESP-005",
    solicitante: "Club Deportivo Azteca",
    tipoEvento: "Partido de fútbol",
    fechaEvento: "2026-04-12",
    montoTotal: 3200,
    anticipo: 0,
    saldoPendiente: 3200,
    metodoPago: "transferencia",
    referencia: "",
    fechaPago: "",
    estado: "pendiente",
    comprobante: null,
    historial: [
      { accion: "Pago generado", usuario: "Admin", fecha: "2026-03-10 17:00", monto: 3200 },
    ],
  },
  {
    id: "PAG-2026-011",
    folioReservacion: "RES-2025-098",
    espacio: "Auditorio Municipal",
    espacioId: "ESP-002",
    solicitante: "Cámara de Comercio Local",
    tipoEvento: "Conferencia",
    fechaEvento: "2025-12-10",
    montoTotal: 22000,
    anticipo: 22000,
    saldoPendiente: 22000,
    metodoPago: "tarjeta",
    referencia: "TRJ-20251205-112",
    fechaPago: "2025-12-05",
    estado: "reembolsado",
    comprobante: "comprobante_reembolso_PAG011.pdf",
    historial: [
      { accion: "Pago generado", usuario: "Admin", fecha: "2025-11-20 10:00", monto: 22000 },
      { accion: "Pago con tarjeta registrado", usuario: "Admin", fecha: "2025-12-05 14:00", monto: 22000 },
      { accion: "Solicitud de reembolso - Evento cancelado", usuario: "Cámara de Comercio Local", fecha: "2025-12-07 09:00" },
      { accion: "Reembolso aprobado", usuario: "Tesorería", fecha: "2025-12-08 11:00" },
      { accion: "Reembolso procesado", usuario: "Tesorería", fecha: "2025-12-10 16:00", monto: 22000 },
    ],
  },
];
