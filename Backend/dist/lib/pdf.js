"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.htmlToPdf = htmlToPdf;
exports.resolverRutaPdf = resolverRutaPdf;
const puppeteer_1 = __importDefault(require("puppeteer"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const UPLOADS_DIR = path_1.default.resolve(process.cwd(), "uploads", "contratos");
async function htmlToPdf(html, filename) {
    await promises_1.default.mkdir(UPLOADS_DIR, { recursive: true });
    const outputPath = path_1.default.join(UPLOADS_DIR, filename);
    const browser = await puppeteer_1.default.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        await page.pdf({
            path: outputPath,
            format: "Letter",
            margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
            printBackground: true,
        });
    }
    finally {
        await browser.close();
    }
    return filename;
}
function resolverRutaPdf(filename) {
    return path_1.default.join(UPLOADS_DIR, filename);
}
