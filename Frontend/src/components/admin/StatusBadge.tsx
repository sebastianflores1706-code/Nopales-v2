const FALLBACK = { label: "Desconocido", className: "bg-muted text-muted-foreground border-border" };

const statusConfig: Record<string, { label: string; className: string }> = {
  // Estados generales
  pendiente:          { label: "Pendiente",        className: "bg-warning/15 text-warning border-warning/20" },
  completado:         { label: "Completado",        className: "bg-success/15 text-success border-success/20" },
  abierta:            { label: "Abierta",           className: "bg-destructive/15 text-destructive border-destructive/20" },
  aprobado:           { label: "Aprobado",          className: "bg-success/15 text-success border-success/20" },
  en_proceso:         { label: "En proceso",        className: "bg-info/15 text-info border-info/20" },
  en_revision:        { label: "En revisión",       className: "bg-warning/15 text-warning border-warning/20" },
  rechazado:          { label: "Rechazado",         className: "bg-destructive/15 text-destructive border-destructive/20" },
  cerrada:            { label: "Cerrada",           className: "bg-muted text-muted-foreground border-border" },
  cancelado:          { label: "Cancelado",         className: "bg-muted text-muted-foreground border-border" },
  activo:             { label: "Activo",            className: "bg-success/15 text-success border-success/20" },
  en_mantenimiento:   { label: "En mantenimiento",  className: "bg-warning/15 text-warning border-warning/20" },
  inactivo:           { label: "Inactivo",          className: "bg-muted text-muted-foreground border-border" },
  realizada:          { label: "Realizada",         className: "bg-success/15 text-success border-success/20" },
  en_curso:           { label: "En curso",          className: "bg-success/15 text-success border-success/20" },
  pagado:             { label: "Pagado",            className: "bg-success/15 text-success border-success/20" },
  anticipo:           { label: "Anticipo",          className: "bg-warning/15 text-warning border-warning/20" },
  reembolsado:        { label: "Reembolsado",       className: "bg-info/15 text-info border-info/20" },
  // Estados de reembolso
  no_aplica:           { label: "Sin reembolso",        className: "bg-muted text-muted-foreground border-border" },
  reembolso_pendiente: { label: "Reembolso pendiente",  className: "bg-warning/15 text-warning border-warning/20" },
  reembolso_procesado: { label: "Reembolso procesado",  className: "bg-success/15 text-success border-success/20" },
  // Estados de reservación (backend)
  pendiente_revision: { label: "Pendiente revisión", className: "bg-warning/15 text-warning border-warning/20" },
  aprobada:           { label: "Aprobada",          className: "bg-success/15 text-success border-success/20" },
  rechazada:          { label: "Rechazada",         className: "bg-destructive/15 text-destructive border-destructive/20" },
  cancelada:          { label: "Cancelada",         className: "bg-muted text-muted-foreground border-border" },
  en_uso:             { label: "En uso",            className: "bg-info/15 text-info border-info/20" },
  finalizada:         { label: "Finalizada",        className: "bg-success/15 text-success border-success/20" },
};

interface StatusBadgeProps {
  estado: string;
}

export function StatusBadge({ estado }: StatusBadgeProps) {
  const config = statusConfig[estado] ?? FALLBACK;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
