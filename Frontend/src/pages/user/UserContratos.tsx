import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, CalendarDays, MapPin, User, Eye, Download } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getMisContratos, getPdfUrl, type DocumentoAPI } from "@/lib/api";

function formatDate(iso: string) {
  if (!iso || iso === "—") return iso;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function UserContratos() {
  const [vistaContrato, setVistaContrato] = useState<DocumentoAPI | null>(null);

  const { data: contratos = [], isLoading, isError } = useQuery({
    queryKey: ["mis-contratos"],
    queryFn: getMisContratos,
  });

  return (
    <UserLayout>
      <PageHeader
        title="Mis Contratos"
        description="Contratos generados para tus reservaciones de espacios públicos"
      />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          title="Error al cargar contratos"
          description="No se pudo conectar con el servidor. Intenta recargar la página."
        />
      )}

      {!isLoading && !isError && contratos.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No tienes contratos generados"
          description="Los contratos aparecerán aquí una vez que sean generados por el área administrativa para tus reservaciones aprobadas."
        />
      )}

      {!isLoading && !isError && contratos.length > 0 && (
        <div className="space-y-3">
          {contratos.map((doc) => (
            <Card key={doc.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="font-medium text-sm truncate">{doc.nombreArchivo}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
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
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1.5"
                      onClick={() => setVistaContrato(doc)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver
                    </Button>
                    {doc.pdfPath && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          className="text-xs gap-1.5"
                          onClick={() => window.open(getPdfUrl(doc.id), "_blank")}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Ver PDF
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs gap-1.5" asChild>
                          <a href={getPdfUrl(doc.id, true)} download>
                            <Download className="h-3.5 w-3.5" />
                            Descargar
                          </a>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal visor */}
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
