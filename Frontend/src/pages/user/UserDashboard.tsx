import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck, MapPin, Plus, CreditCard, FileText,
  Clock, AlertCircle, CheckCircle2, XCircle, ArrowRight,
  DollarSign, AlertTriangle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { UserLayout } from "@/components/layout/UserLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { getMisReservaciones, type ReservacionAPI } from "@/lib/api";

function formatFecha(fecha: string) {
  try {
    return format(parseISO(fecha), "d 'de' MMMM, yyyy", { locale: es });
  } catch {
    return fecha;
  }
}

function formatMonto(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

const ESTADOS_ACTIVOS = new Set(["pendiente_revision", "aprobada"]);

type IconConfig = { bg: string; color: string; icon: React.ElementType };

function iconPorEstado(estado: string): IconConfig {
  switch (estado) {
    case "pendiente_revision":
      return { bg: "bg-yellow-100", color: "text-yellow-600", icon: Clock };
    case "aprobada":
      return { bg: "bg-blue-100",   color: "text-blue-600",   icon: CheckCircle2 };
    case "finalizada":
      return { bg: "bg-green-100",  color: "text-green-600",  icon: CalendarCheck };
    case "cancelada":
    case "rechazada":
      return { bg: "bg-red-100",    color: "text-red-600",    icon: XCircle };
    default:
      return { bg: "bg-gray-100",   color: "text-gray-600",   icon: CalendarCheck };
  }
}

const CHART_COLORS = {
  pendientes: "#eab308",
  aprobadas:  "#22c55e",
  canceladas: "#ef4444",
  finalizadas: "#94a3b8",
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const { data: reservaciones = [], isLoading } = useQuery({
    queryKey: ["mis-reservaciones"],
    queryFn: getMisReservaciones,
  });

  // ── Conteos de estado ────────────────────────────────────────────
  const stats = useMemo(() => {
    const total      = reservaciones.length;
    const pendientes = reservaciones.filter((r) => r.estado === "pendiente_revision").length;
    const aprobadas  = reservaciones.filter((r) => r.estado === "aprobada").length;
    const canceladas = reservaciones.filter((r) => r.estado === "cancelada" || r.estado === "rechazada").length;
    const finalizadas = reservaciones.filter((r) => r.estado === "finalizada").length;
    return { total, pendientes, aprobadas, canceladas, finalizadas };
  }, [reservaciones]);

  // ── Datos para la gráfica ────────────────────────────────────────
  const chartData = useMemo(() => [
    { name: "Pendientes",  value: stats.pendientes,  color: CHART_COLORS.pendientes },
    { name: "Aprobadas",   value: stats.aprobadas,   color: CHART_COLORS.aprobadas },
    { name: "Canceladas",  value: stats.canceladas,  color: CHART_COLORS.canceladas },
    { name: "Finalizadas", value: stats.finalizadas, color: CHART_COLORS.finalizadas },
  ].filter((d) => d.value > 0), [stats]);

  // ── Resumen financiero ───────────────────────────────────────────
  const finanzas = useMemo(() => {
    const totalAbonado   = reservaciones.reduce((s, r) => s + (r.totalPagado ?? 0), 0);
    const saldoPendiente = reservaciones.reduce((s, r) => s + (r.saldoPendiente ?? 0), 0);
    const pagadas        = reservaciones.filter((r) => r.pagoEstado === "pagado").length;
    return { totalAbonado, saldoPendiente, pagadas };
  }, [reservaciones]);

  // ── Próxima reservación ──────────────────────────────────────────
  const proximaReservacion = useMemo<ReservacionAPI | null>(() => {
    const hoy = format(new Date(), "yyyy-MM-dd");
    const activas = reservaciones.filter(
      (r) => ESTADOS_ACTIVOS.has(r.estado) && r.fecha >= hoy
    );
    if (activas.length === 0) return null;
    return activas.sort((a, b) => {
      const da = `${a.fecha}T${a.horaInicio}`;
      const db = `${b.fecha}T${b.horaInicio}`;
      return da < db ? -1 : 1;
    })[0];
  }, [reservaciones]);

  // ── Reservaciones recientes (últimas 5) ──────────────────────────
  const recientes = useMemo(() => {
    return [...reservaciones]
      .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
      .slice(0, 5);
  }, [reservaciones]);

  if (isLoading) {
    return (
      <UserLayout>
        <PageHeader title="Mi Panel" description="Bienvenido al portal ciudadano de Nopales" />
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <PageHeader
        title={`Bienvenido${usuario?.nombre ? `, ${usuario.nombre.split(" ")[0]}` : ""}`}
        description="Resumen de tu actividad en el portal ciudadano"
      />

      {/* ── Conteos de estado ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total" value={stats.total} icon={CalendarCheck} />
        <StatCard title="Pendientes" value={stats.pendientes} icon={AlertCircle} variant="warning" />
        <StatCard title="Aprobadas" value={stats.aprobadas} icon={CheckCircle2} variant="success" />
        <StatCard title="Canceladas" value={stats.canceladas} icon={XCircle} variant="destructive" />
      </div>

      {/* ── Estado financiero → 3 mini StatCards ─────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total abonado"
          value={formatMonto(finanzas.totalAbonado)}
          icon={DollarSign}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          title="Saldo pendiente"
          value={formatMonto(finanzas.saldoPendiente)}
          icon={AlertTriangle}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <StatCard
          title="Reservaciones pagadas"
          value={finanzas.pagadas}
          icon={CheckCircle2}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
      </div>

      {/* ── Gráfica + Próxima reservación ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        {/* Donut chart de estados */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Distribución de reservaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.total === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <CalendarCheck className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Sin reservaciones aún</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [value, name]}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Próxima reservación */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Próxima reservación
            </CardTitle>
          </CardHeader>
          <CardContent>
            {proximaReservacion ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="font-semibold text-sm">{proximaReservacion.espacioNombre}</p>
                  <p className="text-xs text-muted-foreground">{proximaReservacion.tipoEvento}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {proximaReservacion.espacioNombre}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarCheck className="h-3 w-3" />
                    {formatFecha(proximaReservacion.fecha)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {proximaReservacion.horaInicio} – {proximaReservacion.horaFin}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <StatusBadge estado={proximaReservacion.estado} />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1 h-7"
                    onClick={() => navigate(`/portal/reservaciones/${proximaReservacion.id}`, { state: { from: "/portal" } })}
                  >
                    Ver detalle <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center gap-2">
                <CalendarCheck className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No tienes reservaciones próximas</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 mt-1"
                  onClick={() => navigate("/portal/reservaciones/nueva")}
                >
                  <Plus className="h-3.5 w-3.5" /> Nueva reservación
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Acciones rápidas ──────────────────────────────────────── */}
      <Card className="shadow-sm mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Acciones rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => navigate("/portal/reservaciones/nueva")}
            className="flex items-center gap-3 rounded-lg border px-4 py-3 text-left hover:bg-accent transition-colors"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-green-100">
              <Plus className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Nueva reservación</p>
              <p className="text-xs text-muted-foreground">Solicitar uso de un espacio</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
          </button>

          <button
            onClick={() => navigate("/portal/pagos")}
            className="flex items-center gap-3 rounded-lg border px-4 py-3 text-left hover:bg-accent transition-colors"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-100">
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Mis pagos</p>
              <p className="text-xs text-muted-foreground">Ver historial de pagos</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
          </button>

          <button
            onClick={() => navigate("/portal/contratos")}
            className="flex items-center gap-3 rounded-lg border px-4 py-3 text-left hover:bg-accent transition-colors"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-purple-100">
              <FileText className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Mis contratos</p>
              <p className="text-xs text-muted-foreground">Documentos y contratos</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
          </button>
        </CardContent>
      </Card>

      {/* ── Reservaciones recientes ───────────────────────────────── */}
      {recientes.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Reservaciones recientes
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1 h-7"
              onClick={() => navigate("/portal/reservaciones")}
            >
              Ver todas <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recientes.map((r) => {
                const cfg = iconPorEstado(r.estado);
                const IconEstado = cfg.icon;
                return (
                  <button
                    key={r.id}
                    onClick={() => navigate(`/portal/reservaciones/${r.id}`, { state: { from: "/portal" } })}
                    className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-accent/50 transition-colors"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${cfg.bg}`}>
                      <IconEstado className={`h-3.5 w-3.5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.espacioNombre}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.folio} · {formatFecha(r.fecha)} · {r.horaInicio}–{r.horaFin}
                      </p>
                    </div>
                    <StatusBadge estado={r.estado} />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {reservaciones.length === 0 && (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <CalendarCheck className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm font-medium">Aún no tienes reservaciones</p>
            <p className="text-xs text-muted-foreground">
              Explora los espacios disponibles y realiza tu primera solicitud.
            </p>
            <div className="flex gap-2 mt-1">
              <Button variant="outline" size="sm" onClick={() => navigate("/portal/espacios")}>
                <MapPin className="h-3.5 w-3.5 mr-1.5" /> Explorar espacios
              </Button>
              <Button size="sm" onClick={() => navigate("/portal/reservaciones/nueva")}>
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Nueva reservación
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </UserLayout>
  );
}
