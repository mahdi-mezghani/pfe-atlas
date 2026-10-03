// Client-side PDF text extraction using pdf.js.
import * as pdfjs from "pdfjs-dist";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite ?url import
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const STANDARD_FONT_DATA_URL = "/pdfjs-standard-fonts/";

export async function extractPdfText(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const pdfData = new Uint8Array(buf);

  let doc: pdfjs.PDFDocumentProxy;
  try {
    doc = await pdfjs.getDocument({
      data: pdfData,
      standardFontDataUrl: STANDARD_FONT_DATA_URL,
    }).promise;
  } catch (error) {
    if (error instanceof pdfjs.PasswordException) {
      throw new Error("This PDF is password protected and cannot be extracted.");
    }
    throw error;
  }

  const pages: string[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const lines: string[] = [];
    let currentLine = "";
    let previousY: number | undefined;

    for (const item of tc.items as { str?: string; transform?: number[] }[]) {
      const text = item.str?.trim();
      if (!text) continue;
      const y = item.transform?.[5];
      if (previousY !== undefined && y !== undefined && Math.abs(previousY - y) > 2) {
        if (currentLine.trim()) lines.push(currentLine.trim());
        currentLine = "";
      }
      currentLine += `${currentLine ? " " : ""}${text}`;
      if (y !== undefined) previousY = y;
    }

    if (currentLine.trim()) lines.push(currentLine.trim());
    pages.push(lines.join("\n"));
  }

  const joined = pages.join("\n\n");
  if (!joined.trim()) {
    throw new Error("No readable text could be extracted from this PDF.");
  }

  return joined;
}
