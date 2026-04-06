/**
 * Devuelve el estado visual de una reservación.
 * - Solo sobreescribe "aprobada" → "en_curso" si now cae dentro de [horaInicio, horaFin].
 * - Si now > horaFin y el backend aún no actualizó, muestra "finalizada" visualmente.
 * - Todos los demás estados (cancelada, rechazada, pendiente_revision, etc.) pasan sin cambio.
 * - "en_curso" nunca se guarda en DB; es puramente derivado en frontend.
 */
export function getEstadoVisual(
  r: { estado: string; fecha: string; horaInicio: string; horaFin: string },
  now: Date = new Date()
): string {
  if (r.estado !== "aprobada") return r.estado;

  const inicio = new Date(`${r.fecha}T${r.horaInicio}:00`);
  const fin = new Date(`${r.fecha}T${r.horaFin}:00`);

  if (now >= inicio && now <= fin) return "en_curso";
  if (now > fin) return "finalizada"; // visual fallback antes de que backend persista
  return "aprobada";
}
