import { useState, useMemo } from "react";
import { Wrench, CalendarClock, Trash2, Plus, AlertTriangle, CalendarIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, isAfter, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  getMantenimientos, createMantenimiento, deleteMantenimiento,
  getEspacios,
  type MantenimientoAPI,
} from "@/lib/api";

function formatDT(iso: string) {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "d MMM yyyy, HH:mm", { locale: es });
  } catch {
    return iso;
  }
}

function duracion(inicio: string, fin: string): string {
  try {
    const ms = parseISO(fin).getTime() - parseISO(inicio).getTime();
    const h = Math.floor(ms / 3600000);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h`;
    return `${h}h`;
  } catch {
    return "—";
  }
}

const columns: Column<MantenimientoAPI>[] = [
  {
    key: "espacio",
    header: "Espacio",
    render: (m) => (
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-destructive/10">
          <Wrench className="h-3.5 w-3.5 text-destructive" />
        </div>
        <span className="font-medium text-sm">{m.espacioNombre}</span>
      </div>
    ),
  },
  {
    key: "motivo",
    header: "Motivo",
    render: (m) => (
      <span className="text-sm text-muted-foreground line-clamp-2 max-w-xs">{m.motivo}</span>
    ),
  },
  {
    key: "fechaInicio",
    header: "Inicio",
    render: (m) => <span className="text-sm">{formatDT(m.fechaInicio)}</span>,
  },
  {
    key: "fechaFin",
    header: "Fin",
    render: (m) => <span className="text-sm">{formatDT(m.fechaFin)}</span>,
  },
  {
    key: "duracion",
    header: "Duración",
    render: (m) => (
      <span className="text-sm text-muted-foreground">{duracion(m.fechaInicio, m.fechaFin)}</span>
    ),
  },
];

interface FormState {
  espacioId: string;
  fechaInicioDia: Date | undefined;
  fechaInicioHora: string;
  fechaFinDia: Date | undefined;
  fechaFinHora: string;
  motivo: string;
}

const FORM_EMPTY: FormState = {
  espacioId: "",
  fechaInicioDia: undefined,
  fechaInicioHora: "08:00",
  fechaFinDia: undefined,
  fechaFinHora: "18:00",
  motivo: "",
};

function DatePickerField({
  label,
  selected,
  onSelect,
  hora,
  onHoraChange,
}: {
  label: string;
  selected: Date | undefined;
  onSelect: (d: Date | undefined) => void;
  hora: string;
  onHoraChange: (h: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selected && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selected
              ? format(selected, "d 'de' MMMM, yyyy", { locale: es })
              : "Seleccionar fecha"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={onSelect}
            initialFocus
            locale={es}
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        step="60"
        value={hora}
        onChange={(e) => onHoraChange(e.target.value)}
      />
    </div>
  );
}

export default function MantenimientosLista() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(FORM_EMPTY);
  const [formError, setFormError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: mantenimientos = [], isLoading, isError } = useQuery({
    queryKey: ["mantenimientos"],
    queryFn: getMantenimientos,
  });

  const { data: espacios = [] } = useQuery({
    queryKey: ["espacios"],
    queryFn: getEspacios,
  });

  const createMutation = useMutation({
    mutationFn: createMantenimiento,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mantenimientos"] });
      qc.invalidateQueries({ queryKey: ["espacios"] });
      toast({ title: "Mantenimiento registrado correctamente" });
      setDialogOpen(false);
      setForm(FORM_EMPTY);
      setFormError("");
    },
    onError: (err: any) => {
      const msg = err?.data?.error ?? err?.message ?? "Error al crear el mantenimiento";
      setFormError(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMantenimiento,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mantenimientos"] });
      qc.invalidateQueries({ queryKey: ["espacios"] });
      toast({ title: "Mantenimiento eliminado" });
      setDeleteId(null);
    },
    onError: (err: any) => {
      toast({
        title: "Error al eliminar",
        description: err?.data?.error ?? err?.message,
        variant: "destructive",
      });
    },
  });

  const now = new Date();
  const enCurso = useMemo(
    () =>
      mantenimientos.filter((m) => {
        try {
          return isWithinInterval(now, {
            start: parseISO(m.fechaInicio),
            end: parseISO(m.fechaFin),
          });
        } catch {
          return false;
        }
      }).length,
    [mantenimientos]
  );
  const proximos = useMemo(
    () => mantenimientos.filter((m) => isAfter(parseISO(m.fechaInicio), now)).length,
    [mantenimientos]
  );

  const columnsWithDelete: Column<MantenimientoAPI>[] = [
    ...columns,
    {
      key: "acciones",
      header: "",
      render: (m) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            setDeleteId(m.id);
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!form.espacioId) { setFormError("Selecciona un espacio"); return; }
    if (!form.fechaInicioDia) { setFormError("Selecciona la fecha de inicio"); return; }
    if (!form.fechaFinDia) { setFormError("Selecciona la fecha de fin"); return; }
    if (!form.motivo.trim()) { setFormError("Escribe el motivo del mantenimiento"); return; }

    const fechaInicio = `${format(form.fechaInicioDia, "yyyy-MM-dd")}T${form.fechaInicioHora}:00`;
    const fechaFin = `${format(form.fechaFinDia, "yyyy-MM-dd")}T${form.fechaFinHora}:00`;

    if (fechaFin <= fechaInicio) {
      setFormError("La fecha/hora de fin debe ser posterior a la de inicio");
      return;
    }

    createMutation.mutate({ espacioId: form.espacioId, fechaInicio, fechaFin, motivo: form.motivo });
  }

  return (
    <AppLayout>
      <PageHeader
        title="Mantenimiento"
        description="Periodos de mantenimiento programado para espacios"
        actions={
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => { setDialogOpen(true); setForm(FORM_EMPTY); setFormError(""); }}
          >
            <Plus className="h-4 w-4" /> Nuevo mantenimiento
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total registros" value={mantenimientos.length} icon={Wrench} iconBg="bg-gray-100" iconColor="text-gray-600" />
        <StatCard title="En curso" value={enCurso} icon={CalendarClock} iconBg="bg-yellow-100" iconColor="text-yellow-600" />
        <StatCard title="Próximos" value={proximos} icon={AlertTriangle} iconBg="bg-blue-100" iconColor="text-blue-600" />
      </div>

      {isError && (
        <EmptyState
          title="Error al cargar mantenimientos"
          description="No se pudo conectar con el servidor."
        />
      )}

      {!isError && (
        <DataTable
          columns={columnsWithDelete as any}
          data={isLoading ? [] : (mantenimientos as any)}
          emptyMessage={isLoading ? "Cargando..." : "No hay mantenimientos registrados."}
        />
      )}

      {/* Dialog: Nuevo mantenimiento */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo mantenimiento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="espacioId">Espacio</Label>
              <Select
                value={form.espacioId}
                onValueChange={(v) => setForm((f) => ({ ...f, espacioId: v }))}
              >
                <SelectTrigger id="espacioId">
                  <SelectValue placeholder="Selecciona un espacio" />
                </SelectTrigger>
                <SelectContent>
                  {espacios.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DatePickerField
                label="Fecha de inicio"
                selected={form.fechaInicioDia}
                onSelect={(d) => setForm((f) => ({ ...f, fechaInicioDia: d }))}
                hora={form.fechaInicioHora}
                onHoraChange={(h) => setForm((f) => ({ ...f, fechaInicioHora: h }))}
              />
              <DatePickerField
                label="Fecha de fin"
                selected={form.fechaFinDia}
                onSelect={(d) => setForm((f) => ({ ...f, fechaFinDia: d }))}
                hora={form.fechaFinHora}
                onHoraChange={(h) => setForm((f) => ({ ...f, fechaFinHora: h }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="motivo">Motivo</Label>
              <Textarea
                id="motivo"
                placeholder="Describe el tipo de mantenimiento..."
                rows={3}
                value={form.motivo}
                onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))}
              />
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Guardando..." : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Confirmar eliminación */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar mantenimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El espacio quedará disponible para
              ese periodo nuevamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
