import express from "express";
import cors from "cors";
import pool from "./lib/db";
import espaciosRoutes from "./routes/espacios.routes";
import reservacionesRoutes from "./routes/reservaciones.routes";
import pagosRoutes from "./routes/pagos.routes";
import documentosRoutes from "./routes/documentos.routes";

const app = express();

app.use(cors());
app.use(express.json());

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

app.use("/api/espacios", espaciosRoutes);
app.use("/api/reservaciones", reservacionesRoutes);
app.use("/api/pagos", pagosRoutes);
app.use("/api/documentos", documentosRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});