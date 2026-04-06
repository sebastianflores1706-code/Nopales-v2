import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Upload, X, ImageIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { createEspacio, updateEspacio, getEspacioById, uploadImagenesEspacio, deleteImagenEspacio, getImagenUrl, ApiError } from "@/lib/api";

const tiposOptions = [
  { label: "Plaza", value: "plaza" },
  { label: "Auditorio", value: "auditorio" },
  { label: "Parque", value: "parque" },
  { label: "Salón", value: "salon" },
  { label: "Cancha", value: "cancha" },
  { label: "Centro cultural", value: "centro_cultural" },
];

const estadoOptions = [
  { label: "Activo", value: "activo" },
  { label: "Inactivo", value: "inactivo" },
];

const EspacioForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState("activo");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar datos actuales al editar
  const { data: espacioActual, isLoading: isQueryLoading, error: queryError } = useQuery({
    queryKey: ["espacio", id],
    queryFn: () => getEspacioById(id!),
    enabled: isEditing,
  });

  // Inicializar selects controlados con datos del backend
  useEffect(() => {
    if (espacioActual) {
      setTipo(espacioActual.tipo);
      setEstado(espacioActual.estado);
    }
  }, [espacioActual]);

  // Manejar error al cargar el espacio para editar
  useEffect(() => {
    if (!queryError) return;
    if (queryError instanceof ApiError && queryError.status === 404) {
      toast.error("El espacio no existe.");
    } else {
      toast.error("Error al cargar el espacio.");
    }
    navigate("/espacios");
  }, [queryError, navigate]);

  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => uploadImagenesEspacio(id!, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["espacio", id] });
      toast.success("Imágenes subidas correctamente");
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: () => toast.error("Error al subir las imágenes"),
  });

  const deleteMutation = useMutation({
    mutationFn: (imagenId: string) => deleteImagenEspacio(id!, imagenId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["espacio", id] });
      toast.success("Imagen eliminada");
    },
    onError: () => toast.error("Error al eliminar la imagen"),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    uploadMutation.mutate(files);
  };

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof createEspacio>[0]) =>
      isEditing ? updateEspacio(id!, payload) : createEspacio(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["espacios"] });
      if (isEditing) queryClient.invalidateQueries({ queryKey: ["espacio", id] });
      toast.success(isEditing ? "Espacio actualizado correctamente" : "Espacio creado correctamente");
      navigate("/espacios");
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 400) {
        toast.error("Datos inválidos. Revisa los campos del formulario.");
      } else if (error instanceof ApiError && error.status === 404) {
        toast.error("El espacio no existe.");
        navigate("/espacios");
      } else {
        toast.error(isEditing ? "Error al actualizar el espacio." : "Error al crear el espacio.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const nombre = (form.elements.namedItem("nombre") as HTMLInputElement).value;
    const ubicacion = (form.elements.namedItem("ubicacion") as HTMLInputElement).value;
    const capacidad = Number((form.elements.namedItem("capacidad") as HTMLInputElement).value);
    const costoHora = Number((form.elements.namedItem("costo") as HTMLInputElement).value);
    const descripcion = (form.elements.namedItem("descripcion") as HTMLTextAreaElement).value || undefined;
    const reglas = (form.elements.namedItem("reglas") as HTMLTextAreaElement).value || undefined;
    const horarioDisponible = (form.elements.namedItem("horario") as HTMLInputElement).value || undefined;
    mutation.mutate({ nombre, tipo, ubicacion, capacidad, costoHora, estado, descripcion, reglas, horarioDisponible });
  };

  // Mostrar skeleton mientras se cargan los datos en modo edición
  if (isEditing && isQueryLoading) {
    return (
      <AppLayout>
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title={isEditing ? "Editar espacio" : "Crear nuevo espacio"}
        description={isEditing ? "Modifica la información del espacio" : "Completa la información para registrar un nuevo espacio"}
        actions={
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/espacios")}>
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Información básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del espacio *</Label>
                <Input id="nombre" placeholder="Ej. Plaza Central" defaultValue={espacioActual?.nombre ?? ""} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de espacio *</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposOptions.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ubicacion">Ubicación *</Label>
              <Input id="ubicacion" placeholder="Ej. Centro Histórico, Calle Principal #1" defaultValue={espacioActual?.ubicacion ?? ""} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacidad">Capacidad máxima *</Label>
                <Input id="capacidad" type="number" placeholder="Ej. 500" defaultValue={espacioActual?.capacidad ?? ""} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costo">Costo por hora (MXN) *</Label>
                <Input id="costo" type="number" placeholder="Ej. 2500" defaultValue={espacioActual?.costoPorHora ?? ""} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horario">Horario disponible *</Label>
                <Input id="horario" placeholder="Ej. 06:00 - 22:00" defaultValue={espacioActual?.horarioDisponible ?? ""} required />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Descripción y reglas */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Descripción y reglas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción del espacio</Label>
              <Textarea
                id="descripcion"
                rows={4}
                placeholder="Describe las características principales del espacio..."
                defaultValue={espacioActual?.descripcion ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reglas">Reglas y condiciones de uso</Label>
              <Textarea
                id="reglas"
                rows={4}
                placeholder="Indica las reglas, restricciones y condiciones de uso..."
                defaultValue={espacioActual?.reglas ?? ""}
              />
            </div>
          </CardContent>
        </Card>

        {/* Estado e imágenes */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Estado e imágenes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="estado">Estado del espacio *</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadoOptions.map((e) => (
                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Imágenes del espacio</Label>

              {isEditing ? (
                <>
                  {/* Grid de imágenes existentes */}
                  {(espacioActual?.imagenes ?? []).length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {(espacioActual?.imagenes ?? []).map((img) => (
                        <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                          <img
                            src={getImagenUrl(img.url)}
                            alt="Imagen del espacio"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => deleteMutation.mutate(img.id)}
                            disabled={deleteMutation.isPending}
                            className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Zona de subida */}
                  {(espacioActual?.imagenes ?? []).length < 6 && (
                    <div
                      className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadMutation.isPending ? (
                        <p className="text-sm text-muted-foreground">Subiendo imágenes...</p>
                      ) : (
                        <>
                          <Upload className="h-7 w-7 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Haz clic para seleccionar imágenes</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG, WEBP hasta 5 MB · Máximo {6 - (espacioActual?.imagenes ?? []).length} más
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted/30">
                  <ImageIcon className="h-7 w-7 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Las imágenes se pueden agregar una vez que el espacio haya sido creado.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Button type="button" variant="outline" onClick={() => navigate("/espacios")}>
            Cancelar
          </Button>
          <Button type="submit" className="gap-2" disabled={mutation.isPending}>
            <Save className="h-4 w-4" />
            {mutation.isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear espacio"}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
};

export default EspacioForm;
