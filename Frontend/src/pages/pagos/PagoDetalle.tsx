import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, CalendarDays, Users, CreditCard,
  Clock, DollarSign, XCircle, CheckCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getPagoById, updatePagoEstado, ApiError } from "@/lib/api";

const metodoPagoLabel: Record<string, string> = {
  transferencia: "Transferencia bancaria",
  efectivo: "Efectivo",
  tarjeta: "Tarjeta de crédito/débito",
  cheque: "Cheque",
};

function formatCurrency(value: number) {
  return value.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

function InfoField({ label, value, highlight, className }: {
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className={`font-medium ${highlight ? "text-lg" : ""} ${className ?? ""}`}>{value}</p>
    </div>
  );
}

export default function PagoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: pago, isLoading, error } = useQuery({
    queryKey: ["pago", id],
    queryFn: () => getPagoById(id!),
    enabled: !!id,
  });

  const cambiarEstadoMutation = useMutation({
    mutationFn: (estado: string) => updatePagoEstado(id!, estado),
    onSuccess: (_, estado) => {
      queryClient.invalidateQueries({ queryKey: ["pago", id] });
      queryClient.invalidateQueries({ queryKey: ["pagos"] });
      const labels: Record<string, string> = {
        pagado:    "marcado como pagado",
        cancelado: "cancelado",
      };
      toast.success(`Pago ${labels[estado] ?? estado} correctamente`);
    },
    onError: (err) => {
      const mensaje = err instanceof ApiError
        ? (err.data as { error?: string })?.error ?? `Error ${err.status}`
        : "No se pudo actualizar el estado";
      toast.error(mensaje);
    },
  });

  if (isLoading) {
    return (
      <AppLayout>
        <EmptyState title="Cargando pago..." description="Por favor espera." />
      </AppLayout>
    );
  }

  if (error || !pago) {
    return (
      <AppLayout>
        <EmptyState title="Pago no encontrado" description="El pago solicitado no existe o fue eliminado." />
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate("/pagos")}>Volver a pagos</Button>
        </div>
      </AppLayout>
    );
  }

  const isPending = pago.estado === "pendiente";

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/pagos")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight font-mono">
              {pago.id.slice(0, 8)}…
            </h1>
            <StatusBadge estado={pago.estado} />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Reservación {pago.reservacionFolio}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isPending && (
            <>
              <Button
                size="sm"
                className="gap-1.5 text-xs"
                disabled={cambiarEstadoMutation.isPending}
                onClick={() => cambiarEstadoMutation.mutate("pagado")}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Marcar como pagado
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="gap-1.5 text-xs"
                disabled={cambiarEstadoMutation.isPending}
                onClick={() => cambiarEstadoMutation.mutate("cancelado")}
              >
                <XCircle className="h-3.5 w-3.5" />
                Cancelar pago
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Información del pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <InfoField
                  label="Monto de este pago"
                  value={formatCurrency(pago.monto)}
                  highlight
                />
                <InfoField
                  label="Método de pago"
                  value={metodoPagoLabel[pago.metodo] ?? pago.metodo}
                />
                <InfoField
                  label="Referencia"
                  value={pago.referencia || "Sin referencia"}
                />
                <InfoField
                  label="Fecha de pago"
                  value={pago.fechaPago || "Sin fecha registrada"}
                />
                <InfoField
                  label="Folio reservación"
                  value={pago.reservacionFolio}
                />
                <InfoField
                  label="Estado"
                  value={pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1)}
                  className={
                    pago.estado === "pagado"
                      ? "text-green-600"
                      : pago.estado === "cancelado"
                      ? "text-destructive"
                      : "text-yellow-600"
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Resumen financiero */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resumen financiero</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Total reservación</p>
                  <p className="text-base font-semibold">{formatCurrency(pago.montoTotal)}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Total abonado</p>
                  <p className="text-base font-semibold text-green-600">{formatCurrency(pago.totalPagado)}</p>
                </div>
                <div className={`rounded-lg p-3 ${pago.saldoPendiente > 0 ? "bg-destructive/10" : "bg-green-50 dark:bg-green-950/30"}`}>
                  <p className="text-xs text-muted-foreground mb-1">Saldo pendiente</p>
                  <p className={`text-base font-semibold ${pago.saldoPendiente > 0 ? "text-destructive" : "text-green-600"}`}>
                    {formatCurrency(pago.saldoPendiente)}
                  </p>
                </div>
              </div>
              {pago.saldoPendiente === 0 && (
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t">
                  <DollarSign className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">Reservación completamente pagada</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Reservación asociada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Espacio</p>
                  <p className="font-medium">{pago.espacioNombre}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Solicitante</p>
                  <p className="font-medium">{pago.solicitanteNombre}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Fecha del evento</p>
                  <p className="font-medium">{pago.fechaEvento}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Horario</p>
                  <p className="font-medium">{pago.horaInicio} – {pago.horaFin}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Tipo de evento</p>
                  <p className="font-medium">{pago.tipoEvento}</p>
                </div>
              </div>
              <Separator />
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate(`/reservaciones/${pago.reservacionId}`)}
              >
                Ver reservación
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
