"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const db_postgres_1 = __importDefault(require("./lib/db.postgres"));
const espacios_routes_1 = __importDefault(require("./routes/espacios.routes"));
const reservaciones_routes_1 = __importDefault(require("./routes/reservaciones.routes"));
const pagos_routes_1 = __importDefault(require("./routes/pagos.routes"));
const documentos_routes_1 = __importDefault(require("./routes/documentos.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const usuarios_routes_1 = __importDefault(require("./routes/usuarios.routes"));
const mantenimientos_routes_1 = __importDefault(require("./routes/mantenimientos.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const imagenes_routes_1 = __importDefault(require("./routes/imagenes.routes"));
const app = (0, express_1.default)();
const ORIGIN = process.env.FRONTEND_URL ?? "http://localhost:5173";
app.use((0, cors_1.default)({
    origin: ORIGIN,
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use("/uploads", express_1.default.static(path_1.default.resolve(process.cwd(), "uploads")));
app.get("/", (_req, res) => {
    res.send("Backend Nopales activo");
});
app.get("/api/health", async (_req, res) => {
    try {
        const { rows } = await db_postgres_1.default.query("SELECT 1 as ok");
        res.json({ ok: true, db: rows });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, error: "DB connection failed" });
    }
});
app.get("/api/health-basic", (_req, res) => {
    res.json({ ok: true, message: "API funcionando" });
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/espacios", espacios_routes_1.default);
app.use("/api/reservaciones", reservaciones_routes_1.default);
app.use("/api/pagos", pagos_routes_1.default);
app.use("/api/documentos", documentos_routes_1.default);
app.use("/api/usuarios", usuarios_routes_1.default);
app.use("/api/mantenimientos", mantenimientos_routes_1.default);
app.use("/api/dashboard", dashboard_routes_1.default);
app.use("/api/espacios/:id/imagenes", imagenes_routes_1.default);
const PORT = Number(process.env.NODE_PORT) || 3000;
app.listen(PORT, () => {
    console.log(`[server] Puerto:  ${PORT}`);
    console.log(`[server] CORS:    ${ORIGIN}`);
    console.log(`[server] DB:      ${process.env.PG_HOST ?? "localhost"}:${process.env.PG_PORT ?? 5432}/${process.env.PG_NAME ?? "nopales"}`);
});
