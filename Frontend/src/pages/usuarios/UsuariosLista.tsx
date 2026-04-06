import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Users, ShieldCheck, User, X, Plus, Eye, EyeOff } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { FilterBar } from "@/components/admin/FilterBar";
import { StatCard } from "@/components/admin/StatCard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getUsuarios, createUsuario, ApiError, type UsuarioAdminAPI } from "@/lib/api";

const rolLabel: Record<string, string> = {
  admin:      "Administrador",
  ciudadano:  "Ciudadano",
};

const rolBadgeClass: Record<string, string> = {
  admin:     "bg-primary/10 text-primary border border-primary/20",
  ciudadano: "bg-muted text-muted-foreground border border-border",
};

const filtroRol = [
  { label: "Todos", value: "todos" },
  { label: "Administradores", value: "admin" },
  { label: "Ciudadanos", value: "ciudadano" },
];

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const columns: Column<UsuarioAdminAPI>[] = [
  {
    key: "nombre",
    header: "Nombre",
    render: (u) => (
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <span className="font-medium text-sm">{u.nombre}</span>
      </div>
    ),
  },
  {
    key: "correo",
    header: "Correo",
    render: (u) => <span className="text-sm text-muted-foreground">{u.correo}</span>,
  },
  {
    key: "rol",
    header: "Rol",
    render: (u) => (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${rolBadgeClass[u.rol] ?? rolBadgeClass.ciudadano}`}>
        {rolLabel[u.rol] ?? u.rol}
      </span>
    ),
  },
  {
    key: "creadoEn",
    header: "Registro",
    render: (u) => (
      <span className="text-sm text-muted-foreground">{formatDate(u.creadoEn)}</span>
    ),
  },
];

const FORM_INITIAL = { nombre: "", correo: "", contrasena: "", rol: "ciudadano" as "admin" | "ciudadano" };

export default function UsuariosLista() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";
  function setSearch(value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set("q", value); else next.delete("q");
      return next;
    });
  }
  const [filtroRolVal, setFiltroRolVal] = useState("todos");
  const [showFiltros, setShowFiltros] = useState(false);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Modal crear usuario
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(FORM_INITIAL);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const crearMutation = useMutation({
    mutationFn: createUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast({ title: "Usuario creado correctamente" });
      setShowModal(false);
      setForm(FORM_INITIAL);
      setFormError(null);
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError
          ? (err.data as { error?: string })?.error ?? "Error al crear el usuario"
          : "No se pudo conectar con el servidor";
      setFormError(msg);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    crearMutation.mutate(form);
  }

  function handleCloseModal() {
    setShowModal(false);
    setForm(FORM_INITIAL);
    setFormError(null);
    setMostrarContrasena(false);
  }

  const { data: usuarios = [], isLoading, isError } = useQuery({
    queryKey: ["usuarios"],
    queryFn: getUsuarios,
  });

  const filtered = useMemo(() => {
    return usuarios.filter((u) => {
      if (filtroRolVal !== "todos" && u.rol !== filtroRolVal) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!u.nombre.toLowerCase().includes(s) && !u.correo.toLowerCase().includes(s)) return false;
      }
      if (fechaDesde && u.creadoEn.slice(0, 10) < fechaDesde) return false;
      if (fechaHasta && u.creadoEn.slice(0, 10) > fechaHasta) return false;
      return true;
    });
  }, [usuarios, search, filtroRolVal, fechaDesde, fechaHasta]);

  const hayFiltrosActivos = filtroRolVal !== "todos" || !!fechaDesde || !!fechaHasta;

  function limpiarFiltros() {
    setFiltroRolVal("todos");
    setFechaDesde("");
    setFechaHasta("");
  }

  const totalAdmin = usuarios.filter((u) => u.rol === "admin").length;
  const totalCiudadanos = usuarios.filter((u) => u.rol === "ciudadano").length;

  return (
    <AppLayout>
      <PageHeader
        title="Usuarios"
        description="Cuentas registradas en el sistema"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total usuarios" value={usuarios.length} icon={Users} iconBg="bg-gray-100" iconColor="text-gray-500" />
        <StatCard title="Administradores" value={totalAdmin} icon={ShieldCheck} iconBg="bg-green-100" iconColor="text-green-600" />
        <StatCard title="Ciudadanos" value={totalCiudadanos} icon={User} iconBg="bg-blue-100" iconColor="text-blue-600" />
      </div>

      <FilterBar
        searchPlaceholder="Buscar por nombre o correo..."
        onSearch={setSearch}
        filters={[
          { label: "Rol", options: filtroRol, value: filtroRolVal, onChange: setFiltroRolVal },
        ]}
        onToggleFiltros={() => setShowFiltros((v) => !v)}
        filtrosActivos={hayFiltrosActivos}
      />

      {showFiltros && (
        <div className="mb-4 p-4 rounded-lg border border-border bg-muted/30 flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Registro desde</Label>
            <Input
              type="date"
              className="h-9 text-sm w-40"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Registro hasta</Label>
            <Input
              type="date"
              className="h-9 text-sm w-40"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>
          {hayFiltrosActivos && (
            <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-muted-foreground" onClick={limpiarFiltros}>
              <X className="h-3.5 w-3.5" />
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

      {isError && (
        <EmptyState
          title="Error al cargar usuarios"
          description="No se pudo conectar con el servidor. Verifica que el backend esté en ejecución."
        />
      )}

      {!isError && (
        <DataTable
          columns={columns as any}
          data={isLoading ? [] : (filtered as any)}
          emptyMessage={isLoading ? "Cargando usuarios..." : "No se encontraron usuarios con los filtros aplicados."}
        />
      )}

      <Dialog open={showModal} onOpenChange={(open) => { if (!open) handleCloseModal(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label htmlFor="u-nombre">Nombre</Label>
              <Input
                id="u-nombre"
                placeholder="Nombre completo"
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="u-correo">Correo electrónico</Label>
              <Input
                id="u-correo"
                type="email"
                placeholder="correo@ejemplo.com"
                value={form.correo}
                onChange={(e) => setForm((f) => ({ ...f, correo: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="u-contrasena">Contraseña</Label>
              <div className="relative">
                <Input
                  id="u-contrasena"
                  type={mostrarContrasena ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={form.contrasena}
                  onChange={(e) => setForm((f) => ({ ...f, contrasena: e.target.value }))}
                  required
                  minLength={6}
                  className="pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setMostrarContrasena((v) => !v)}
                >
                  {mostrarContrasena ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="u-rol">Rol</Label>
              <Select
                value={form.rol}
                onValueChange={(v) => setForm((f) => ({ ...f, rol: v as "admin" | "ciudadano" }))}
              >
                <SelectTrigger id="u-rol">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ciudadano">Ciudadano</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formError && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {formError}
              </p>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={crearMutation.isPending}>
                {crearMutation.isPending ? "Creando..." : "Crear usuario"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
