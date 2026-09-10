/**
 * Accepts policy document uploads (multipart/form-data, field name "files").
 *
 * v0 validates the extension and echoes back accepted-file metadata — nothing
 * is persisted. Add real storage next (object storage for the file, a row per
 * document, then kick off parsing/indexing for the Policies Assistant).
 */

export const runtime = "nodejs";

const ALLOWED = /\.(pdf|docx|md)$/i;
const MAX_BYTES = 25 * 1024 * 1024;

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return Response.json({ error: "No files provided" }, { status: 400 });
  }

  const accepted: { name: string; size: number; type: string }[] = [];
  const rejected: { name: string; reason: string }[] = [];

  for (const file of files) {
    if (!ALLOWED.test(file.name)) {
      rejected.push({ name: file.name, reason: "unsupported format" });
    } else if (file.size > MAX_BYTES) {
      rejected.push({ name: file.name, reason: "exceeds 25 MB" });
    } else {
      // TODO: stream `file` to storage and create a document record here.
      accepted.push({ name: file.name, size: file.size, type: file.type });
    }
  }

  return Response.json({ accepted, rejected });
}
