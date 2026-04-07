"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const host = process.env.PG_HOST || "localhost";
const port = Number(process.env.PG_PORT || 5432);
const user = process.env.PG_USER || "postgres";
const password = process.env.PG_PASSWORD || undefined; // "" → undefined (pg lo requiere así)
const database = process.env.PG_NAME || "nopales";
if (!database) {
    throw new Error("PG_NAME no está definido en las variables de entorno");
}
const pool = new pg_1.Pool({ host, port, user, password, database, max: 10 });
exports.default = pool;
