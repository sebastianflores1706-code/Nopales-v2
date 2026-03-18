import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getReservaciones } from "@/lib/api";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays, LayoutGrid, Clock, MapPin, Users, FileText, CreditCard, Wrench } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  estadoCalendarioConfig,
  estadosFiltroCalendario,
  type EventoCalendario,
  type EstadoCalendario,
} from "@/data/calendarioMock";

type ViewMode = "month" | "week";

export default function CalendarioView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [filtroEspacio, setFiltroEspacio] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [selectedEvento, setSelectedEvento] = useState<EventoCalendario | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const routerNavigate = useNavigate();

  const { data: reservaciones = [], isLoading, isError } = useQuery({
    queryKey: ["reservaciones"],
    queryFn: getReservaciones,
  });

  const eventosCalendario = useMemo<EventoCalendario[]>(() => {
    const estadoMap: Record<string, EstadoCalendario> = {
      pendiente_revision: "pendiente_revision",
      aprobada: "aprobada",
      cancelada: "cancelada",
      rechazada: "cancelada",
      en_uso: "en_uso",
      finalizada: "finalizada",
    };
    const pagoMap: Record<string, "pendiente" | "completado" | "cancelado"> = {
      pendiente: "pendiente",
      pagado: "completado",
      cancelado: "cancelado",
    };
    return reservaciones.map((r) => ({
      id: r.id,
      folio: r.folio,
      espacio: r.espacioNombre,
      espacioId: r.espacioId,
      nombreEvento: r.tipoEvento,
      organizador: r.solicitanteNombre,
      tipoEvento: r.tipoEvento,
      fecha: r.fecha,
      horaInicio: r.horaInicio,
      horaFin: r.horaFin,
      asistentes: r.asistentes,
      estado: estadoMap[r.estado] ?? "cancelada",
      pago: pagoMap[r.pagoEstado] ?? "pendiente",
      montoPago: 0,
      descripcion: "",
      documentos: [],
    }));
  }, [reservaciones]);

  const espaciosFiltroCalendario = useMemo(() => {
    const seen = new Map<string, string>();
    for (const r of reservaciones) {
      if (!seen.has(r.espacioId)) seen.set(r.espacioId, r.espacioNombre);
    }
    return [
      { label: "Todos los espacios", value: "todos" },
      ...Array.from(seen.entries()).map(([id, nombre]) => ({ label: nombre, value: id })),
    ];
  }, [reservaciones]);

  const filteredEvents = useMemo(() => {
    return eventosCalendario.filter((e) => {
      if (filtroEspacio !== "todos" && e.espacioId !== filtroEspacio) return false;
      if (filtroEstado !== "todos" && e.estado !== filtroEstado) return false;
      return true;
    });
  }, [eventosCalendario, filtroEspacio, filtroEstado]);

  const handleSelectEvento = (evento: EventoCalendario) => {
    setSelectedEvento(evento);
    setSheetOpen(true);
  };

  // Calendar grid generation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    if (viewMode === "month") {
      let day = calStart;
      while (day <= calEnd) {
        days.push(day);
        day = addDays(day, 1);
      }
    } else {
      for (let i = 0; i < 7; i++) {
        days.push(addDays(weekStart, i));
      }
    }
    return days;
  }, [currentDate, viewMode]);

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return filteredEvents.filter((e) => e.fecha === dateStr);
  };

  const navigate = (dir: number) => {
    if (viewMode === "month") {
      setCurrentDate(dir > 0 ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, dir * 7));
    }
  };

  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  // Stats
  const pendientes = eventosCalendario.filter((e) => e.estado === "pendiente_revision").length;
  const aprobadas = eventosCalendario.filter((e) => e.estado === "aprobada").length;

  return (
    <AppLayout>
      <PageHeader
        title="Calendario de Reservaciones"
        description="Visualiza la disponibilidad y ocupación de los espacios públicos"
      />

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium bg-warning/10 border-warning/20 text-warning">
          <span className="h-2 w-2 rounded-full bg-warning" /> {pendientes} pendientes
        </div>
        <div className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium bg-info/10 border-info/20 text-info">
          <span className="h-2 w-2 rounded-full bg-info" /> {aprobadas} aprobadas
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold capitalize min-w-[180px] text-center">
            {viewMode === "month"
              ? format(currentDate, "MMMM yyyy", { locale: es })
              : `${format(weekStart, "d MMM", { locale: es })} – ${format(addDays(weekStart, 6), "d MMM yyyy", { locale: es })}`}
          </h2>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-xs ml-1" onClick={() => setCurrentDate(new Date())}>
            Hoy
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={filtroEspacio} onValueChange={setFiltroEspacio}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {espaciosFiltroCalendario.map((e) => (
                <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {estadosFiltroCalendario.map((e) => (
                <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={viewMode === "month" ? "default" : "ghost"}
              size="sm"
              className="h-8 rounded-none text-xs gap-1.5"
              onClick={() => setViewMode("month")}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Mes
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "ghost"}
              size="sm"
              className="h-8 rounded-none text-xs gap-1.5"
              onClick={() => setViewMode("week")}
            >
              <CalendarDays className="h-3.5 w-3.5" /> Semana
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="border rounded-lg bg-card overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {dayNames.map((d) => (
            <div key={d} className="px-2 py-2 text-xs font-medium text-muted-foreground text-center">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className={`grid grid-cols-7 ${viewMode === "week" ? "min-h-[400px]" : ""}`}>
          {isLoading ? (
            <div className="col-span-7 flex items-center justify-center py-16 text-sm text-muted-foreground">
              Cargando reservaciones...
            </div>
          ) : isError ? (
            <div className="col-span-7 flex items-center justify-center py-16 text-sm text-destructive">
              No se pudo cargar el calendario. Verifica la conexión al servidor.
            </div>
          ) : calendarDays.map((day, idx) => {
            const events = getEventsForDay(day);
            const inMonth = isSameMonth(day, currentDate);
            const today = isToday(day);

            return (
              <div
                key={idx}
                className={`border-b border-r ${viewMode === "week" ? "min-h-[400px]" : "min-h-[100px]"} p-1 ${
                  !inMonth && viewMode === "month" ? "bg-muted/30" : ""
                } ${today ? "bg-primary/5" : ""}`}
              >
                <div className={`text-xs font-medium mb-1 px-1 ${
                  today
                    ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mx-auto"
                    : !inMonth && viewMode === "month"
                    ? "text-muted-foreground/50"
                    : "text-foreground"
                }`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {events.slice(0, viewMode === "week" ? 10 : 3).map((evento) => {
                    const cfg = estadoCalendarioConfig[evento.estado];
                    return (
                      <button
                        key={evento.id}
                        onClick={() => handleSelectEvento(evento)}
                        className={`w-full text-left rounded px-1.5 py-0.5 text-[10px] leading-tight border cursor-pointer hover:opacity-80 transition-opacity truncate ${cfg.bgClass}`}
                      >
                        <span className="flex items-center gap-1">
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dotClass}`} />
                          {evento.estado === "mantenimiento" && <Wrench className="h-2.5 w-2.5 shrink-0 text-destructive" />}
                          <span className={`truncate font-medium ${cfg.textClass}`}>
                            {evento.nombreEvento}
                          </span>
                        </span>
                        {viewMode === "week" && (
                          <span className="block text-muted-foreground mt-0.5">
                            {evento.horaInicio}–{evento.horaFin} · {evento.espacio}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {events.length > (viewMode === "week" ? 10 : 3) && (
                    <span className="text-[10px] text-muted-foreground px-1">
                      +{events.length - (viewMode === "week" ? 10 : 3)} más
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        {Object.entries(estadoCalendarioConfig)
          .filter(([key]) => key !== "mantenimiento")
          .map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className={`h-2.5 w-2.5 rounded-full ${cfg.dotClass}`} />
              {cfg.label}
            </div>
          ))}
      </div>

      {/* Detail sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedEvento && (
            <>
              <SheetHeader>
                <SheetTitle className="text-base">{selectedEvento.nombreEvento}</SheetTitle>
                <SheetDescription>{selectedEvento.folio}</SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                {/* Estado */}
                <div>
                  <EstadoBadgeCal estado={selectedEvento.estado} />
                </div>

                <Separator />

                {/* Info */}
                <div className="grid gap-3 text-sm">
                  <InfoRow icon={MapPin} label="Espacio" value={selectedEvento.espacio} />
                  <InfoRow icon={Users} label="Organizador" value={selectedEvento.organizador} />
                  <InfoRow icon={CalendarDays} label="Fecha" value={format(new Date(selectedEvento.fecha + "T00:00:00"), "d 'de' MMMM, yyyy", { locale: es })} />
                  <InfoRow icon={Clock} label="Horario" value={`${selectedEvento.horaInicio} – ${selectedEvento.horaFin}`} />
                  <InfoRow icon={Users} label="Asistentes" value={`${selectedEvento.asistentes} personas`} />
                  <InfoRow icon={LayoutGrid} label="Tipo de evento" value={selectedEvento.tipoEvento} />
                </div>

                <Separator />

                {/* Descripción */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Descripción</p>
                  <p className="text-sm">{selectedEvento.descripcion}</p>
                </div>

                <Separator />

                {/* Pago */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" /> Pago asociado
                  </p>
                  <div className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2">
                    <span className="text-sm font-medium">
                      {selectedEvento.montoPago > 0 ? `$${selectedEvento.montoPago.toLocaleString("es-MX")}` : "Sin costo"}
                    </span>
                    <Badge variant={selectedEvento.pago === "completado" ? "default" : selectedEvento.pago === "cancelado" ? "destructive" : "secondary"}>
                      {selectedEvento.pago === "completado" ? "Pagado" : selectedEvento.pago === "cancelado" ? "Cancelado" : "Pendiente"}
                    </Badge>
                  </div>
                </div>

                {/* Documentos */}
                {selectedEvento.documentos.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" /> Documentos
                      </p>
                      <div className="space-y-1.5">
                        {selectedEvento.documentos.map((doc, i) => (
                          <div key={i} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2 text-sm">
                            <span>{doc.nombre}</span>
                            <span className="text-xs text-muted-foreground">{doc.tipo}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Actions */}
                {selectedEvento.estado !== "mantenimiento" && (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => routerNavigate(`/reservaciones/${selectedEvento.id}`)}>
                      Ver detalle completo
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}

function EstadoBadgeCal({ estado }: { estado: EstadoCalendario }) {
  const cfg = estadoCalendarioConfig[estado];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.bgClass} ${cfg.textClass}`}>
      <span className={`h-2 w-2 rounded-full ${cfg.dotClass}`} />
      {cfg.label}
    </span>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
