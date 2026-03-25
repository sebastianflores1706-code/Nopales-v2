const API_BASE = "http://localhost:3000";

export class ApiError extends Error {
  constructor(public status: number, public data: unknown) {
    super(`Error ${status}`);
  }
}

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data);
  }
  return res.json();
}

interface EspacioRaw {
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

export interface EspacioAPI {
  id: string;
  nombre: string;
  tipo: string;
  ubicacion: string;
  capacidad: number;
  costoPorHora: number;
  estado: string;
  proximaReservacion: null;
  // campos opcionales que el backend aún no devuelve
  imagenes?: string[];
  descripcion?: string;
  reglas?: string;
  horarioDisponible?: string;
}

function mapRaw(raw: EspacioRaw): EspacioAPI {
  return { ...raw, costoPorHora: raw.costoHora, proximaReservacion: null };
}

export async function getEspacios(): Promise<EspacioAPI[]> {
  const data = await fetchJSON<EspacioRaw[]>("/api/espacios");
  return data.map(mapRaw);
}

export async function getEspacioById(id: string): Promise<EspacioAPI> {
  const raw = await fetchJSON<EspacioRaw>(`/api/espacios/${id}`);
  return mapRaw(raw);
}

export interface CreateEspacioInput {
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

export async function updateEspacio(id: string, data: CreateEspacioInput): Promise<EspacioAPI> {
  const res = await fetch(`${API_BASE}/api/espacios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new ApiError(res.status, json);
  return mapRaw(json as EspacioRaw);
}

export async function createEspacio(data: CreateEspacioInput): Promise<EspacioAPI> {
  const res = await fetch(`${API_BASE}/api/espacios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new ApiError(res.status, json);
  const raw = json as EspacioRaw;
  return mapRaw(raw);
}

export interface ReservacionAPI {
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
  costoHora: number;
  montoTotal: number;
  totalPagado: number;
  saldoPendiente: number;
}

export async function getReservaciones(): Promise<ReservacionAPI[]> {
  return fetchJSON<ReservacionAPI[]>("/api/reservaciones");
}

export async function getReservacionById(id: string): Promise<ReservacionAPI> {
  return fetchJSON<ReservacionAPI>(`/api/reservaciones/${id}`);
}

export async function updateReservacionEstado(id: string, estado: string): Promise<ReservacionAPI> {
  const res = await fetch(`${API_BASE}/api/reservaciones/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });
  const json = await res.json();
  if (!res.ok) throw new ApiError(res.status, json);
  return json as ReservacionAPI;
}

export interface CreateReservacionInput {
  espacioId: string;
  solicitanteNombre: string;
  tipoEvento: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  asistentes: number;
}

export interface PagoAPI {
  id: string;
  reservacionId: string;
  reservacionFolio: string;
  espacioNombre: string;
  solicitanteNombre: string;
  tipoEvento: string;
  fechaEvento: string;
  horaInicio: string;
  horaFin: string;
  monto: number;
  estado: string;
  metodo: string;
  referencia?: string;
  fechaPago?: string;
  montoTotal: number;
  totalPagado: number;
  saldoPendiente: number;
}

export async function getPagos(): Promise<PagoAPI[]> {
  return fetchJSON<PagoAPI[]>("/api/pagos");
}

export async function getPagoById(id: string): Promise<PagoAPI> {
  return fetchJSON<PagoAPI>(`/api/pagos/${id}`);
}

export async function updatePagoEstado(id: string, estado: string): Promise<PagoAPI> {
  const res = await fetch(`${API_BASE}/api/pagos/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });
  const json = await res.json();
  if (!res.ok) throw new ApiError(res.status, json);
  return json as PagoAPI;
}

export interface CreatePagoInput {
  reservacionId: string;
  monto: number;
  metodo: "efectivo" | "transferencia" | "tarjeta";
  estado?: "pendiente" | "pagado";
}

export async function createPago(data: CreatePagoInput): Promise<PagoAPI> {
  const res = await fetch(`${API_BASE}/api/pagos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new ApiError(res.status, json);
  return json as PagoAPI;
}

export async function createReservacion(data: CreateReservacionInput): Promise<ReservacionAPI> {
  const res = await fetch(`${API_BASE}/api/reservaciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new ApiError(res.status, json);
  return json as ReservacionAPI;
}

export interface DocumentoAPI {
  id: string;
  reservacionId: string;
  tipo: string;
  nombreArchivo: string;
  contenido: string;
  createdAt: string;
  reservacionFolio: string;
  espacioNombre: string;
  solicitanteNombre: string;
  fechaEvento: string;
}

export async function getAllDocumentos(): Promise<DocumentoAPI[]> {
  return fetchJSON<DocumentoAPI[]>("/api/documentos");
}

export async function generarContrato(reservacionId: string): Promise<DocumentoAPI> {
  const res = await fetch(`${API_BASE}/api/documentos/generar-contrato`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reservacionId }),
  });
  const json = await res.json();
  if (!res.ok) throw new ApiError(res.status, json);
  return json as DocumentoAPI;
}

export async function getDocumentosByReservacion(reservacionId: string): Promise<DocumentoAPI[]> {
  return fetchJSON<DocumentoAPI[]>(`/api/documentos/reservacion/${reservacionId}`);
}

export async function deactivateEspacio(id: string): Promise<EspacioAPI> {
  const res = await fetch(`${API_BASE}/api/espacios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado: "inactivo" }),
  });
  const json = await res.json();
  if (!res.ok) throw new ApiError(res.status, json);
  return mapRaw(json as EspacioRaw);
}
