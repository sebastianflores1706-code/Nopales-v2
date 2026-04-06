const API_BASE = "http://localhost:3000";

export class ApiError extends Error {
  constructor(public status: number, public data: unknown) {
    super(`Error ${status}`);
  }
}

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data);
  }
  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface UsuarioInfo {
  id: string;
  nombre: string;
  correo: string;
  rol: "admin" | "ciudadano";
}

export interface AuthResponse {
  usuario: UsuarioInfo;
}

export async function loginUsuario(correo: string, contrasena: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ correo, contrasena }),
  });
  const json = await res.json();
  if (!res.ok) throw new ApiError(res.status, json);
  return json as AuthResponse;
}

export async function registerUsuario(
  nombre: string,
  correo: string,
  contrasena: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ nombre, correo, contrasena }),
  });
  const json = await res.json();
  if (!res.ok) throw new ApiError(res.status, json);
  return json as AuthResponse;
}

export async function logoutUsuario(): Promise<void> {
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function getMe(): Promise<AuthResponse> {
  return fetchJSON<AuthResponse>("/api/auth/me");
}

export interface ImagenEspacio {
  id: string;
  url: string;
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
  imagenes?: ImagenEspacio[];
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
  imagenes: ImagenEspacio[];
  descripcion?: string;
  reglas?: string;
  horarioDisponible?: string;
}

function mapRaw(raw: EspacioRaw): EspacioAPI {
  return { ...raw, costoPorHora: raw.costoHora, proximaReservacion: null, imagenes: raw.imagenes ?? [] };
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
    credentials: "include",
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
    credentials: "include",
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
  espacioImagenUrl?: string;
  solicitanteNombre: string;
  tipoEvento: string;
  descripcionEvento?: string;
  reembolsoEstado?: string;
  reembolsoMonto: number;
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

export async function getMisReservaciones(): Promise<ReservacionAPI[]> {
  return fetchJSON<ReservacionAPI[]>("/api/reservaciones/mis");
}

export async function getReservacionById(id: string): Promise<ReservacionAPI> {
  return fetchJSON<ReservacionAPI>(`/api/reservaciones/${id}`);
}

export async function marcarReembolsoProcesado(id: string): Promise<ReservacionAPI> {
  const res = await fetch(`${API_BASE}/api/reservaciones/${id}/reembolso`, {
    method: "PATCH",
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new ApiError(res.status, json);
  return json as ReservacionAPI;
}

export async function updateReservacionEstado(id: string, estado: string): Promise<ReservacionAPI> {
  const res = await fetch(`${API_BASE}/api/reservaciones/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
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
  descripcionEvento?: string;
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
  estadoFinanciero: string;
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

export async function getMisPagos(): Promise<PagoAPI[]> {
  return fetchJSON<PagoAPI[]>("/api/pagos/mis");
}

export async function getPagoById(id: string): Promise<PagoAPI> {
  return fetchJSON<PagoAPI>(`/api/pagos/${id}`);
}

export async function updatePagoEstado(id: string, estado: string): Promise<PagoAPI> {
  const res = await fetch(`${API_BASE}/api/pagos/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
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
    credentials: "include",
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
    credentials: "include",
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
  pdfPath?: string;
}

export function getPdfUrl(id: string, download = false): string {
  return `${API_BASE}/api/documentos/${id}/pdf${download ? "?download=1" : ""}`;
}

export async function getAllDocumentos(): Promise<DocumentoAPI[]> {
  return fetchJSON<DocumentoAPI[]>("/api/documentos");
}

export async function generarPdfContrato(id: string): Promise<DocumentoAPI> {
  const res = await fetch(`${API_BASE}/api/documentos/${id}/generar-pdf`, {
    method: "POST",
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new ApiError(res.status, json);
  return json as DocumentoAPI;
}

export async function getMisContratos(): Promise<DocumentoAPI[]> {
  return fetchJSON<DocumentoAPI[]>("/api/documentos/mis");
}

// ─── Usuarios (admin) ─────────────────────────────────────────────────────────

export interface UsuarioAdminAPI {
  id: string;
  nombre: string;
  correo: string;
  rol: "admin" | "ciudadano";
  creadoEn: string;
}

export async function getUsuarios(): Promise<UsuarioAdminAPI[]> {
  return fetchJSON<UsuarioAdminAPI[]>("/api/usuarios");
}

export async function createUsuario(data: {
  nombre: string;
  correo: string;
  contrasena: string;
  rol: "admin" | "ciudadano";
}): Promise<UsuarioAdminAPI> {
  const res = await fetch(`${API_BASE}/api/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new ApiError(res.status, json);
  return json as UsuarioAdminAPI;
}

// ─── Mantenimientos ───────────────────────────────────────────────────────────

export interface MantenimientoAPI {
  id: string;
  espacioId: string;
  espacioNombre: string;
  fechaInicio: string;
  fechaFin: string;
  motivo: string;
  creadoEn: string;
}

export interface CreateMantenimientoInput {
  espacioId: string;
  fechaInicio: string;
  fechaFin: string;
  motivo: string;
}

export async function getMantenimientos(): Promise<MantenimientoAPI[]> {
  return fetchJSON<MantenimientoAPI[]>("/api/mantenimientos");
}

export async function createMantenimiento(data: CreateMantenimientoInput): Promise<MantenimientoAPI> {
  const res = await fetch(`${API_BASE}/api/mantenimientos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new ApiError(res.status, json);
  return json as MantenimientoAPI;
}

// ─── Dashboard Admin ──────────────────────────────────────────────────────────

export interface DashboardMetricas {
  solicitudesPendientes: number;
  reservacionesSaldoPendiente: number;
  mantenimientosActivos: number;
  espaciosActivos: number;
  reservacionesHoy: number;
  ingresosMes: number;
}

export interface EspacioUtilizado {
  nombre: string;
  reservaciones: number;
  ocupacion: number;
}

export interface ActividadItem {
  id: string;
  tipo: "reservacion" | "pago";
  descripcion: string;
  usuario: string;
  fecha: string;
  estado: string;
}

export interface SolicitudPendiente {
  id: string;
  solicitante: string;
  espacio: string;
  tipo: string;
  fecha: string;
  estado: string;
}

export interface DashboardAdminData {
  metricas: DashboardMetricas;
  espaciosMasUtilizados: EspacioUtilizado[];
  actividadReciente: ActividadItem[];
  solicitudesPendientes: SolicitudPendiente[];
}

export async function getDashboardAdmin(): Promise<DashboardAdminData> {
  return fetchJSON<DashboardAdminData>("/api/dashboard/admin");
}

export async function deleteMantenimiento(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/mantenimientos/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new ApiError(res.status, json);
  }
}

export async function generarContrato(reservacionId: string): Promise<DocumentoAPI> {
  const res = await fetch(`${API_BASE}/api/documentos/generar-contrato`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ reservacionId }),
  });
  const json = await res.json();
  if (!res.ok) throw new ApiError(res.status, json);
  return json as DocumentoAPI;
}

export async function getDocumentosByReservacion(reservacionId: string): Promise<DocumentoAPI[]> {
  return fetchJSON<DocumentoAPI[]>(`/api/documentos/reservacion/${reservacionId}`);
}

export function getImagenUrl(url: string): string {
  return `${API_BASE}${url}`;
}

export async function uploadImagenesEspacio(espacioId: string, files: File[]): Promise<ImagenEspacio[]> {
  const formData = new FormData();
  files.forEach((f) => formData.append("imagenes", f));
  const res = await fetch(`${API_BASE}/api/espacios/${espacioId}/imagenes`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new ApiError(res.status, json);
  return json as ImagenEspacio[];
}

export async function deleteImagenEspacio(espacioId: string, imagenId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/espacios/${espacioId}/imagenes/${imagenId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new ApiError(res.status, json);
  }
}

export async function deactivateEspacio(id: string): Promise<EspacioAPI> {
  const res = await fetch(`${API_BASE}/api/espacios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ estado: "inactivo" }),
  });
  const json = await res.json();
  if (!res.ok) throw new ApiError(res.status, json);
  return mapRaw(json as EspacioRaw);
}
