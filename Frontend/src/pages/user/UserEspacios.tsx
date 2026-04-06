import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MapPin, Users, DollarSign, Eye } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getEspacios, getMantenimientos } from "@/lib/api";
import { getEstadoVisualEspacio } from "@/lib/espacio-utils";

function EspacioCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-1" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-9 w-full mt-2" />
      </CardContent>
    </Card>
  );
}

export default function UserEspacios() {
  const navigate = useNavigate();
  const { data: espacios = [], isLoading, isError } = useQuery({
    queryKey: ["espacios"],
    queryFn: getEspacios,
  });

  const { data: mantenimientos = [] } = useQuery({
    queryKey: ["mantenimientos"],
    queryFn: getMantenimientos,
    refetchInterval: 60_000,
  });

  return (
    <UserLayout>
      <PageHeader
        title="Espacios Disponibles"
        description="Consulta los espacios públicos disponibles para reservar"
      />

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <EspacioCardSkeleton key={i} />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          title="Error al cargar espacios"
          description="No se pudo conectar con el servidor. Intenta recargar la página."
        />
      )}

      {!isLoading && !isError && espacios.length === 0 && (
        <EmptyState
          icon={MapPin}
          title="No hay espacios disponibles"
          description="Actualmente no hay espacios registrados en el sistema."
        />
      )}

      {!isLoading && !isError && espacios.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {espacios.map((espacio) => (
            <Card key={espacio.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold leading-tight">
                    {espacio.nombre}
                  </CardTitle>
                  <StatusBadge estado={getEstadoVisualEspacio(espacio, mantenimientos)} />
                </div>
                <p className="text-xs text-muted-foreground capitalize">{espacio.tipo}</p>
              </CardHeader>

              <CardContent className="flex flex-col gap-3 flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{espacio.ubicacion}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  <span>{espacio.capacidad} personas</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5 shrink-0" />
                  <span>${espacio.costoPorHora.toLocaleString()} / hora</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-auto w-full gap-2"
                  onClick={() => navigate(`/portal/espacios/${espacio.id}`)}
                >
                  <Eye className="h-4 w-4" />
                  Ver detalle
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </UserLayout>
  );
}
