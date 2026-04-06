import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, Eye, Plus } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getMisReservaciones, updateReservacionEstado, ApiError, type ReservacionAPI } from "@/lib/api";
import { getEstadoVisual } from "@/lib/reservacion-utils";

const columns: Column<ReservacionAPI>[] = [
  {
    key: "folio",
    header: "Folio",
    render: (item) => <span className="font-medium text-foreground">{item.folio}</span>,
  },
  {
    key: "espacioNombre",
    header: "Espacio",
  },
  {
    key: "fecha",
    header: "Fecha",
    render: (item) => (
      <span className="text-sm">{item.fecha}</span>
    ),
  },
  {
    key: "horaInicio",
    header: "Horario",
    render: (item) => (
      <span className="text-sm text-muted-foreground">
        {item.horaInicio} – {item.horaFin}
      </span>
    ),
  },
  {
    key: "estado",
    header: "Estado",
    render: (item) => <StatusBadge estado={getEstadoVisual(item)} />,
  },
  {
    key: "acciones",
    header: "Acciones",
    render: (item) => <AccionesCell item={item} />,
  },
];

function AccionesCell({ item }: { item: ReservacionAPI }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const cancelarMutation = useMutation({
    mutationFn: () => updateReservacionEstado(item.id, "cancelada"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mis-reservaciones"] });
      toast.success("Reservación cancelada");
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError
          ? (err.data as { error?: string })?.error ?? `Error ${err.status}`
          : "No se pudo cancelar la reservación";
      toast.error(msg);
    },
  });

  const puedeCangelar =
    item.estado === "pendiente_revision" || item.estado === "aprobada";

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => navigate(`/portal/reservaciones/${item.id}`)}
        title="Ver detalle"
      >
        <Eye className="h-4 w-4" />
      </Button>
      {puedeCangelar && <ConfirmDialog
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive h-8 px-2 text-xs"
          disabled={cancelarMutation.isPending}
        >
          Cancelar
        </Button>
      }
      title="Cancelar reservación"
      description={`¿Estás seguro de que deseas cancelar la reservación ${item.folio}? Esta acción no se puede deshacer.`}
      confirmLabel="Sí, cancelar"
      variant="destructive"
        onConfirm={() => cancelarMutation.mutate()}
      />}
    </div>
  );
}

export default function UserReservaciones() {
  const navigate = useNavigate();
  const { data: reservaciones = [], isLoading, isError } = useQuery({
    queryKey: ["mis-reservaciones"],
    queryFn: getMisReservaciones,
  });

  return (
    <UserLayout>
      <PageHeader
        title="Mis Reservaciones"
        description="Historial y estado de tus reservaciones de espacios públicos"
        actions={
          <Button
            size="sm"
            className="gap-2"
            onClick={() => navigate("/portal/reservaciones/nueva")}
          >
            <Plus className="h-4 w-4" />
            Nueva reservación
          </Button>
        }
      />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          title="Error al cargar reservaciones"
          description="No se pudo conectar con el servidor. Intenta recargar la página."
        />
      )}

      {!isLoading && !isError && reservaciones.length === 0 && (
        <EmptyState
          icon={CalendarCheck}
          title="No tienes reservaciones"
          description="Aún no has realizado ninguna reservación. Explora los espacios disponibles para comenzar."
        />
      )}

      {!isLoading && !isError && reservaciones.length > 0 && (
        <DataTable
          columns={columns as any}
          data={reservaciones as any}
          emptyMessage="No se encontraron reservaciones"
        />
      )}
    </UserLayout>
  );
}
