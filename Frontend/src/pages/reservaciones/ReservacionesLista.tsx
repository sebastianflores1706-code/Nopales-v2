import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Eye, Calendar, ClipboardList, DollarSign, Clock, Banknote, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { FilterBar } from "@/components/admin/FilterBar";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DataTable, Column } from "@/components/admin/DataTable";
import { StatCard } from "@/components/admin/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { estadosReservacion } from "@/data/reservacionesMock";
import { getReservaciones, getEspacios, type ReservacionAPI } from "@/lib/api";
import { getEstadoVisual } from "@/lib/reservacion-utils";

const ReservacionesLista = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";
  function setSearch(value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set("q", value); else next.delete("q");
      return next;
    });
  }
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroEspacio, setFiltroEspacio] = useState("todos");
  const [showFiltros, setShowFiltros] = useState(false);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const { data: reservaciones = [] } = useQuery({
    queryKey: ["reservaciones"],
    queryFn: getReservaciones,
  });

  const { data: espacios = [] } = useQuery({
    queryKey: ["espacios"],
    queryFn: getEspacios,
  });

  const espaciosOptions = useMemo(() => [
    { label: "Todos los espacios", value: "todos" },
    ...espacios.map((e) => ({ label: e.nombre, value: e.id })),
  ], [espacios]);

  const filtered = useMemo(() => {
    return reservaciones.filter((r) => {
      const matchSearch =
        !search ||
        r.folio.toLowerCase().includes(search.toLowerCase()) ||
        r.solicitanteNombre.toLowerCase().includes(search.toLowerCase()) ||
        r.tipoEvento.toLowerCase().includes(search.toLowerCase());
      const matchEstado = filtroEstado === "todos" || getEstadoVisual(r) === filtroEstado;
      const matchEspacio = filtroEspacio === "todos" || r.espacioId === filtroEspacio;
      const matchDesde = !fechaDesde || r.fecha >= fechaDesde;
      const matchHasta = !fechaHasta || r.fecha <= fechaHasta;
      return matchSearch && matchEstado && matchEspacio && matchDesde && matchHasta;
    });
  }, [reservaciones, search, filtroEstado, filtroEspacio, fechaDesde, fechaHasta]);

  const hayFiltrosActivos = filtroEstado !== "todos" || filtroEspacio !== "todos" || !!fechaDesde || !!fechaHasta;

  function limpiarFiltros() {
    setFiltroEstado("todos");
    setFiltroEspacio("todos");
    setFechaDesde("");
    setFechaHasta("");
  }

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
      render: (item) => <StatusBadge estado={getEstadoVisual(item)} />,
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
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/reservaciones/${item.id}`)}>
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ver detalle</TooltipContent>
          </Tooltip>
          {(item.pagoEstado === "pendiente" || item.pagoEstado === "anticipo") &&
            item.estado !== "rechazada" &&
            item.estado !== "cancelada" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-warning hover:text-warning"
                  onClick={() => navigate(`/reservaciones/${item.id}`)}
                >
                  <Banknote className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {item.pagoEstado === "anticipo" ? "Registrar abono" : "Registrar pago"}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
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
          { label: "Espacio", options: espaciosOptions, value: filtroEspacio, onChange: setFiltroEspacio },
        ]}
        onToggleFiltros={() => setShowFiltros((v) => !v)}
        filtrosActivos={hayFiltrosActivos}
      />

      {showFiltros && (
        <div className="mb-4 p-4 rounded-lg border border-border bg-muted/30 flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Fecha desde</Label>
            <Input
              type="date"
              className="h-9 text-sm w-40"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Fecha hasta</Label>
            <Input
              type="date"
              className="h-9 text-sm w-40"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>
          {hayFiltrosActivos && (
            <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-muted-foreground" onClick={limpiarFiltros}>
              <X className="h-3.5 w-3.5" />
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

      <DataTable
        columns={columns as any}
        data={filtered as any}
        emptyMessage="No se encontraron reservaciones con los filtros seleccionados"
      />
    </AppLayout>
  );
};

export default ReservacionesLista;
