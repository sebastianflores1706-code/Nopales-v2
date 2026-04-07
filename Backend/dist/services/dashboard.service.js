"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = void 0;
const dashboard_repository_1 = require("../repositories/dashboard.repository");
exports.dashboardService = {
    async getAdminDashboard() {
        const [metricas, espaciosMasUtilizados, actividadReciente, solicitudesPendientes] = await Promise.all([
            dashboard_repository_1.dashboardRepository.getMetricas(),
            dashboard_repository_1.dashboardRepository.getEspaciosMasUtilizados(),
            dashboard_repository_1.dashboardRepository.getActividadReciente(),
            dashboard_repository_1.dashboardRepository.getSolicitudesPendientes(),
        ]);
        return { metricas, espaciosMasUtilizados, actividadReciente, solicitudesPendientes };
    },
};
