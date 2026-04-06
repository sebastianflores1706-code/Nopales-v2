import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Eye, MapPin, CalendarDays, User, Download, Printer, MoreHorizontal, ExternalLink } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { EmptyState } from "@/components/admin/EmptyState";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  getAllDocumentos,
  generarContrato,
  generarPdfContrato,
  getPdfUrl,
  getReservaciones,
  ApiError,
  type DocumentoAPI,
} from "@/lib/api";

function formatDate(iso: string) {
  if (!iso || iso === "—") return iso;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function ContratosLista() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [vistaContrato, setVistaContrato] = useState<DocumentoAPI | null>(null);

  const { data: contratos = [], isLoading } = useQuery({
    queryKey: ["documentos"],
    queryFn: getAllDocumentos,
  });

  const { data: reservaciones = [] } = useQuery({
    queryKey: ["reservaciones"],
    queryFn: getReservaciones,
  });

  const generarMutation = useMutation({
    mutationFn: (reservacionId: string) => generarContrato(reservacionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos"] });
      toast.success("Contrato generado correctamente");
    },
    onError: (err) => {
      const mensaje =
        err instanceof ApiError
          ? (err.data as { error?: string })?.error ?? `Error ${err.status}`
          : "No se pudo generar el contrato";
      toast.error(mensaje);
    },
  });

  const pdfMutation = useMutation({
    mutationFn: (documentoId: string) => generarPdfContrato(documentoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos"] });
      toast.success("PDF generado correctamente");
    },
    onError: (err) => {
      const mensaje =
        err instanceof ApiError
          ? (err.data as { error?: string })?.error ?? `Error ${err.status}`
          : "No se pudo generar el PDF";
      toast.error(mensaje);
    },
  });

  // Reservaciones aprobadas sin contrato aún
  const contratoIds = new Set(contratos.map((c) => c.reservacionId));
  const apróbadasSinContrato = reservaciones.filter(
    (r) => r.estado === "aprobada" && !contratoIds.has(r.id)
  );
  // Listas: aprobadas con pago completo (saldo = 0) → se puede generar contrato
  const reservacionesSinContrato = apróbadasSinContrato.filter((r) => r.saldoPendiente === 0);
  // Con saldo pendiente: pago parcial o sin pago → no se puede generar contrato todavía
  const reservacionesSinPago = apróbadasSinContrato.filter((r) => r.saldoPendiente > 0);

  if (isLoading) {
    return (
      <AppLayout>
        <EmptyState title="Cargando contratos..." description="Por favor espera." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contratos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Contratos de uso de espacios públicos generados
          </p>
        </div>
      </div>

      {/* Reservaciones aprobadas con pago: listas para generar contrato */}
      {reservacionesSinContrato.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Listas para generar contrato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reservacionesSinContrato.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50 text-sm"
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="font-mono font-medium">{r.folio}</span>
                    <span className="text-muted-foreground">{r.solicitanteNombre}</span>
                    <span className="text-muted-foreground">{r.espacioNombre}</span>
                    <span className="text-muted-foreground">{formatDate(r.fecha)}</span>
                    <StatusBadge estado={r.pagoEstado} />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1.5 shrink-0"
                    disabled={generarMutation.isPending}
                    onClick={() => generarMutation.mutate(r.id)}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Generar contrato
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reservaciones aprobadas sin pago: no se puede generar contrato aún */}
      {reservacionesSinPago.length > 0 && (
        <Card className="mb-6 border-warning/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-warning flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Saldo pendiente (requieren pago completo para generar contrato)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reservacionesSinPago.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between py-2 px-3 rounded-md bg-warning/5 text-sm"
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="font-mono font-medium">{r.folio}</span>
                    <span className="text-muted-foreground">{r.solicitanteNombre}</span>
                    <span className="text-muted-foreground">{r.espacioNombre}</span>
                    <span className="text-muted-foreground">{formatDate(r.fecha)}</span>
                  </div>
                  <span className="text-xs text-warning font-medium shrink-0">
                    Sin pago registrado
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de contratos */}
      {contratos.length === 0 ? (
        <EmptyState
          title="No hay contratos generados"
          description="Los contratos aparecerán aquí una vez que se generen para reservaciones aprobadas."
        />
      ) : (
        <div className="space-y-3">
          {contratos.map((doc) => (
            <Card key={doc.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{doc.nombreArchivo}</span>
                        <StatusBadge estado="aprobada" />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {doc.solicitanteNombre}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {doc.espacioNombre}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(doc.fechaEvento)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Folio: {doc.reservacionFolio} &nbsp;·&nbsp; Generado:{" "}
                        {new Date(doc.createdAt).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {doc.pdfPath ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1.5"
                        onClick={() => window.open(getPdfUrl(doc.id), "_blank")}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Ver PDF
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="default"
                        className="text-xs gap-1.5"
                        disabled={pdfMutation.isPending}
                        onClick={() => pdfMutation.mutate(doc.id)}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        {pdfMutation.isPending ? "Generando..." : "Generar PDF"}
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setVistaContrato(doc)}>
                          <Eye className="h-3.5 w-3.5 mr-2" />
                          Ver HTML
                        </DropdownMenuItem>
                        {doc.pdfPath && (
                          <>
                            <DropdownMenuItem asChild>
                              <a href={getPdfUrl(doc.id, true)} download className="flex items-center">
                                <Download className="h-3.5 w-3.5 mr-2" />
                                Descargar PDF
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const win = window.open(getPdfUrl(doc.id), "_blank");
                                win?.addEventListener("load", () => win.print());
                              }}
                            >
                              <Printer className="h-3.5 w-3.5 mr-2" />
                              Imprimir
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate(`/reservaciones/${doc.reservacionId}`, { state: { from: "/contratos" } })}>
                          <ExternalLink className="h-3.5 w-3.5 mr-2" />
                          Ver reservación
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de vista de contrato */}
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
            />
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
