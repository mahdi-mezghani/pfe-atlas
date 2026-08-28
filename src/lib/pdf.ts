// Client-side PDF text extraction using pdf.js.
import * as pdfjs from "pdfjs-dist";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite ?url import
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export async function extractPdfText(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  // Keep extraction in the browser's main thread; the Vite worker can stall without rejecting.
  const doc = await pdfjs.getDocument({ data: buf, disableWorker: true }).promise;
  const pages: string[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const text = tc.items
      .map((it: unknown) => (it as { str?: string }).str ?? "")
      .join(" ");
    pages.push(text);
  }
  return pages.join("\n\n");
}
