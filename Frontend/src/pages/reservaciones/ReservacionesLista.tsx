import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Calendar, ClipboardList, DollarSign, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { FilterBar } from "@/components/admin/FilterBar";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DataTable, Column } from "@/components/admin/DataTable";
import { StatCard } from "@/components/admin/StatCard";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { estadosReservacion, espaciosFiltro } from "@/data/reservacionesMock";
import { getReservaciones, type ReservacionAPI } from "@/lib/api";

const ReservacionesLista = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroEspacio, setFiltroEspacio] = useState("todos");

  const { data: reservaciones = [] } = useQuery({
    queryKey: ["reservaciones"],
    queryFn: getReservaciones,
  });

  const filtered = useMemo(() => {
    return reservaciones.filter((r) => {
      const matchSearch =
        !search ||
        r.folio.toLowerCase().includes(search.toLowerCase()) ||
        r.solicitanteNombre.toLowerCase().includes(search.toLowerCase()) ||
        r.tipoEvento.toLowerCase().includes(search.toLowerCase());
      const matchEstado = filtroEstado === "todos" || r.estado === filtroEstado;
      const matchEspacio = filtroEspacio === "todos" || r.espacioId === filtroEspacio;
      return matchSearch && matchEstado && matchEspacio;
    });
  }, [reservaciones, search, filtroEstado, filtroEspacio]);

  const totalPendientes = reservaciones.filter((r) => r.estado === "pendiente_revision").length;
  const totalAprobadas = reservaciones.filter((r) => r.estado === "aprobada").length;
  const pagosPendientes = reservaciones.filter((r) => r.pagoEstado === "pendiente" && r.estado !== "rechazada" && r.estado !== "cancelada").length;
  const totalReservaciones = reservaciones.length;

  const columns: Column<ReservacionAPI>[] = [
    {
      key: "folio",
      header: "Folio",
      render: (item) => <span className="font-medium text-foreground">{item.folio}</span>,
    },
    {
      key: "espacioNombre",
      header: "Espacio",
      render: (item) => <span>{item.espacioNombre}</span>,
    },
    {
      key: "solicitanteNombre",
      header: "Solicitante",
      render: (item) => <span className="text-sm">{item.solicitanteNombre}</span>,
    },
    { key: "tipoEvento", header: "Tipo" },
    { key: "fecha", header: "Fecha" },
    {
      key: "horaInicio",
      header: "Horario",
      render: (item) => (
        <span className="text-muted-foreground text-xs">{item.horaInicio} – {item.horaFin}</span>
      ),
    },
    {
      key: "asistentes",
      header: "Asistentes",
      render: (item) => <span>{item.asistentes}</span>,
    },
    {
      key: "estado",
      header: "Estado",
      render: (item) => <StatusBadge estado={item.estado} />,
    },
    {
      key: "pagoEstado",
      header: "Pago",
      render: (item) => <StatusBadge estado={item.pagoEstado} />,
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (item) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/reservaciones/${item.id}`)}>
              <Eye className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ver detalle</TooltipContent>
        </Tooltip>
      ),
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Reservaciones"
        description="Gestión de solicitudes de uso de espacios públicos"
        actions={
          <Button size="sm" className="gap-2" onClick={() => navigate("/reservaciones/nueva")}>
            <Plus className="h-4 w-4" />
            Nueva solicitud
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total reservaciones" value={totalReservaciones} icon={ClipboardList} />
        <StatCard title="Pendientes de revisión" value={totalPendientes} icon={Clock} variant="warning" />
        <StatCard title="Aprobadas" value={totalAprobadas} icon={Calendar} variant="success" />
        <StatCard title="Pagos pendientes" value={pagosPendientes} icon={DollarSign} variant="destructive" />
      </div>

      <FilterBar
        searchPlaceholder="Buscar por folio, solicitante o evento..."
        onSearch={setSearch}
        filters={[
          { label: "Estado", options: estadosReservacion, value: filtroEstado, onChange: setFiltroEstado },
          { label: "Espacio", options: espaciosFiltro, value: filtroEspacio, onChange: setFiltroEspacio },
        ]}
      />

      <DataTable
        columns={columns as any}
        data={filtered as any}
        emptyMessage="No se encontraron reservaciones con los filtros seleccionados"
      />
    </AppLayout>
  );
};

export default ReservacionesLista;
