"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImagenes = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const fs_1 = __importDefault(require("fs"));
const UPLOADS_DIR = path_1.default.resolve(process.cwd(), "uploads", "espacios");
if (!fs_1.default.existsSync(UPLOADS_DIR))
    fs_1.default.mkdirSync(UPLOADS_DIR, { recursive: true });
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        cb(null, `${(0, crypto_1.randomUUID)()}${ext}`);
    },
});
const fileFilter = (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext))
        cb(null, true);
    else
        cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP"));
};
exports.uploadImagenes = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024, files: 6 },
});
