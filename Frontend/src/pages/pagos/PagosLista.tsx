import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, DollarSign, Clock, XCircle, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { FilterBar } from "@/components/admin/FilterBar";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { estadosPagoFiltro, espaciosPagoFiltro, metodosPagoFiltro } from "@/data/pagosMock";
import { getPagos, getReservaciones, type PagoAPI } from "@/lib/api";

const metodoPagoLabel: Record<string, string> = {
  transferencia: "Transferencia",
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  cheque: "Cheque",
};

export default function PagosLista() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroMetodo, setFiltroMetodo] = useState("todos");

  const { data: pagos = [], isLoading } = useQuery({
    queryKey: ["pagos"],
    queryFn: getPagos,
  });

  const { data: reservaciones = [] } = useQuery({
    queryKey: ["reservaciones"],
    queryFn: getReservaciones,
  });

  const filtered = useMemo(() => {
    return pagos.filter((p) => {
      if (filtroEstado !== "todos" && p.estado !== filtroEstado) return false;
      if (filtroMetodo !== "todos" && p.metodo !== filtroMetodo) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          p.reservacionFolio.toLowerCase().includes(s) ||
          p.espacioNombre.toLowerCase().includes(s) ||
          p.solicitanteNombre.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [pagos, search, filtroEstado, filtroMetodo]);

  const totalIngresos = pagos.filter((p) => p.estado === "pagado").reduce((s, p) => s + p.monto, 0);
  const totalPendiente = pagos.filter((p) => p.estado === "pendiente").reduce((s, p) => s + p.monto, 0);
  const countPendientes = reservaciones.filter((r) => r.pagoEstado === "pendiente" && r.estado !== "rechazada" && r.estado !== "cancelada").length;
  const countReembolsados = pagos.filter((p) => p.estado === "reembolsado").length;

  const columns: Column<PagoAPI>[] = [
    { key: "id", header: "Folio", render: (p) => <span className="font-mono text-xs font-medium" title={p.id}>{p.id.slice(0, 8)}…</span> },
    { key: "reservacionFolio", header: "Reservación", render: (p) => <span className="font-mono text-xs">{p.reservacionFolio}</span> },
    { key: "espacioNombre", header: "Espacio", render: (p) => <span className="text-sm">{p.espacioNombre}</span> },
    { key: "solicitanteNombre", header: "Solicitante", render: (p) => <span className="max-w-[140px] truncate block">{p.solicitanteNombre}</span> },
    { key: "monto", header: "Total", render: (p) => <span className="font-medium">${p.monto.toLocaleString("es-MX")}</span> },
    { key: "referencia", header: "Anticipo", render: () => <span className="text-muted-foreground">—</span> },
    { key: "fechaPago", header: "Saldo", render: () => <span className="text-muted-foreground">—</span> },
    { key: "metodo", header: "Método", render: (p) => <span className="text-xs">{metodoPagoLabel[p.metodo] ?? p.metodo}</span> },
    { key: "fechaPago", header: "Fecha", render: (p) => p.fechaPago ? <span className="text-xs">{p.fechaPago}</span> : <span className="text-muted-foreground text-xs">Sin pago</span> },
    { key: "estado", header: "Estado", render: (p) => <StatusBadge estado={p.estado} /> },
    { key: "id", header: "Acciones", render: (p) => (
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/pagos/${p.id}`)}>
        <Eye className="h-3.5 w-3.5" />
      </Button>
    )},
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Pagos"
        description="Gestión y seguimiento de pagos asociados a reservaciones"
        actions={
          <Button size="sm" className="gap-2" onClick={() => navigate("/pagos/nuevo")}>
            <Plus className="h-4 w-4" /> Registrar pago
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Ingresos cobrados" value={`$${totalIngresos.toLocaleString("es-MX")}`} icon={DollarSign} trend={{ value: 12, positive: true }} />
        <StatCard title="Pagos pendientes" value={countPendientes} icon={Clock} trend={{ value: countPendientes, positive: false }} />
        <StatCard title="Saldo por cobrar" value={`$${totalPendiente.toLocaleString("es-MX")}`} icon={XCircle} />
        <StatCard title="Reembolsos" value={countReembolsados} icon={RotateCcw} />
      </div>

      <FilterBar
        searchPlaceholder="Buscar por folio o ID de reservación..."
        onSearch={setSearch}
        filters={[
          { label: "Estado", options: estadosPagoFiltro, value: filtroEstado, onChange: setFiltroEstado },
          { label: "Espacio", options: espaciosPagoFiltro, value: "todos", onChange: () => {} },
          { label: "Método", options: metodosPagoFiltro, value: filtroMetodo, onChange: setFiltroMetodo },
        ]}
      />

      <DataTable
        columns={columns as any}
        data={isLoading ? [] : (filtered as any)}
        emptyMessage={isLoading ? "Cargando pagos..." : "No se encontraron pagos con los filtros aplicados."}
      />
    </AppLayout>
  );
}
