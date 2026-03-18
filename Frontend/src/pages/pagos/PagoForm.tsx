import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { reservacionesMock } from "@/data/reservacionesMock";
import { metodosPago } from "@/data/pagosMock";

export default function PagoForm() {
  const navigate = useNavigate();

  const reservacionesPendientes = reservacionesMock.filter((r) => r.pago === "pendiente");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Pago registrado correctamente");
    navigate("/pagos");
  };

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
                  <Select>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Seleccionar reservación" />
                    </SelectTrigger>
                    <SelectContent>
                      {reservacionesPendientes.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.id} — {r.espacio} — {r.solicitante}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Monto *</Label>
                    <Input type="number" placeholder="0.00" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Método de pago *</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                      <SelectContent>
                        {metodosPago.map((m) => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Referencia</Label>
                    <Input placeholder="Ej: SPEI-20260312-001" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Fecha de pago *</Label>
                    <Input type="date" className="mt-1.5" />
                  </div>
                </div>

                <div>
                  <Label>Observaciones</Label>
                  <Textarea placeholder="Notas adicionales sobre el pago..." className="mt-1.5" rows={3} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Comprobante de pago</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium">Arrastra el comprobante o haz clic para seleccionar</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG o PNG (máx. 5MB)</p>
                  <Button type="button" variant="outline" size="sm" className="mt-3">
                    Seleccionar archivo
                  </Button>
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
                  <Select>
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
                <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Instrucciones</p>
                  <p className="text-xs text-muted-foreground">Selecciona la reservación para ver el monto pendiente. Adjunta el comprobante de pago para facilitar la validación.</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2 mt-6">
              <Button type="submit">Registrar pago</Button>
              <Button type="button" variant="outline" onClick={() => navigate("/pagos")}>Cancelar</Button>
            </div>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
