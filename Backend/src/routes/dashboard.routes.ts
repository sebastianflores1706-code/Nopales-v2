import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";

const router = Router();

router.get("/admin", dashboardController.getAdminDashboard);

export default router;
