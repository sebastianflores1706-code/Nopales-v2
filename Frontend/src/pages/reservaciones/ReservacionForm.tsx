import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tiposEvento } from "@/data/reservacionesMock";
import { getEspacios, createReservacion, ApiError } from "@/lib/api";

const ReservacionForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [espacioId, setEspacioId] = useState("");
  const [tipoEvento, setTipoEvento] = useState("");
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [asistentes, setAsistentes] = useState("");
  const [solicitanteNombre, setSolicitanteNombre] = useState("");

  const { data: espacios = [] } = useQuery({
    queryKey: ["espacios"],
    queryFn: getEspacios,
  });

  const espaciosActivos = espacios.filter((e) => e.estado === "activo");

  const mutation = useMutation({
    mutationFn: createReservacion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservaciones"] });
      toast.success("Solicitud de reservación creada correctamente");
      navigate("/reservaciones");
    },
    onError: (err) => {
      const mensaje = err instanceof ApiError
        ? (err.data as any)?.error ?? `Error ${err.status}`
        : "No se pudo crear la reservación";
      toast.error(mensaje);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!espacioId) { toast.error("Selecciona un espacio"); return; }
    if (!tipoEvento) { toast.error("Selecciona un tipo de evento"); return; }
    mutation.mutate({
      espacioId,
      solicitanteNombre,
      tipoEvento,
      fecha,
      horaInicio: horaInicio.slice(0, 5),
      horaFin: horaFin.slice(0, 5),
      asistentes: Number(asistentes),
    });
  };

  return (
    <AppLayout>
      <PageHeader
        title="Nueva solicitud de reservación"
        description="Completa la información para registrar una nueva solicitud de uso de espacio"
        actions={
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/reservaciones")}>
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Información del evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="espacio">Espacio *</Label>
                <Select value={espacioId} onValueChange={setEspacioId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar espacio" />
                  </SelectTrigger>
                  <SelectContent>
                    {espaciosActivos.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipoEvento">Tipo de evento *</Label>
                <Select value={tipoEvento} onValueChange={setTipoEvento}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposEvento.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombreEvento">Nombre del evento *</Label>
              <Input id="nombreEvento" placeholder="Ej. Festival de Primavera 2026" required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input id="fecha" type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horaInicio">Hora de inicio *</Label>
                <Input id="horaInicio" type="time" step="60" required value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horaFin">Hora de fin *</Label>
                <Input id="horaFin" type="time" step="60" required value={horaFin} onChange={(e) => setHoraFin(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="asistentes">Número de asistentes *</Label>
                <Input id="asistentes" type="number" placeholder="Ej. 200" required value={asistentes} onChange={(e) => setAsistentes(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizador">Organizador / Solicitante *</Label>
                <Input id="organizador" placeholder="Nombre completo o institución" required value={solicitanteNombre} onChange={(e) => setSolicitanteNombre(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Descripción del evento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                rows={4}
                placeholder="Describe el evento, actividades programadas, necesidades especiales..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 pb-6">
          <Button type="button" variant="outline" onClick={() => navigate("/reservaciones")}>
            Cancelar
          </Button>
          <Button type="submit" className="gap-2" disabled={mutation.isPending}>
            <Save className="h-4 w-4" />
            Crear solicitud
          </Button>
        </div>
      </form>
    </AppLayout>
  );
};

export default ReservacionForm;
