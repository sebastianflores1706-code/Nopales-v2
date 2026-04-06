import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserLayout } from "@/components/layout/UserLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tiposEvento } from "@/data/reservacionesMock";
import { getEspacios, createReservacion, ApiError } from "@/lib/api";

export default function UserNuevaReservacion() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [espacioId, setEspacioId] = useState("");
  const [tipoEvento, setTipoEvento] = useState("");
  const [tipoEventoPersonalizado, setTipoEventoPersonalizado] = useState("");
  const [solicitanteNombre, setSolicitanteNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [asistentes, setAsistentes] = useState("");
  const [descripcionEvento, setDescripcionEvento] = useState("");

  const { data: espacios = [] } = useQuery({
    queryKey: ["espacios"],
    queryFn: getEspacios,
  });

  const espaciosActivos = espacios.filter((e) => e.estado === "activo");

  const mutation = useMutation({
    mutationFn: createReservacion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mis-reservaciones"] });
      toast.success("Solicitud de reservación enviada correctamente");
      navigate("/portal/reservaciones");
    },
    onError: (err) => {
      const mensaje =
        err instanceof ApiError
          ? (err.data as { error?: string })?.error ?? `Error ${err.status}`
          : "No se pudo crear la reservación";
      toast.error(mensaje);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!espacioId) { toast.error("Selecciona un espacio"); return; }
    if (!tipoEvento) { toast.error("Selecciona un tipo de evento"); return; }
    if (tipoEvento === "otro" && !tipoEventoPersonalizado.trim()) { toast.error("Escribe el tipo de evento"); return; }
    if (horaInicio >= horaFin) { toast.error("La hora de fin debe ser posterior a la hora de inicio"); return; }

    const tipoEventoFinal = tipoEvento === "otro" ? tipoEventoPersonalizado.trim() : tipoEvento;

    mutation.mutate({
      espacioId,
      solicitanteNombre,
      tipoEvento: tipoEventoFinal,
      descripcionEvento: descripcionEvento || undefined,
      fecha,
      horaInicio: horaInicio.slice(0, 5),
      horaFin: horaFin.slice(0, 5),
      asistentes: Number(asistentes),
    });
  };

  return (
    <UserLayout>
      <PageHeader
        title="Nueva reservación"
        description="Completa la información para solicitar el uso de un espacio público"
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigate("/portal/reservaciones")}
          >
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
                      <SelectItem key={e.id} value={e.id}>
                        {e.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipoEvento">Tipo de evento *</Label>
                <Select value={tipoEvento} onValueChange={(v) => { setTipoEvento(v); if (v !== "otro") setTipoEventoPersonalizado(""); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposEvento.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                {tipoEvento === "otro" && (
                  <Input
                    placeholder="Describe el tipo de evento"
                    value={tipoEventoPersonalizado}
                    onChange={(e) => setTipoEventoPersonalizado(e.target.value)}
                    autoFocus
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="solicitanteNombre">Nombre del solicitante *</Label>
              <Input
                id="solicitanteNombre"
                placeholder="Nombre completo o institución"
                required
                value={solicitanteNombre}
                onChange={(e) => setSolicitanteNombre(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input
                  id="fecha"
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horaInicio">Hora de inicio *</Label>
                <Input
                  id="horaInicio"
                  type="time"
                  step="60"
                  required
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horaFin">Hora de fin *</Label>
                <Input
                  id="horaFin"
                  type="time"
                  step="60"
                  required
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2 sm:w-1/2">
              <Label htmlFor="asistentes">Número de asistentes *</Label>
              <Input
                id="asistentes"
                type="number"
                min="1"
                placeholder="Ej. 50"
                required
                value={asistentes}
                onChange={(e) => setAsistentes(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcionEvento">Descripción del evento</Label>
              <Textarea
                id="descripcionEvento"
                rows={3}
                placeholder="Describe brevemente el propósito y características del evento (opcional)"
                value={descripcionEvento}
                onChange={(e) => setDescripcionEvento(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/portal/reservaciones")}
          >
            Cancelar
          </Button>
          <Button type="submit" className="gap-2" disabled={mutation.isPending}>
            <Save className="h-4 w-4" />
            {mutation.isPending ? "Enviando..." : "Enviar solicitud"}
          </Button>
        </div>
      </form>
    </UserLayout>
  );
}
