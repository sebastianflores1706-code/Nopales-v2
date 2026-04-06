import path from "path";
import type { Request, Response } from "express";
import { documentosService } from "../services/documentos.service";
import { documentosRepository } from "../repositories/documentos.repository";
import { generarContratoSchema } from "../validators/documentos.schema";
import { resolverRutaPdf } from "../lib/pdf";

export const documentosController = {
  async getAll(_req: Request, res: Response) {
    try {
      const documentos = await documentosService.getAll();
      res.json(documentos);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  },

  async getByReservacionId(req: Request, res: Response) {
    try {
      const documentos = await documentosService.getByReservacionId(req.params.reservacionId);
      res.json(documentos);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  },

  async getMios(req: Request, res: Response) {
    try {
      const { id: usuarioId } = req.usuario!;
      const documentos = await documentosService.getMios(usuarioId);
      res.json(documentos);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  },

  async generarContrato(req: Request, res: Response) {
    const result = generarContratoSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: result.error.flatten(),
      });
    }

    try {
      const { duplicado, documento } = await documentosService.generarContrato(result.data);

      if (duplicado) {
        return res.status(409).json({
          error: "Ya existe un contrato para esta reservación",
          documento,
        });
      }

      return res.status(201).json(documento);
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  },

  async generarPdf(req: Request, res: Response) {
    try {
      const doc = await documentosService.generarPdf(req.params.id);
      res.json(doc);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  },

  async servirPdf(req: Request, res: Response) {
    try {
      const doc = await documentosRepository.findById(req.params.id);
      if (!doc?.pdfPath) {
        return res.status(404).json({ error: "PDF no generado aún" });
      }

      const rutaAbsoluta = resolverRutaPdf(doc.pdfPath);
      const download = req.query.download === "1";

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `${download ? "attachment" : "inline"}; filename="${path.basename(doc.pdfPath)}"`
      );

      res.sendFile(rutaAbsoluta, (err) => {
        if (err) res.status(404).json({ error: "Archivo no encontrado en disco" });
      });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  },
};
