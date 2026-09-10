"use client";

import { useCallback, useRef, useState } from "react";
import { AlertIcon, CloseIcon, UploadIcon } from "@/components/Icon";
import styles from "./documents.module.css";

const ALLOWED = /\.(pdf|docx|md)$/i;

type DocStatus = "ready" | "uploading" | "uploaded";

interface DocEntry {
  id: string;
  file: File;
  ext: string;
  status: DocStatus;
}

let counter = 0;
const nextId = () => `d${++counter}`;

function extOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > -1 ? name.slice(dot + 1).toLowerCase() : "";
}

function sizeLabel(bytes: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const BADGE_CLASS: Record<string, string> = {
  pdf: styles.badgePdf,
  docx: styles.badgeDocx,
  md: styles.badgeMd,
};

/**
 * Documents Upload — HR admins drag policy documents (.pdf, .docx, .md) here.
 * Files are validated client-side, then POSTed to /api/documents on "Upload".
 */
export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocEntry[]>([]);
  const [dragging, setDragging] = useState(false);
  const [skipped, setSkipped] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const incoming: DocEntry[] = [];
    let skippedCount = 0;
    for (const file of Array.from(fileList)) {
      if (!ALLOWED.test(file.name)) {
        skippedCount += 1;
        continue;
      }
      incoming.push({ id: nextId(), file, ext: extOf(file.name), status: "ready" });
    }
    setSkipped(skippedCount);
    if (incoming.length) setDocs((prev) => [...prev, ...incoming]);
  }, []);

  const remove = (id: string) =>
    setDocs((prev) => prev.filter((d) => d.id !== id));

  const upload = useCallback(async () => {
    const ready = docs.filter((d) => d.status === "ready");
    if (ready.length === 0) return;

    const readyIds = new Set(ready.map((d) => d.id));
    setDocs((prev) =>
      prev.map((d) => (readyIds.has(d.id) ? { ...d, status: "uploading" } : d)),
    );

    const form = new FormData();
    ready.forEach((d) => form.append("files", d.file, d.file.name));

    try {
      const res = await fetch("/api/documents", { method: "POST", body: form });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      setDocs((prev) =>
        prev.map((d) => (readyIds.has(d.id) ? { ...d, status: "uploaded" } : d)),
      );
    } catch {
      setDocs((prev) =>
        prev.map((d) => (readyIds.has(d.id) ? { ...d, status: "ready" } : d)),
      );
    }
  }, [docs]);

  const readyCount = docs.filter((d) => d.status === "ready").length;
  const uploading = docs.some((d) => d.status === "uploading");

  return (
    <div className={styles.page}>
      <div className={styles.titleBar}>
        <div className={styles.titleInner}>
          <h1>Documents Upload</h1>
          <p>
            Add policy documents to the portal. Supported formats: PDF, Word
            (.docx), and Markdown (.md).
          </p>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.bodyInner}>
          <button
            type="button"
            className={
              dragging ? `${styles.dropzone} ${styles.dropzoneActive}` : styles.dropzone
            }
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              if (!dragging) setDragging(true);
            }}
            onDragLeave={(e) => {
              if (e.currentTarget.contains(e.relatedTarget as Node)) return;
              setDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
          >
            <span className={styles.dropIcon}>
              <UploadIcon size={23} />
            </span>
            <span className={styles.dropTitle}>Drag and drop files here</span>
            <span className={styles.dropHint}>
              or <span className={styles.dropBrowse}>browse your computer</span>
            </span>
            <span className={styles.dropMeta}>PDF, DOCX, or MD · up to 25 MB each</span>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.md"
              className={styles.fileInput}
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </button>

          {skipped > 0 && (
            <div className={styles.skipped}>
              <AlertIcon size={15} />
              {skipped === 1
                ? "1 file was skipped — unsupported format."
                : `${skipped} files were skipped — unsupported format.`}
            </div>
          )}

          <div className={styles.listSection}>
            <div className={styles.listHead}>
              <h2>Added documents</h2>
              <span>
                {docs.length === 0
                  ? ""
                  : docs.length === 1
                    ? "1 file"
                    : `${docs.length} files`}
              </span>
            </div>

            {docs.length === 0 ? (
              <div className={styles.emptyList}>No documents added yet.</div>
            ) : (
              <div className={styles.list}>
                {docs.map((d) => (
                  <div key={d.id} className={styles.row}>
                    <span className={`${styles.badge} ${BADGE_CLASS[d.ext] ?? styles.badgeMd}`}>
                      {d.ext.toUpperCase()}
                    </span>
                    <div className={styles.rowMain}>
                      <div className={styles.rowName}>{d.file.name}</div>
                      <div className={styles.rowSize}>{sizeLabel(d.file.size)}</div>
                    </div>
                    <span
                      className={
                        d.status === "uploaded"
                          ? `${styles.status} ${styles.statusDone}`
                          : `${styles.status} ${styles.statusPending}`
                      }
                    >
                      {d.status === "uploaded"
                        ? "Uploaded"
                        : d.status === "uploading"
                          ? "Uploading…"
                          : "Ready to upload"}
                    </span>
                    <button
                      type="button"
                      className={styles.removeButton}
                      aria-label={`Remove ${d.file.name}`}
                      onClick={() => remove(d.id)}
                    >
                      <CloseIcon size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.actionBar}>
        <div className={styles.actionInner}>
          <span className={styles.actionNote}>
            {docs.length === 0
              ? "Nothing to upload yet"
              : readyCount === 0
                ? "All added documents uploaded"
                : readyCount === 1
                  ? "1 document ready to upload"
                  : `${readyCount} documents ready to upload`}
          </span>
          <button
            type="button"
            className={styles.uploadButton}
            onClick={upload}
            disabled={readyCount === 0 || uploading}
          >
            {readyCount === 0
              ? "Upload"
              : readyCount === 1
                ? "Upload 1 document"
                : `Upload ${readyCount} documents`}
          </button>
        </div>
      </div>
    </div>
  );
}
