import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, CalendarDays, Users, CreditCard, FileText, Download, CheckCircle, XCircle, RotateCcw, DollarSign } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pagosMock } from "@/data/pagosMock";
import { toast } from "sonner";

const metodoPagoLabel: Record<string, string> = {
  transferencia: "Transferencia bancaria",
  efectivo: "Efectivo",
  tarjeta: "Tarjeta de crédito/débito",
  cheque: "Cheque",
};

const estadoToEstadoType = {
  pendiente: "pendiente",
  pagado: "pagado",
  cancelado: "cancelado",
  reembolsado: "reembolsado",
} as const;

export default function PagoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pago = pagosMock.find((p) => p.id === id);

  if (!pago) {
    return (
      <AppLayout>
        <PageHeader title="Pago no encontrado" />
        <Button variant="outline" onClick={() => navigate("/pagos")}>Volver a pagos</Button>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/pagos")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{pago.id}</h1>
            <StatusBadge estado={estadoToEstadoType[pago.estado]} />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Reservación {pago.folioReservacion}</p>
        </div>
        <div className="flex items-center gap-2">
          {pago.estado === "pendiente" && (
            <>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => toast.success("Pago validado")}>
                <CheckCircle className="h-3.5 w-3.5" /> Validar pago
              </Button>
              <Button size="sm" className="gap-1.5 text-xs" onClick={() => toast.success("Marcado como pagado")}>
                <DollarSign className="h-3.5 w-3.5" /> Marcar como pagado
              </Button>
              <Button size="sm" variant="destructive" className="gap-1.5 text-xs" onClick={() => toast.info("Pago cancelado")}>
                <XCircle className="h-3.5 w-3.5" /> Cancelar
              </Button>
            </>
          )}
          {pago.estado === "pagado" && (
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => toast.info("Reembolso iniciado")}>
              <RotateCcw className="h-3.5 w-3.5" /> Reembolsar
            </Button>
          )}
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => toast.info("Recibo descargado")}>
            <Download className="h-3.5 w-3.5" /> Descargar recibo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Información del pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <InfoField label="Monto total" value={`$${pago.montoTotal.toLocaleString("es-MX")}`} highlight />
                <InfoField label="Anticipo" value={pago.anticipo > 0 ? `$${pago.anticipo.toLocaleString("es-MX")}` : "Sin anticipo"} />
                <InfoField label="Saldo pendiente" value={pago.saldoPendiente > 0 ? `$${pago.saldoPendiente.toLocaleString("es-MX")}` : "$0"} className={pago.saldoPendiente > 0 ? "text-destructive font-semibold" : "text-success font-semibold"} />
                <InfoField label="Método de pago" value={metodoPagoLabel[pago.metodoPago]} />
                <InfoField label="Referencia" value={pago.referencia || "Sin referencia"} />
                <InfoField label="Fecha de pago" value={pago.fechaPago || "Pendiente"} />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="historial">
            <TabsList>
              <TabsTrigger value="historial">Historial de pagos</TabsTrigger>
              <TabsTrigger value="comprobante">Comprobante</TabsTrigger>
            </TabsList>
            <TabsContent value="historial">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {pago.historial.map((h, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium">{h.accion}</p>
                          <p className="text-xs text-muted-foreground">{h.usuario} · {h.fecha}</p>
                        </div>
                        {h.monto && (
                          <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded">
                            ${h.monto.toLocaleString("es-MX")}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="comprobante">
              <Card>
                <CardContent className="pt-6">
                  {pago.comprobante ? (
                    <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{pago.comprobante}</p>
                          <p className="text-xs text-muted-foreground">Documento adjunto</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => toast.info("Comprobante descargado")}>
                        <Download className="h-3.5 w-3.5" /> Ver
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-6">No se ha adjuntado comprobante de pago.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
                  <p className="font-medium">{pago.espacio}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Solicitante</p>
                  <p className="font-medium">{pago.solicitante}</p>
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
                <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Tipo de evento</p>
                  <p className="font-medium">{pago.tipoEvento}</p>
                </div>
              </div>
              <Separator />
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => navigate(`/reservaciones/${pago.folioReservacion}`)}>
                Ver reservación
              </Button>
            </CardContent>
          </Card>

          {/* Resumen financiero */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resumen financiero</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monto total</span>
                <span className="font-medium">${pago.montoTotal.toLocaleString("es-MX")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Anticipo</span>
                <span className="font-medium text-success">${pago.anticipo.toLocaleString("es-MX")}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Saldo pendiente</span>
                <span className={pago.saldoPendiente > 0 ? "text-destructive" : "text-success"}>
                  ${pago.saldoPendiente.toLocaleString("es-MX")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function InfoField({ label, value, highlight, className }: { label: string; value: string; highlight?: boolean; className?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className={`font-medium ${highlight ? "text-lg" : ""} ${className || ""}`}>{value}</p>
    </div>
  );
}
