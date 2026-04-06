import type { MantenimientoAPI } from "@/lib/api";

/**
 * Calcula el estado visible de un espacio.
 * Si hay un mantenimiento activo en este momento → "en_mantenimiento".
 * Si no → devuelve el estado base del espacio (activo / inactivo).
 *
 * Mismo patrón que getEstadoVisual para reservaciones.
 */
export function getEstadoVisualEspacio(
  espacio: { id: string; estado: string },
  mantenimientos: MantenimientoAPI[],
  now: Date = new Date()
): string {
  const hayActivo = mantenimientos.some((m) => {
    if (m.espacioId !== espacio.id) return false;
    const inicio = new Date(m.fechaInicio);
    const fin = new Date(m.fechaFin);
    return now >= inicio && now <= fin;
  });
  return hayActivo ? "en_mantenimiento" : espacio.estado;
}
