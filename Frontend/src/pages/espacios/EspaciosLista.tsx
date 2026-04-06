import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Eye, Pencil, Ban, MapPin, Users, DollarSign } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { FilterBar } from "@/components/admin/FilterBar";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DataTable, Column } from "@/components/admin/DataTable";
import { StatCard } from "@/components/admin/StatCard";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { tiposEspacio, estadosEspacio } from "@/data/espaciosMock";
import { getEspacios, getMantenimientos, deactivateEspacio, ApiError, type EspacioAPI } from "@/lib/api";
import { getEstadoVisualEspacio } from "@/lib/espacio-utils";

const EspaciosLista = () => {
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
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const queryClient = useQueryClient();

  const { data: espacios = [] } = useQuery({
    queryKey: ["espacios"],
    queryFn: getEspacios,
  });

  const { data: mantenimientos = [] } = useQuery({
    queryKey: ["mantenimientos"],
    queryFn: getMantenimientos,
    refetchInterval: 60_000,
  });

  const desactivarMutation = useMutation({
    mutationFn: (id: string) => deactivateEspacio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["espacios"] });
      toast.success("Espacio desactivado correctamente");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? `Error ${error.status}: no se pudo desactivar` : "No se pudo desactivar el espacio");
    },
  });

  const filtered = useMemo(() => {
    return espacios.filter((e) => {
      const matchSearch =
        !search ||
        e.nombre.toLowerCase().includes(search.toLowerCase()) ||
        e.ubicacion.toLowerCase().includes(search.toLowerCase());
      const matchTipo = filtroTipo === "todos" || e.tipo.toLowerCase() === filtroTipo;
      const estadoVisual = getEstadoVisualEspacio(e, mantenimientos);
      const matchEstado = filtroEstado === "todos" || estadoVisual === filtroEstado;
      return matchSearch && matchTipo && matchEstado;
    });
  }, [espacios, mantenimientos, search, filtroTipo, filtroEstado]);

  const totalActivos = espacios.filter((e) => getEstadoVisualEspacio(e, mantenimientos) === "activo").length;
  const totalInactivos = espacios.filter((e) => getEstadoVisualEspacio(e, mantenimientos) === "inactivo").length;
  const totalMantenimiento = espacios.filter((e) => getEstadoVisualEspacio(e, mantenimientos) === "en_mantenimiento").length;

  const columns: Column<EspacioAPI>[] = [
    {
      key: "nombre",
      header: "Nombre",
      render: (item) => <span className="font-medium text-foreground">{item.nombre}</span>,
    },
    { key: "tipo", header: "Tipo" },
    {
      key: "ubicacion",
      header: "Ubicación",
      render: (item) => (
        <span className="text-muted-foreground text-xs max-w-[200px] truncate block">{item.ubicacion}</span>
      ),
    },
    {
      key: "capacidad",
      header: "Capacidad",
      render: (item) => <span>{item.capacidad} personas</span>,
    },
    {
      key: "costoPorHora",
      header: "Costo/Hora",
      render: (item) => <span className="font-medium">${item.costoPorHora.toLocaleString()}</span>,
    },
    {
      key: "estado",
      header: "Estado",
      render: (item) => <StatusBadge estado={getEstadoVisualEspacio(item, mantenimientos)} />,
    },
    {
      key: "proximaReservacion",
      header: "Próxima reservación",
      render: (item) => (
        <span className="text-muted-foreground text-xs">
          {item.proximaReservacion ?? "Sin reservaciones"}
        </span>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (item) => (
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/espacios/${item.id}`)}>
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ver detalle</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/espacios/${item.id}/editar`)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editar</TooltipContent>
          </Tooltip>
          <Tooltip>
            <ConfirmDialog
              trigger={
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                    <Ban className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
              }
              title="Desactivar espacio"
              description={`¿Estás seguro de que deseas desactivar "${item.nombre}"? El espacio quedará como inactivo.`}
              confirmLabel="Desactivar"
              variant="destructive"
              onConfirm={() => desactivarMutation.mutate(item.id)}
            />
            <TooltipContent>Desactivar</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Espacios"
        description="Gestión de espacios públicos disponibles para reservaciones"
        actions={
          <Button size="sm" className="gap-2" onClick={() => navigate("/espacios/nuevo")}>
            <Plus className="h-4 w-4" />
            Crear espacio
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Espacios activos" value={totalActivos} icon={MapPin} variant="success" />
        <StatCard title="En mantenimiento" value={totalMantenimiento} icon={Users} variant="warning" />
        <StatCard title="Inactivos" value={totalInactivos} icon={DollarSign} variant="destructive" />
      </div>

      <FilterBar
        searchPlaceholder="Buscar espacio por nombre o ubicación..."
        onSearch={setSearch}
        filters={[
          { label: "Tipo", options: tiposEspacio, value: filtroTipo, onChange: setFiltroTipo },
          { label: "Estado", options: estadosEspacio, value: filtroEstado, onChange: setFiltroEstado },
        ]}
      />

      <DataTable
        columns={columns as any}
        data={filtered as any}
        emptyMessage="No se encontraron espacios con los filtros seleccionados"
      />
    </AppLayout>
  );
};

export default EspaciosLista;
