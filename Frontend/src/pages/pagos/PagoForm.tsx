import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getReservaciones, type ReservacionAPI } from "@/lib/api";

const API_BASE = "http://localhost:3000";

const METODOS_PAGO = [
  { label: "Transferencia bancaria", value: "transferencia" },
  { label: "Efectivo", value: "efectivo" },
  { label: "Tarjeta", value: "tarjeta" },
];

function formatCurrency(value: number): string {
  return value.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

export default function PagoForm() {
  const navigate = useNavigate();

  const [reservaciones, setReservaciones] = useState<ReservacionAPI[]>([]);
  const [loadingReservaciones, setLoadingReservaciones] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [reservacionId, setReservacionId] = useState("");
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState("");
  const [referencia, setReferencia] = useState("");
  const [fechaPago, setFechaPago] = useState("");
  const [concepto, setConcepto] = useState("");

  const reservacionSeleccionada = reservaciones.find((r) => r.id === reservacionId) ?? null;

  useEffect(() => {
    getReservaciones()
      .then((data) => {
        const aprobadas = data.filter((r) => {
          if (r.estado !== "aprobada") return false;
          // Si montoTotal es 0 o no se conoce el costo del espacio,
          // mostrar la reservación igualmente (el usuario ingresa el monto).
          // Solo excluir si se conoce el total Y ya está completamente pagado.
          if (r.montoTotal > 0 && r.totalPagado >= r.montoTotal) return false;
          return true;
        });
        setReservaciones(aprobadas);
      })
      .catch(() => toast.error("No se pudieron cargar las reservaciones"))
      .finally(() => setLoadingReservaciones(false));
  }, []);

  function handleSelectReservacion(id: string) {
    setReservacionId(id);
    const r = reservaciones.find((res) => res.id === id);
    if (r && r.saldoPendiente > 0) setMonto(String(r.saldoPendiente));
    else setMonto("");
  }

  function validar(): string | null {
    if (!reservacionId) return "Selecciona una reservación";
    if (!metodo) return "Selecciona un método de pago";
    if (!fechaPago) return "Ingresa la fecha de pago";
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) return "El monto debe ser mayor a 0";
    if (
      reservacionSeleccionada &&
      reservacionSeleccionada.saldoPendiente > 0 &&
      montoNum > reservacionSeleccionada.saldoPendiente
    ) {
      return `El monto no puede superar el saldo pendiente (${formatCurrency(reservacionSeleccionada.saldoPendiente)})`;
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const error = validar();
    if (error) {
      toast.error(error);
      return;
    }

    const montoNum = parseFloat(monto);
    const estado =
      reservacionSeleccionada &&
      reservacionSeleccionada.saldoPendiente > 0 &&
      montoNum >= reservacionSeleccionada.saldoPendiente
        ? "pagado"
        : "pendiente";

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/pagos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservacionId,
          monto: montoNum,
          metodo,
          referencia: referencia.trim() || undefined,
          fechaPago,
          estado,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Error al registrar pago");
      }

      toast.success("Pago registrado correctamente");
      navigate("/pagos");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/pagos")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Registrar pago</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Registra un pago asociado a una reservación</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Datos del pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Reservación *</Label>
                  <Select
                    value={reservacionId}
                    onValueChange={handleSelectReservacion}
                    disabled={loadingReservaciones}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue
                        placeholder={loadingReservaciones ? "Cargando..." : "Seleccionar reservación"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {reservaciones.length === 0 && !loadingReservaciones && (
                        <SelectItem value="__empty" disabled>
                          No hay reservaciones con saldo pendiente
                        </SelectItem>
                      )}
                      {reservaciones.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.folio} — {r.espacioNombre} — {r.solicitanteNombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Monto *</Label>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      placeholder="0.00"
                      className="mt-1.5"
                    />
                    {reservacionSeleccionada && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Saldo pendiente: {formatCurrency(reservacionSeleccionada.saldoPendiente)}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Método de pago *</Label>
                    <Select value={metodo} onValueChange={setMetodo}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                      <SelectContent>
                        {METODOS_PAGO.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Referencia</Label>
                    <Input
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      placeholder="Ej: SPEI-20260312-001"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Fecha de pago *</Label>
                    <Input
                      type="date"
                      value={fechaPago}
                      onChange={(e) => setFechaPago(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tipo de pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Concepto</Label>
                  <Select value={concepto} onValueChange={setConcepto}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Seleccionar concepto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pago_total">Pago total</SelectItem>
                      <SelectItem value="anticipo">Anticipo</SelectItem>
                      <SelectItem value="saldo">Liquidación de saldo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {reservacionSeleccionada ? (
                  <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Resumen</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Total reservación</span>
                      <span>{formatCurrency(reservacionSeleccionada.montoTotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Ya pagado</span>
                      <span>{formatCurrency(reservacionSeleccionada.totalPagado)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium border-t pt-1.5 mt-1.5">
                      <span>Saldo pendiente</span>
                      <span>{formatCurrency(reservacionSeleccionada.saldoPendiente)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-3 text-sm">
                    <p className="text-xs font-medium text-muted-foreground">Instrucciones</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Selecciona la reservación para ver el monto pendiente.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2 mt-6">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Registrando..." : "Registrar pago"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/pagos")}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
