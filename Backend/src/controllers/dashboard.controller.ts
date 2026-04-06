import type { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";

export const dashboardController = {
  async getAdminDashboard(req: Request, res: Response) {
    try {
      const data = await dashboardService.getAdminDashboard();
      res.json(data);
    } catch (error) {
      console.error("[dashboard] Error:", error);
      res.status(500).json({ error: "Error al obtener datos del dashboard" });
    }
  },
};
