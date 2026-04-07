"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentosController = void 0;
const path_1 = __importDefault(require("path"));
const documentos_service_1 = require("../services/documentos.service");
const documentos_repository_1 = require("../repositories/documentos.repository");
const documentos_schema_1 = require("../validators/documentos.schema");
const pdf_1 = require("../lib/pdf");
exports.documentosController = {
    async getAll(_req, res) {
        try {
            const documentos = await documentos_service_1.documentosService.getAll();
            res.json(documentos);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async getByReservacionId(req, res) {
        try {
            const documentos = await documentos_service_1.documentosService.getByReservacionId(req.params.reservacionId);
            res.json(documentos);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async getMios(req, res) {
        try {
            const { id: usuarioId } = req.usuario;
            const documentos = await documentos_service_1.documentosService.getMios(usuarioId);
            res.json(documentos);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async generarContrato(req, res) {
        const result = documentos_schema_1.generarContratoSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                error: "Datos inválidos",
                details: result.error.flatten(),
            });
        }
        try {
            const { duplicado, documento } = await documentos_service_1.documentosService.generarContrato(result.data);
            if (duplicado) {
                return res.status(409).json({
                    error: "Ya existe un contrato para esta reservación",
                    documento,
                });
            }
            return res.status(201).json(documento);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },
    async generarPdf(req, res) {
        try {
            const doc = await documentos_service_1.documentosService.generarPdf(req.params.id);
            res.json(doc);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    async servirPdf(req, res) {
        try {
            const doc = await documentos_repository_1.documentosRepository.findById(req.params.id);
            if (!doc?.pdfPath) {
                return res.status(404).json({ error: "PDF no generado aún" });
            }
            const rutaAbsoluta = (0, pdf_1.resolverRutaPdf)(doc.pdfPath);
            const download = req.query.download === "1";
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `${download ? "attachment" : "inline"}; filename="${path_1.default.basename(doc.pdfPath)}"`);
            res.sendFile(rutaAbsoluta, (err) => {
                if (err)
                    res.status(404).json({ error: "Archivo no encontrado en disco" });
            });
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
};
