import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import pool from "./lib/db";
import espaciosRoutes from "./routes/espacios.routes";
import reservacionesRoutes from "./routes/reservaciones.routes";
import pagosRoutes from "./routes/pagos.routes";
import documentosRoutes from "./routes/documentos.routes";
import authRoutes from "./routes/auth.routes";
import usuariosRoutes from "./routes/usuarios.routes";
import mantenimientosRoutes from "./routes/mantenimientos.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import imagenesRoutes from "./routes/imagenes.routes";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/", (_req, res) => {
  res.send("Backend Nopales activo");
});

app.get("/api/health", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 as ok");
    res.json({ ok: true, db: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: "DB connection failed" });
  }
});

app.get("/api/health-basic", (_req, res) => {
  res.json({ ok: true, message: "API funcionando" });
});

app.use("/api/auth", authRoutes);
app.use("/api/espacios", espaciosRoutes);
app.use("/api/reservaciones", reservacionesRoutes);
app.use("/api/pagos", pagosRoutes);
app.use("/api/documentos", documentosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/mantenimientos", mantenimientosRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/espacios/:id/imagenes", imagenesRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});