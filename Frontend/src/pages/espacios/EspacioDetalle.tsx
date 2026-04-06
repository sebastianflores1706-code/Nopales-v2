import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, MapPin, Users, DollarSign, Clock, ImageIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DataTable, Column } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { getEspacioById, getMantenimientos, getImagenUrl, getReservaciones, ApiError, type ReservacionAPI } from "@/lib/api";
import { getEstadoVisualEspacio } from "@/lib/espacio-utils";

const reservacionColumns: Column<ReservacionAPI>[] = [
  { key: "folio", header: "Folio" },
  { key: "solicitanteNombre", header: "Solicitante" },
  { key: "fecha", header: "Fecha" },
  {
    key: "horaInicio",
    header: "Horario",
    render: (item) => `${item.horaInicio} - ${item.horaFin}`,
  },
  { key: "tipoEvento", header: "Tipo de evento" },
  { key: "estado", header: "Estado", render: (item) => <StatusBadge estado={item.estado} /> },
];


const EspacioDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: espacio, isLoading, error } = useQuery({
    queryKey: ["espacio", id],
    queryFn: () => getEspacioById(id!),
    enabled: !!id,
  });

  const { data: mantenimientos = [] } = useQuery({
    queryKey: ["mantenimientos"],
    queryFn: getMantenimientos,
    refetchInterval: 60_000,
  });

  const { data: todasReservaciones = [] } = useQuery({
    queryKey: ["reservaciones"],
    queryFn: getReservaciones,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <AppLayout>
        <EmptyState title="Espacio no encontrado" description="El espacio solicitado no existe." />
      </AppLayout>
    );
  }

  if (error || !espacio) {
    return (
      <AppLayout>
        <EmptyState title="Error al cargar" description="No se pudo obtener la información del espacio." />
      </AppLayout>
    );
  }

  const hoy = new Date().toISOString().substring(0, 10);
  const estadosActivos = ["pendiente_revision", "aprobada", "en_uso"];
  const proximasReservaciones = todasReservaciones.filter(
    (r) => r.espacioId === espacio.id && r.fecha >= hoy && estadosActivos.includes(r.estado)
  );

  const infoItems = [
    { icon: MapPin, label: "Ubicación", value: espacio.ubicacion },
    { icon: Users, label: "Capacidad", value: `${espacio.capacidad} personas` },
    { icon: DollarSign, label: "Costo por hora", value: `$${espacio.costoPorHora.toLocaleString()}` },
    { icon: Clock, label: "Horario disponible", value: espacio.horarioDisponible ?? "—" },
  ];

  return (
    <AppLayout>
      <PageHeader
        title={espacio.nombre}
        description={espacio.tipo}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/espacios")}>
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <Button size="sm" className="gap-2" onClick={() => navigate(`/espacios/${espacio.id}/editar`)}>
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Info general */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Información general</CardTitle>
              <StatusBadge estado={getEstadoVisualEspacio(espacio, mantenimientos)} />
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
              <p className="text-xs text-muted-foreground mb-1">Descripción</p>
              <p className="text-sm leading-relaxed">{espacio.descripcion ?? "Sin descripción"}</p>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">Reglas y condiciones de uso</p>
              <p className="text-sm leading-relaxed">{espacio.reglas ?? "Sin reglas registradas"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Imágenes */}
        <Card className="shadow-sm self-start">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Imagen principal</CardTitle>
          </CardHeader>
          <CardContent>
            {(espacio.imagenes ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <ImageIcon className="h-10 w-10 mb-2" />
                <p className="text-sm">Sin imagen</p>
              </div>
            ) : (
              <AspectRatio ratio={4 / 3}>
                <img
                  src={getImagenUrl((espacio.imagenes ?? [])[0].url)}
                  alt={espacio.nombre}
                  className="rounded-md object-cover w-full h-full bg-muted"
                />
              </AspectRatio>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Próximas reservaciones */}
      <Tabs defaultValue="proximas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="proximas">
            Próximas reservaciones ({proximasReservaciones.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proximas">
          {proximasReservaciones.length === 0 ? (
            <EmptyState title="Sin reservaciones próximas" description="No hay reservaciones programadas para este espacio." />
          ) : (
            <DataTable
              columns={reservacionColumns as any}
              data={proximasReservaciones as any}
            />
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default EspacioDetalle;
