import { documentosRepository } from "../repositories/documentos.repository";
import { reservacionesRepository } from "../repositories/reservaciones.repository";
import { pagosRepository } from "../repositories/pagos.repository";
import type { Reservacion } from "../repositories/reservaciones.repository";
import type { Pago } from "../repositories/pagos.repository";
import type { GenerarContratoDto } from "../validators/documentos.schema";

// ---------------------------------------------------------------------------
// Generación de contenido HTML del contrato
// Cuando se quiera PDF real, solo se reemplaza esta función.
// ---------------------------------------------------------------------------
function generarContenidoContrato(reservacion: Reservacion, pago: Pago): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Contrato de Uso de Espacio Público – ${reservacion.folio}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 13px; color: #111; margin: 40px; }
    h1 { text-align: center; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; }
    h2 { font-size: 13px; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-top: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    td { padding: 5px 8px; vertical-align: top; }
    td:first-child { font-weight: bold; width: 40%; color: #444; }
    .footer { margin-top: 60px; display: flex; justify-content: space-between; }
    .firma { text-align: center; width: 40%; border-top: 1px solid #000; padding-top: 6px; font-size: 11px; }
  </style>
</head>
<body>
  <h1>Contrato de Uso de Espacio Público</h1>
  <p style="text-align:center; color:#555;">Folio: ${reservacion.folio} &nbsp;|&nbsp; Generado: ${new Date().toLocaleDateString("es-MX")}</p>

  <h2>Datos del solicitante</h2>
  <table>
    <tr><td>Nombre / Institución</td><td>${reservacion.solicitanteNombre}</td></tr>
  </table>

  <h2>Datos del evento</h2>
  <table>
    <tr><td>Espacio</td><td>${reservacion.espacioNombre}</td></tr>
    <tr><td>Tipo de evento</td><td>${reservacion.tipoEvento}</td></tr>
    <tr><td>Fecha</td><td>${reservacion.fecha}</td></tr>
    <tr><td>Horario</td><td>${reservacion.horaInicio} – ${reservacion.horaFin}</td></tr>
    <tr><td>Asistentes estimados</td><td>${reservacion.asistentes} personas</td></tr>
  </table>

  <h2>Condiciones de pago</h2>
  <table>
    <tr><td>Monto total</td><td>$${pago.monto.toLocaleString("es-MX")}</td></tr>
    <tr><td>Método de pago</td><td>${pago.metodo}</td></tr>
    <tr><td>Estado del pago</td><td>${pago.estado}</td></tr>
    ${pago.referencia ? `<tr><td>Referencia</td><td>${pago.referencia}</td></tr>` : ""}
    ${pago.fechaPago ? `<tr><td>Fecha de pago</td><td>${pago.fechaPago}</td></tr>` : ""}
  </table>

  <h2>Cláusulas generales</h2>
  <p>1. El solicitante se compromete a respetar el aforo máximo permitido del espacio.</p>
  <p>2. El espacio deberá ser entregado en las mismas condiciones en que fue recibido al finalizar el evento.</p>
  <p>3. Cualquier daño causado durante el uso del espacio será responsabilidad del solicitante.</p>
  <p>4. La cancelación con menos de 72 horas de anticipación no da derecho a reembolso.</p>
  <p>5. El uso del espacio queda condicionado al cumplimiento total del pago acordado.</p>

  <div class="footer">
    <div class="firma">
      <p>${reservacion.solicitanteNombre}</p>
      <p>Solicitante</p>
    </div>
    <div class="firma">
      <p>Dirección de Espacios Públicos</p>
      <p>Municipio</p>
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------
export const documentosService = {
  getByReservacionId(reservacionId: string) {
    return documentosRepository.findByReservacionId(reservacionId);
  },

  generarContrato(data: GenerarContratoDto) {
    // Regla 1: la reservación debe existir
    const reservacion = reservacionesRepository.findById(data.reservacionId);
    if (!reservacion) throw new Error("La reservación especificada no existe");

    // Regla 2: la reservación debe estar aprobada
    if (reservacion.estado !== "aprobada") {
      throw new Error(
        `Solo se puede generar contrato para reservaciones aprobadas (estado actual: ${reservacion.estado})`
      );
    }

    // Regla 3: debe existir al menos un pago asociado
    const pagos = pagosRepository.findByReservacionId(data.reservacionId);
    if (pagos.length === 0) {
      throw new Error("No existe un pago registrado para esta reservación");
    }

    // Regla 4: no generar duplicado
    const existentes = documentosRepository.findByReservacionId(data.reservacionId);
    const contratoExistente = existentes.find((d) => d.tipo === "contrato");
    if (contratoExistente) {
      return { duplicado: true, documento: contratoExistente };
    }

    // Generar contenido HTML del contrato
    const pago = pagos[pagos.length - 1];
    const contenidoHtml = generarContenidoContrato(reservacion, pago);
    const nombreArchivo = `contrato-${reservacion.folio}-${Date.now()}.html`;

    const documento = documentosRepository.create({
      reservacionId: data.reservacionId,
      tipo: "contrato",
      nombreArchivo,
      contenidoHtml,
    });

    return { duplicado: false, documento };
  },
};
