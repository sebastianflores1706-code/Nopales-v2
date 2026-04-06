import { ClipboardList, CreditCard, AlertTriangle, MapPin, CalendarCheck, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/admin/StatCard";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDashboardAdmin, type SolicitudPendiente } from "@/lib/api";

const solicitudColumns: Column<SolicitudPendiente>[] = [
  { key: "id", header: "ID" },
  { key: "solicitante", header: "Solicitante" },
  { key: "espacio", header: "Espacio" },
  { key: "tipo", header: "Tipo" },
  { key: "fecha", header: "Fecha" },
  { key: "estado", header: "Estado", render: (item) => <StatusBadge estado={item.estado as any} /> },
];

const Index = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-admin"],
    queryFn: getDashboardAdmin,
    staleTime: 30_000,
  });

  const metricas = data?.metricas;
  const espaciosMasUtilizados = data?.espaciosMasUtilizados ?? [];
  const actividadReciente = data?.actividadReciente ?? [];
  const solicitudesPendientes = data?.solicitudesPendientes ?? [];

  return (
    <AppLayout>
      <PageHeader
        title="Dashboard"
        description="Resumen general del sistema de gestión de espacios públicos"
      />

      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard
          title="Solicitudes pendientes"
          value={isLoading ? "—" : (metricas?.solicitudesPendientes ?? 0)}
          icon={ClipboardList}
          variant="warning"
          trend={{ value: 8, positive: false }}
        />
        <StatCard
          title="Res. con saldo pendiente"
          value={isLoading ? "—" : (metricas?.reservacionesSaldoPendiente ?? 0)}
          icon={CreditCard}
          variant="destructive"
        />
        <StatCard
          title="Mantenimientos activos"
          value={isLoading ? "—" : (metricas?.mantenimientosActivos ?? 0)}
          icon={AlertTriangle}
          variant="destructive"
        />
        <StatCard
          title="Espacios activos"
          value={isLoading ? "—" : (metricas?.espaciosActivos ?? 0)}
          icon={MapPin}
          variant="primary"
        />
        <StatCard
          title="Reservaciones hoy"
          value={isLoading ? "—" : (metricas?.reservacionesHoy ?? 0)}
          icon={CalendarCheck}
          variant="success"
        />
        <StatCard
          title="Ingresos del mes"
          value={isLoading ? "—" : `$${(metricas?.ingresosMes ?? 0).toLocaleString()}`}
          icon={DollarSign}
          variant="primary"
          trend={{ value: 12, positive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Espacios más utilizados */}
        <Card className="shadow-sm lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Espacios más utilizados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {espaciosMasUtilizados.map((espacio, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{espacio.nombre}</span>
                  <span className="text-muted-foreground">{espacio.ocupacion}%</span>
                </div>
                <Progress value={espacio.ocupacion} className="h-2" />
              </div>
            ))}
            {!isLoading && espaciosMasUtilizados.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            )}
          </CardContent>
        </Card>

        {/* Actividad reciente */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {actividadReciente.map((actividad) => (
                <div key={actividad.id} className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{actividad.descripcion}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {actividad.usuario} · {actividad.fecha}
                    </p>
                  </div>
                  <StatusBadge estado={actividad.estado as any} />
                </div>
              ))}
              {!isLoading && actividadReciente.length === 0 && (
                <p className="text-sm text-muted-foreground">Sin actividad reciente</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Solicitudes pendientes */}
      <div className="mb-6">
        <h2 className="text-base font-semibold mb-3">Solicitudes pendientes de aprobación</h2>
        <DataTable
          columns={solicitudColumns as any}
          data={solicitudesPendientes as any}
        />
      </div>
    </AppLayout>
  );
};

export default Index;
