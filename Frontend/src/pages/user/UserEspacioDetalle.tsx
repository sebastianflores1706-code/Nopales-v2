import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Users, DollarSign, Clock, CalendarPlus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { UserLayout } from "@/components/layout/UserLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { getEspacioById, getImagenUrl, getMantenimientos, ApiError } from "@/lib/api";
import { getEstadoVisualEspacio } from "@/lib/espacio-utils";

export default function UserEspacioDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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

  if (isLoading) {
    return (
      <UserLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-48 w-full" />
        </div>
      </UserLayout>
    );
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <UserLayout>
        <EmptyState
          icon={MapPin}
          title="Espacio no encontrado"
          description="El espacio solicitado no existe o ya no está disponible."
          actionLabel="Ver espacios"
          onAction={() => navigate("/portal/espacios")}
        />
      </UserLayout>
    );
  }

  if (error || !espacio) {
    return (
      <UserLayout>
        <EmptyState
          title="Error al cargar"
          description="No se pudo obtener la información del espacio."
          actionLabel="Volver"
          onAction={() => navigate("/portal/espacios")}
        />
      </UserLayout>
    );
  }

  const infoItems = [
    { icon: MapPin, label: "Ubicación", value: espacio.ubicacion },
    { icon: Users, label: "Capacidad", value: `${espacio.capacidad} personas` },
    { icon: DollarSign, label: "Costo por hora", value: `$${espacio.costoPorHora.toLocaleString()}` },
    { icon: Clock, label: "Horario disponible", value: espacio.horarioDisponible ?? "—" },
  ];

  const estadoVisual = getEstadoVisualEspacio(espacio, mantenimientos);
  const disponible = estadoVisual === "activo";
  const imagenes = espacio.imagenes ?? [];

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImg = () => setLightboxIndex((i) => (i !== null ? (i - 1 + imagenes.length) % imagenes.length : null));
  const nextImg = () => setLightboxIndex((i) => (i !== null ? (i + 1) % imagenes.length : null));

  return (
    <UserLayout>
      <PageHeader
        title={espacio.nombre}
        description={espacio.tipo}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigate("/portal/espacios")}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info general */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Información general</CardTitle>
              <StatusBadge estado={estadoVisual} />
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
              <p className="text-sm leading-relaxed text-muted-foreground">
                {espacio.descripcion ?? "Sin descripción registrada."}
              </p>
            </div>

            {espacio.reglas && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Reglas y condiciones de uso</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{espacio.reglas}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Columna derecha: imagen + acción */}
        <div className="flex flex-col gap-4 self-start">
          {/* Card imagen */}
          {imagenes.length > 0 && (
            <Card className="shadow-sm overflow-hidden">
              <div
                className="h-48 cursor-pointer"
                onClick={() => openLightbox(0)}
              >
                <img
                  src={getImagenUrl(imagenes[0].url)}
                  alt={espacio.nombre}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              </div>
            </Card>
          )}

          {/* Card acción */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">¿Te interesa este espacio?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {disponible
                  ? "Este espacio está disponible para reservaciones. Inicia tu solicitud."
                  : "Este espacio no está disponible para reservaciones en este momento."}
              </p>
              <Button
                className="w-full gap-2"
                disabled={!disponible}
                onClick={() => navigate(`/portal/reservaciones/nueva?espacioId=${espacio.id}`)}
              >
                <CalendarPlus className="h-4 w-4" />
                Reservar espacio
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={closeLightbox}
          >
            <X className="h-5 w-5" />
          </button>
          {imagenes.length > 1 && (
            <>
              <button
                className="absolute left-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); prevImg(); }}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                className="absolute right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); nextImg(); }}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
          <img
            src={getImagenUrl(imagenes[lightboxIndex].url)}
            alt={espacio.nombre}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-4 text-white/60 text-sm">
            {lightboxIndex + 1} / {imagenes.length}
          </p>
        </div>
      )}
    </UserLayout>
  );
}
