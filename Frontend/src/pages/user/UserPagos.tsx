import { useQuery } from "@tanstack/react-query";
import { CreditCard } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { getMisPagos, type PagoAPI } from "@/lib/api";

const columns: Column<PagoAPI>[] = [
  {
    key: "reservacionFolio",
    header: "Folio reservación",
    render: (item) => (
      <span className="font-medium text-foreground">{item.reservacionFolio}</span>
    ),
  },
  {
    key: "espacioNombre",
    header: "Espacio",
  },
  {
    key: "monto",
    header: "Abono",
    render: (item) => (
      <span className="text-sm font-medium">
        ${item.monto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    key: "saldoPendiente",
    header: "Saldo pendiente",
    render: (item) => (
      <span className={`text-sm font-medium ${item.saldoPendiente > 0 ? "text-destructive" : "text-muted-foreground"}`}>
        {item.saldoPendiente > 0
          ? `$${item.saldoPendiente.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
          : "—"}
      </span>
    ),
  },
  {
    key: "metodo",
    header: "Método",
    render: (item) => (
      <span className="text-sm capitalize">{item.metodo}</span>
    ),
  },
  {
    key: "estadoFinanciero",
    header: "Estado",
    render: (item) => <StatusBadge estado={item.estadoFinanciero} />,
  },
  {
    key: "fechaPago",
    header: "Fecha de pago",
    render: (item) => (
      <span className="text-sm text-muted-foreground">
        {item.fechaPago ?? "—"}
      </span>
    ),
  },
];

export default function UserPagos() {
  const { data: pagos = [], isLoading, isError } = useQuery({
    queryKey: ["mis-pagos"],
    queryFn: getMisPagos,
  });

  return (
    <UserLayout>
      <PageHeader
        title="Mis Pagos"
        description="Historial de pagos asociados a tus reservaciones"
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
          title="Error al cargar pagos"
          description="No se pudo conectar con el servidor. Intenta recargar la página."
        />
      )}

      {!isLoading && !isError && pagos.length === 0 && (
        <EmptyState
          icon={CreditCard}
          title="No tienes pagos registrados"
          description="Aquí aparecerán los pagos una vez que tus reservaciones sean aprobadas y se registre un pago."
        />
      )}

      {!isLoading && !isError && pagos.length > 0 && (
        <DataTable
          columns={columns as any}
          data={pagos as any}
          emptyMessage="No se encontraron pagos"
        />
      )}
    </UserLayout>
  );
}
