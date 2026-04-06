import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, CheckCircle, XCircle, Ban, FileText, DollarSign,
  MapPin, Users, Calendar, Clock, User,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getReservacionById, updateReservacionEstado, marcarReembolsoProcesado, createPago, generarContrato, getDocumentosByReservacion, ApiError, type DocumentoAPI } from "@/lib/api";
import { getEstadoVisual } from "@/lib/reservacion-utils";

const ReservacionDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const backTo = (location.state as { from?: string } | null)?.from ?? "/reservaciones";
  const queryClient = useQueryClient();

  const [dialogPagoOpen, setDialogPagoOpen] = useState(false);
  const [docViewer, setDocViewer] = useState<DocumentoAPI | null>(null);
  const [pagoMonto, setPagoMonto] = useState("");
  const [pagoMetodo, setPagoMetodo] = useState<"efectivo" | "transferencia" | "tarjeta">("efectivo");

  const { data: reservacion, isLoading, error } = useQuery({
    queryKey: ["reservacion", id],
    queryFn: () => getReservacionById(id!),
    enabled: !!id,
  });

  const { data: documentos = [], isLoading: isLoadingDocs } = useQuery({
    queryKey: ["documentos", id],
    queryFn: () => getDocumentosByReservacion(id!),
    enabled: !!id,
  });

  const cambiarEstadoMutation = useMutation({
    mutationFn: (estado: string) => updateReservacionEstado(id!, estado),
    onSuccess: (_, estado) => {
      queryClient.invalidateQueries({ queryKey: ["reservacion", id] });
      queryClient.invalidateQueries({ queryKey: ["reservaciones"] });
      const labels: Record<string, string> = {
        aprobada:   "aprobada",
        rechazada:  "rechazada",
        cancelada:  "cancelada",
        finalizada: "finalizada",
      };
      toast.success(`Solicitud ${labels[estado] ?? estado} correctamente`);
    },
    onError: (err) => {
      const mensaje = err instanceof ApiError
        ? (err.data as any)?.error ?? `Error ${err.status}`
        : "No se pudo actualizar el estado";
      toast.error(mensaje);
    },
  });

  const reembolsoMutation = useMutation({
    mutationFn: () => marcarReembolsoProcesado(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservacion", id] });
      toast.success("Reembolso marcado como procesado");
    },
    onError: (err) => {
      const mensaje = err instanceof ApiError
        ? (err.data as any)?.error ?? `Error ${err.status}`
        : "No se pudo actualizar el reembolso";
      toast.error(mensaje);
    },
  });

  const generarContratoMutation = useMutation({
    mutationFn: () => generarContrato(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos", id] });
      toast.success("Contrato generado correctamente");
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) {
        queryClient.invalidateQueries({ queryKey: ["documentos", id] });
        toast.info("Ya existe un contrato generado para esta reservación");
      } else {
        const mensaje = err instanceof ApiError
          ? (err.data as any)?.error ?? `Error ${err.status}`
          : "No se pudo generar el contrato";
        toast.error(mensaje);
      }
    },
  });

  const registrarPagoMutation = useMutation({
    mutationFn: () => createPago({
      reservacionId: id!,
      monto: Number(pagoMonto),
      metodo: pagoMetodo,
      estado: "pagado",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pagos"] });
      queryClient.invalidateQueries({ queryKey: ["reservacion", id] });
      queryClient.invalidateQueries({ queryKey: ["reservaciones"] });
      toast.success("Pago registrado correctamente");
      setDialogPagoOpen(false);
      setPagoMonto("");
      setPagoMetodo("efectivo");
    },
    onError: (err) => {
      const mensaje = err instanceof ApiError
        ? (err.data as any)?.error ?? `Error ${err.status}`
        : "No se pudo registrar el pago";
      toast.error(mensaje);
    },
  });

  function abrirDialogPago() {
    // Pre-llenar con el saldo pendiente real
    if (reservacion && reservacion.saldoPendiente > 0) {
      setPagoMonto(String(reservacion.saldoPendiente));
    }
    setDialogPagoOpen(true);
  }

  if (isLoading) {
    return (
      <AppLayout>
        <EmptyState title="Cargando reservación..." description="Por favor espera." />
      </AppLayout>
    );
  }

  if (error || !reservacion) {
    return (
      <AppLayout>
        <EmptyState title="Reservación no encontrada" description="La reservación solicitada no existe." />
      </AppLayout>
    );
  }

  const infoItems = [
    { icon: MapPin, label: "Espacio", value: reservacion.espacioNombre },
    { icon: User, label: "Organizador", value: reservacion.solicitanteNombre },
    { icon: Calendar, label: "Fecha", value: reservacion.fecha },
    { icon: Clock, label: "Horario", value: `${reservacion.horaInicio} – ${reservacion.horaFin}` },
    { icon: Users, label: "Asistentes", value: `${reservacion.asistentes} personas` },
    { icon: FileText, label: "Tipo de evento", value: reservacion.tipoEvento },
  ];

  const isPending = reservacion.estado === "pendiente_revision";

  return (
    <AppLayout>
      <PageHeader
        title={`Reservación ${reservacion.folio}`}
        description={reservacion.tipoEvento}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(backTo)}>
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Info del evento */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Información del evento</CardTitle>
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
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">Descripción del evento</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {reservacion.descripcionEvento ?? "Sin descripción registrada."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pago y acciones */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Pago asociado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado</span>
                <StatusBadge estado={reservacion.pagoEstado} />
              </div>
              {reservacion.montoTotal > 0 && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total reservación</span>
                    <span className="font-medium text-foreground">
                      ${reservacion.montoTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total abonado</span>
                    <span className="font-medium text-green-600">
                      ${reservacion.totalPagado.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {reservacion.saldoPendiente > 0 && (
                    <div className="flex justify-between border-t pt-1.5 mt-1 text-muted-foreground">
                      <span>Saldo pendiente</span>
                      <span className="font-semibold text-destructive">
                        ${reservacion.saldoPendiente.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {reservacion.pagoEstado !== "pagado" &&
                reservacion.estado !== "rechazada" &&
                reservacion.estado !== "cancelada" && (
                <>
                  <Separator />
                  <Button size="sm" className="w-full gap-2" onClick={abrirDialogPago}>
                    <DollarSign className="h-4 w-4" />
                    {reservacion.pagoEstado === "anticipo" ? "Registrar abono" : "Registrar pago"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {reservacion.estado === "cancelada" && reservacion.reembolsoEstado && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Reembolso</CardTitle>
                  <StatusBadge estado={
                    reservacion.reembolsoEstado === "pendiente" ? "reembolso_pendiente"
                    : reservacion.reembolsoEstado === "procesado" ? "reembolso_procesado"
                    : "no_aplica"
                  } />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {reservacion.reembolsoEstado === "no_aplica" ? (
                  <p className="text-sm text-muted-foreground">No se realizaron pagos. Sin reembolso aplicable.</p>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Monto a reembolsar</span>
                      <span className="font-semibold">${reservacion.reembolsoMonto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                    </div>
                    {reservacion.reembolsoEstado === "pendiente" && (
                      <>
                        <Separator />
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full gap-2"
                          disabled={reembolsoMutation.isPending}
                          onClick={() => reembolsoMutation.mutate()}
                        >
                          Marcar reembolso como procesado
                        </Button>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Acciones administrativas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isPending && (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    className="w-full gap-2"
                    disabled={cambiarEstadoMutation.isPending}
                    onClick={() => cambiarEstadoMutation.mutate("aprobada")}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Aprobar solicitud
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="w-full gap-2"
                    disabled={cambiarEstadoMutation.isPending}
                    onClick={() => cambiarEstadoMutation.mutate("rechazada")}
                  >
                    <XCircle className="h-4 w-4" />
                    Rechazar solicitud
                  </Button>
                </>
              )}
              {reservacion.estado === "aprobada" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-2 text-destructive hover:text-destructive"
                  disabled={cambiarEstadoMutation.isPending}
                  onClick={() => cambiarEstadoMutation.mutate("cancelada")}
                >
                  <Ban className="h-4 w-4" />
                  Cancelar reservación
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-2"
                disabled={generarContratoMutation.isPending || reservacion.saldoPendiente > 0}
                onClick={() => generarContratoMutation.mutate()}
              >
                <FileText className="h-4 w-4" />
                Generar contrato
              </Button>
              {reservacion.saldoPendiente > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Requiere pago completo para generar contrato
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Documentos */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Documentos</h2>
        {isLoadingDocs ? (
          <EmptyState title="Cargando documentos..." description="Por favor espera." />
        ) : documentos.length === 0 ? (
          <EmptyState title="Sin documentos" description="No hay documentos asociados a esta reservación." />
        ) : (
          <Card className="shadow-sm">
            <CardContent className="pt-4 space-y-2">
              {documentos.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/60 transition-colors"
                  onClick={() => setDocViewer(doc)}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{doc.nombreArchivo}</p>
                    <p className="text-xs text-muted-foreground">{doc.tipo}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog visor de documento */}
      <Dialog open={!!docViewer} onOpenChange={(open) => { if (!open) setDocViewer(null); }}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{docViewer?.nombreArchivo}</DialogTitle>
          </DialogHeader>
          <iframe
            srcDoc={docViewer?.contenido ?? ""}
            className="flex-1 w-full rounded border border-border"
            title={docViewer?.nombreArchivo}
            sandbox="allow-same-origin"
          />
        </DialogContent>
      </Dialog>

      {/* Dialog registrar pago / abono */}
      <Dialog open={dialogPagoOpen} onOpenChange={setDialogPagoOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {reservacion.pagoEstado === "anticipo" ? "Registrar abono" : "Registrar pago"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Resumen financiero */}
            {reservacion.montoTotal > 0 && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Total reservación</span>
                  <span className="font-medium text-foreground">
                    ${reservacion.montoTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Ya abonado</span>
                  <span className="font-medium text-green-600">
                    ${reservacion.totalPagado.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1.5 mt-1 text-muted-foreground">
                  <span>Saldo pendiente</span>
                  <span className="font-semibold text-destructive">
                    ${reservacion.saldoPendiente.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="pagoMonto">Monto *</Label>
              <Input
                id="pagoMonto"
                type="number"
                min="0.01"
                step="0.01"
                max={reservacion.saldoPendiente > 0 ? reservacion.saldoPendiente : undefined}
                placeholder="Ej. 5000"
                value={pagoMonto}
                onChange={(e) => setPagoMonto(e.target.value)}
              />
              {reservacion.saldoPendiente > 0 && (
                <p className="text-xs text-muted-foreground">
                  Máximo: ${reservacion.saldoPendiente.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pagoMetodo">Método de pago *</Label>
              <Select value={pagoMetodo} onValueChange={(v) => setPagoMetodo(v as typeof pagoMetodo)}>
                <SelectTrigger id="pagoMetodo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogPagoOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={
                !pagoMonto ||
                Number(pagoMonto) <= 0 ||
                (reservacion.saldoPendiente > 0 && Number(pagoMonto) > reservacion.saldoPendiente) ||
                registrarPagoMutation.isPending
              }
              onClick={() => registrarPagoMutation.mutate()}
            >
              {registrarPagoMutation.isPending ? "Registrando..." : "Confirmar pago"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ReservacionDetalle;
