"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
exports.dashboardController = {
    async getAdminDashboard(req, res) {
        try {
            const data = await dashboard_service_1.dashboardService.getAdminDashboard();
            res.json(data);
        }
        catch (error) {
            console.error("[dashboard] Error:", error);
            res.status(500).json({ error: "Error al obtener datos del dashboard" });
        }
    },
};
