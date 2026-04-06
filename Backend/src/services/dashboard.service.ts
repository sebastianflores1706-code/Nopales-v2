import { dashboardRepository } from "../repositories/dashboard.repository";

export const dashboardService = {
  async getAdminDashboard() {
    const [metricas, espaciosMasUtilizados, actividadReciente, solicitudesPendientes] =
      await Promise.all([
        dashboardRepository.getMetricas(),
        dashboardRepository.getEspaciosMasUtilizados(),
        dashboardRepository.getActividadReciente(),
        dashboardRepository.getSolicitudesPendientes(),
      ]);

    return { metricas, espaciosMasUtilizados, actividadReciente, solicitudesPendientes };
  },
};
