"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentosService = void 0;
const documentos_repository_1 = require("../repositories/documentos.repository");
const reservaciones_repository_1 = require("../repositories/reservaciones.repository");
const pagos_repository_1 = require("../repositories/pagos.repository");
const pdf_1 = require("../lib/pdf");
// ---------------------------------------------------------------------------
// Generación de contenido HTML del contrato
// ---------------------------------------------------------------------------
function generarContenidoContrato(reservacion, pagos) {
    const pagosValidos = pagos.filter((p) => p.estado !== "cancelado");
    const totalPagado = pagosValidos.reduce((s, p) => s + p.monto, 0);
    const saldoPendiente = Math.max(0, reservacion.montoTotal - totalPagado);
    const estadoPago = totalPagado === 0 ? "Pendiente" : saldoPendiente > 0 ? "Anticipo registrado" : "Pagado";
    const filasPagos = pagosValidos
        .map((p, i) => `<tr>
          <td>${i + 1}</td>
          <td>$${p.monto.toLocaleString("es-MX")}</td>
          <td>${p.metodo}</td>
          <td>${p.fechaPago ?? "—"}</td>
          <td>${p.referencia ?? "—"}</td>
        </tr>`)
        .join("");
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
    td, th { padding: 5px 8px; vertical-align: top; text-align: left; }
    td:first-child { font-weight: bold; width: 40%; color: #444; }
    th { background: #f4f4f4; font-size: 11px; text-transform: uppercase; }
    .resumen td:first-child { font-weight: bold; width: 50%; color: #444; }
    .total-row td { font-weight: bold; border-top: 1px solid #ccc; }
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

  <h2>Resumen financiero</h2>
  <table class="resumen">
    <tr><td>Monto total de la reservación</td><td>$${reservacion.montoTotal.toLocaleString("es-MX")}</td></tr>
    <tr><td>Total abonado</td><td>$${totalPagado.toLocaleString("es-MX")}</td></tr>
    <tr><td>Saldo pendiente</td><td>$${saldoPendiente.toLocaleString("es-MX")}</td></tr>
    <tr><td>Estado del pago</td><td>${estadoPago}</td></tr>
  </table>

  ${pagosValidos.length > 0 ? `
  <h2>Detalle de pagos registrados</h2>
  <table>
    <thead>
      <tr><th>#</th><th>Monto</th><th>Método</th><th>Fecha</th><th>Referencia</th></tr>
    </thead>
    <tbody>
      ${filasPagos}
    </tbody>
  </table>` : ""}

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
// Enriquece un documento con datos de su reservación
// ---------------------------------------------------------------------------
async function enrich(doc) {
    if (!doc)
        return doc;
    const reservacion = await reservaciones_repository_1.reservacionesRepository.findById(doc.reservacionId);
    return {
        ...doc,
        reservacionFolio: reservacion?.folio ?? "—",
        espacioNombre: reservacion?.espacioNombre ?? "—",
        solicitanteNombre: reservacion?.solicitanteNombre ?? "—",
        fechaEvento: reservacion?.fecha ?? "—",
    };
}
// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------
exports.documentosService = {
    async getAll() {
        const docs = await documentos_repository_1.documentosRepository.findAll();
        return Promise.all(docs.map((d) => enrich(d)));
    },
    async getByReservacionId(reservacionId) {
        return documentos_repository_1.documentosRepository.findByReservacionId(reservacionId);
    },
    async getMios(usuarioId) {
        const docs = await documentos_repository_1.documentosRepository.findByUsuarioId(usuarioId);
        return Promise.all(docs.map((d) => enrich(d)));
    },
    async generarContrato(data) {
        // Regla 1: la reservación debe existir
        const reservacion = await reservaciones_repository_1.reservacionesRepository.findById(data.reservacionId);
        if (!reservacion)
            throw new Error("La reservación especificada no existe");
        // Regla 2: la reservación debe estar aprobada
        if (reservacion.estado !== "aprobada") {
            throw new Error(`Solo se puede generar contrato para reservaciones aprobadas (estado actual: ${reservacion.estado})`);
        }
        // Regla 3: el pago debe estar completado (saldo pendiente = 0)
        const pagos = await pagos_repository_1.pagosRepository.findByReservacionId(data.reservacionId);
        const pagosValidos = pagos.filter((p) => p.estado !== "cancelado");
        const totalPagado = pagosValidos.reduce((s, p) => s + p.monto, 0);
        const saldoPendiente = Math.max(0, reservacion.montoTotal - totalPagado);
        if (saldoPendiente > 0) {
            throw new Error(`No se puede generar el contrato: hay un saldo pendiente de $${saldoPendiente.toLocaleString("es-MX")}`);
        }
        // Regla 4: no generar duplicado
        const existentes = await documentos_repository_1.documentosRepository.findByReservacionId(data.reservacionId);
        const contratoExistente = existentes.find((d) => d.tipo === "contrato");
        if (contratoExistente) {
            return { duplicado: true, documento: contratoExistente };
        }
        // Generar contenido HTML con el resumen financiero completo
        const contenido = generarContenidoContrato(reservacion, pagos);
        const nombreArchivo = `contrato-${reservacion.folio}.html`;
        const documento = await documentos_repository_1.documentosRepository.create({
            reservacionId: data.reservacionId,
            tipo: "contrato",
            nombreArchivo,
            contenido,
        });
        return { duplicado: false, documento };
    },
    async generarPdf(documentoId) {
        const doc = await documentos_repository_1.documentosRepository.findById(documentoId);
        if (!doc)
            throw new Error("Documento no encontrado");
        // Si ya tiene PDF en disco, devolver sin regenerar
        if (doc.pdfPath)
            return doc;
        const pdfFilename = doc.nombreArchivo.replace(/\.html$/, ".pdf");
        await (0, pdf_1.htmlToPdf)(doc.contenido, pdfFilename);
        return documentos_repository_1.documentosRepository.updatePdfPath(documentoId, pdfFilename);
    },
};
