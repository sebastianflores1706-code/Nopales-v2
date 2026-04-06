import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MapPin, Users, Calendar, Clock, FileText, DollarSign, Eye, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { UserLayout } from "@/components/layout/UserLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getReservacionById, getDocumentosByReservacion, getImagenUrl, ApiError, type DocumentoAPI } from "@/lib/api";
import { getEstadoVisual } from "@/lib/reservacion-utils";

export default function UserReservacionDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const backTo = (location.state as { from?: string } | null)?.from ?? "/portal/reservaciones";
  const [vistaContrato, setVistaContrato] = useState<DocumentoAPI | null>(null);

  const { data: reservacion, isLoading, error } = useQuery({
    queryKey: ["reservacion", id],
    queryFn: () => getReservacionById(id!),
    enabled: !!id,
  });

  const { data: documentos = [] } = useQuery({
    queryKey: ["documentos", id],
    queryFn: () => getDocumentosByReservacion(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <UserLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-48 w-full" />
        </div>
      </UserLayout>
    );
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <UserLayout>
        <EmptyState
          title="Reservación no encontrada"
          description="La reservación solicitada no existe o no tienes acceso a ella."
          actionLabel="Volver"
          onAction={() => navigate(backTo)}
        />
      </UserLayout>
    );
  }

  if (error || !reservacion) {
    return (
      <UserLayout>
        <EmptyState
          title="Error al cargar"
          description="No se pudo obtener la información de la reservación."
          actionLabel="Volver"
          onAction={() => navigate(backTo)}
        />
      </UserLayout>
    );
  }

  const infoItems = [
    { icon: MapPin,   label: "Espacio",       value: reservacion.espacioNombre },
    { icon: Calendar, label: "Fecha",          value: reservacion.fecha },
    { icon: Clock,    label: "Horario",        value: `${reservacion.horaInicio} – ${reservacion.horaFin}` },
    { icon: Users,    label: "Asistentes",     value: `${reservacion.asistentes} personas` },
    { icon: FileText, label: "Tipo de evento", value: reservacion.tipoEvento },
    { icon: DollarSign, label: "Monto total",  value: `$${reservacion.montoTotal.toLocaleString()}` },
  ];

  return (
    <UserLayout>
      <PageHeader
        title={`Reservación ${reservacion.folio}`}
        description={reservacion.tipoEvento}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigate(backTo)}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Información de la reservación</CardTitle>
              <StatusBadge estado={getEstadoVisual(reservacion)} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {infoItems.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            {reservacion.descripcionEvento && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Descripción del evento</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{reservacion.descripcionEvento}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 self-start">
          {reservacion.espacioImagenUrl && (
            <Card className="shadow-sm overflow-hidden">
              <div className="h-48">
                <img
                  src={getImagenUrl(reservacion.espacioImagenUrl)}
                  alt={reservacion.espacioNombre}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
          )}
          <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Estado del pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pago</span>
              <StatusBadge estado={reservacion.pagoEstado} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total pagado</span>
              <span className="text-sm font-medium">${reservacion.totalPagado.toLocaleString()}</span>
            </div>
            {reservacion.saldoPendiente > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Saldo pendiente</span>
                <span className="text-sm font-medium text-destructive">
                  ${reservacion.saldoPendiente.toLocaleString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Reembolso (solo si cancelada y aplica) */}
      {reservacion.estado === "cancelada" && reservacion.reembolsoEstado && reservacion.reembolsoEstado !== "no_aplica" && (
        <Card className="shadow-sm mt-6 border-warning/30">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/10">
                <AlertCircle className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {reservacion.reembolsoEstado === "pendiente"
                    ? "Reembolso pendiente"
                    : "Reembolso procesado"}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {reservacion.reembolsoEstado === "pendiente"
                    ? `Se procesará un reembolso de $${reservacion.reembolsoMonto.toLocaleString()} por los pagos realizados. El equipo administrativo se comunicará contigo.`
                    : `El reembolso de $${reservacion.reembolsoMonto.toLocaleString()} ha sido procesado.`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentos / Contratos */}
      {documentos.length > 0 && (
        <Card className="shadow-sm mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {documentos.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{doc.nombreArchivo}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.createdAt).toLocaleDateString("es-MX")}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1.5"
                  onClick={() => setVistaContrato(doc)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Ver
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Modal visor de contrato */}
      <Dialog open={!!vistaContrato} onOpenChange={() => setVistaContrato(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{vistaContrato?.nombreArchivo}</DialogTitle>
          </DialogHeader>
          {vistaContrato && (
            <iframe
              srcDoc={vistaContrato.contenido}
              className="w-full h-[65vh] border rounded"
              title="Vista previa del contrato"
              sandbox="allow-same-origin"
            />
          )}
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
}
