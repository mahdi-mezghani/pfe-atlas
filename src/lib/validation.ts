import { z } from "zod";

// ---------- Auth ----------
export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "Email is required" })
  .max(255, { message: "Email must be under 255 characters" })
  .email({ message: "Enter a valid email address" });

export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(72, { message: "Password must be under 72 characters" })
  .regex(/[a-z]/, { message: "Include at least one lowercase letter" })
  .regex(/[A-Z]/, { message: "Include at least one uppercase letter" })
  .regex(/[0-9]/, { message: "Include at least one number" });

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required" }).max(72),
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// ---------- Uploads ----------
export const MAX_PDF_BYTES = 25 * 1024 * 1024; // 25 MB
export const MAX_RAW_TEXT_CHARS = 400_000;

/** Validates a user-selected file before it ever reaches storage. */
export function validatePdfFile(file: File): { ok: true } | { ok: false; message: string } {
  if (file.size === 0) return { ok: false, message: "That file is empty." };
  if (file.size > MAX_PDF_BYTES) {
    return { ok: false, message: `PDF is too large (max ${Math.round(MAX_PDF_BYTES / 1024 / 1024)} MB).` };
  }
  const nameOk = /\.pdf$/i.test(file.name);
  const typeOk = file.type === "application/pdf" || file.type === "";
  if (!nameOk || !typeOk) return { ok: false, message: "Only PDF files are supported." };
  return { ok: true };
}

/** Confirms the file really starts with the %PDF- magic bytes (defeats renamed files). */
export async function hasPdfMagicBytes(file: File): Promise<boolean> {
  const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return String.fromCharCode(...header) === "%PDF-";
}

/** Strips path traversal, control chars, and unsafe characters from a stored filename. */
export function sanitizeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "file.pdf";
  const cleaned = base
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^[.-]+/, "")
    .slice(0, 120);
  return cleaned.toLowerCase().endsWith(".pdf") ? cleaned : `${cleaned || "report"}.pdf`;
}
