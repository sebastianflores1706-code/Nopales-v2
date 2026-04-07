"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuarios_controller_1 = require("../controllers/usuarios.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.requireAuth, usuarios_controller_1.usuariosController.getAll);
router.post("/", auth_middleware_1.requireAuth, usuarios_controller_1.usuariosController.create);
exports.default = router;
