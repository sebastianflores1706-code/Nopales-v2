import puppeteer from "puppeteer";
import path from "path";
import fs from "fs/promises";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads", "contratos");

export async function htmlToPdf(html: string, filename: string): Promise<string> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const outputPath = path.join(UPLOADS_DIR, filename);

  const browser = await puppeteer.launch({
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
  } finally {
    await browser.close();
  }

  return filename;
}

export function resolverRutaPdf(filename: string): string {
  return path.join(UPLOADS_DIR, filename);
}
