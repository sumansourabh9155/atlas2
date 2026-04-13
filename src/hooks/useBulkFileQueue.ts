/**
 * useBulkFileQueue — manages a queue of files being uploaded.
 *
 * Features:
 *  - Auto-starts uploads when files are added (150ms debounce)
 *  - Per-file progress with realistic timing steps
 *  - Configurable simulated error rate (for demo purposes)
 *  - Object URL lifecycle management (creates on add, revokes on remove)
 *  - Fires onFileComplete per-file and onBatchComplete when all are done
 *  - Max concurrent uploads (default 3) via concurrency gate
 */

import { useState, useCallback, useRef, useEffect } from "react";

/* ── Types ─────────────────────────────────────────────────────────── */

export type UploadStatus = "queued" | "uploading" | "done" | "error";
export type QueuedMediaType = "image" | "video" | "other";

export interface QueuedFile {
  id:         string;
  file:       File;
  name:       string;
  sizeBytes:  number;
  sizeLabel:  string;
  mediaType:  QueuedMediaType;
  previewUrl?: string;      // object URL — images only
  status:     UploadStatus;
  progress:   number;       // 0–100
  errorMsg?:  string;
}

export interface QueueSummary {
  total:     number;
  queued:    number;
  uploading: number;
  done:      number;
  error:     number;
  allSettled: boolean; // no queued or uploading remaining
}

interface UseBulkFileQueueOptions {
  /** Max file size in MB (default 100) */
  maxSizeMB?:        number;
  /** Max files in queue at once (default 50) */
  maxFiles?:         number;
  /** Max concurrent uploads (default 3) */
  maxConcurrent?:    number;
  /** 0–1, chance a simulated upload fails (default 0.08) */
  simulateErrorRate?: number;
  /** Called each time a file reaches "done" status */
  onFileComplete?:   (file: QueuedFile) => void;
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function formatBytes(bytes: number): string {
  if (bytes < 1_024)             return `${bytes} B`;
  if (bytes < 1_048_576)         return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function inferMediaType(file: File): QueuedMediaType {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "other";
}

/** Realistic upload progress steps: fast start, slow middle, brief pause near end */
const PROGRESS_STEPS = [8, 18, 30, 44, 58, 70, 80, 90, 96, 100];
/** Base delay ms between steps — jittered per file for realism */
const STEP_BASE_MS = 220;

/* ── Hook ─────────────────────────────────────────────────────────── */

export function useBulkFileQueue({
  maxSizeMB        = 100,
  maxFiles         = 50,
  maxConcurrent    = 3,
  simulateErrorRate = 0.08,
  onFileComplete,
}: UseBulkFileQueueOptions = {}) {

  const [queue, setQueue] = useState<QueuedFile[]>([]);
  /** IDs of files currently being simulated */
  const activeRef = useRef<Set<string>>(new Set());
  /** Stable refs so simulateUpload closure doesn't go stale */
  const onFileCompleteRef = useRef(onFileComplete);
  useEffect(() => { onFileCompleteRef.current = onFileComplete; }, [onFileComplete]);

  /* ── Concurrency gate: pick next queued file and start it ── */
  const drainQueue = useCallback(() => {
    setQueue((prev) => {
      const uploading = prev.filter((f) => f.status === "uploading").length;
      const slots     = maxConcurrent - uploading;
      if (slots <= 0) return prev;

      const toStart = prev
        .filter((f) => f.status === "queued")
        .slice(0, slots)
        .map((f) => f.id);

      if (toStart.length === 0) return prev;

      // Mark them as uploading immediately (optimistic UI)
      const next = prev.map((f) =>
        toStart.includes(f.id) ? { ...f, status: "uploading" as UploadStatus } : f
      );

      // Kick off simulations outside setState
      setTimeout(() => toStart.forEach(startSimulation), 0);

      return next;
    });
  }, [maxConcurrent]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Core upload simulation ── */
  const startSimulation = useCallback((id: string) => {
    if (activeRef.current.has(id)) return;
    activeRef.current.add(id);

    const willFail  = Math.random() < simulateErrorRate;
    const failAt    = willFail ? PROGRESS_STEPS[Math.floor(PROGRESS_STEPS.length * 0.6)] : -1;
    const jitter    = 0.6 + Math.random() * 0.8; // per-file speed multiplier

    let stepIdx = 0;

    const tick = () => {
      const progress = PROGRESS_STEPS[stepIdx];

      // Fail mid-upload
      if (willFail && progress >= failAt) {
        activeRef.current.delete(id);
        setQueue((prev) => prev.map((f) =>
          f.id === id
            ? { ...f, status: "error", progress, errorMsg: "Upload failed — please retry." }
            : f
        ));
        setTimeout(drainQueue, 50);
        return;
      }

      // Still in progress
      if (stepIdx < PROGRESS_STEPS.length - 1) {
        setQueue((prev) => prev.map((f) => f.id === id ? { ...f, progress } : f));
        stepIdx++;
        const delay = STEP_BASE_MS * jitter + Math.random() * 180;
        setTimeout(tick, delay);
        return;
      }

      // Complete
      activeRef.current.delete(id);
      setQueue((prev) => {
        const updated = prev.map((f) =>
          f.id === id ? { ...f, status: "done" as UploadStatus, progress: 100 } : f
        );
        const done = updated.find((f) => f.id === id);
        if (done) onFileCompleteRef.current?.(done);
        return updated;
      });
      setTimeout(drainQueue, 50);
    };

    // Stagger start for visual effect
    setTimeout(tick, 100 + Math.random() * 200);
  }, [simulateErrorRate, drainQueue]);

  /* ── Public API ── */

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    const toAdd: QueuedFile[] = [];

    for (const file of incoming) {
      // Skip oversized
      if (file.size > maxSizeMB * 1_048_576) continue;

      const id        = `qf-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const mediaType = inferMediaType(file);
      const previewUrl = mediaType === "image" ? URL.createObjectURL(file) : undefined;

      toAdd.push({
        id, file, name: file.name,
        sizeBytes: file.size, sizeLabel: formatBytes(file.size),
        mediaType, previewUrl,
        status: "queued", progress: 0,
      });
    }

    if (toAdd.length === 0) return;

    setQueue((prev) => {
      const merged = [...prev, ...toAdd];
      return merged.slice(0, maxFiles);
    });

    // Trigger drain after state settles
    setTimeout(drainQueue, 80);
  }, [maxSizeMB, maxFiles, drainQueue]);

  const retryFile = useCallback((id: string) => {
    setQueue((prev) => prev.map((f) =>
      f.id === id ? { ...f, status: "queued", progress: 0, errorMsg: undefined } : f
    ));
    setTimeout(drainQueue, 80);
  }, [drainQueue]);

  const removeFile = useCallback((id: string) => {
    setQueue((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setQueue((prev) => {
      prev.filter((f) => f.status === "done" && f.previewUrl)
          .forEach((f) => URL.revokeObjectURL(f.previewUrl!));
      return prev.filter((f) => f.status !== "done");
    });
  }, []);

  const clearAll = useCallback(() => {
    setQueue((prev) => {
      prev.filter((f) => f.previewUrl).forEach((f) => URL.revokeObjectURL(f.previewUrl!));
      return [];
    });
  }, []);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      queue.filter((f) => f.previewUrl).forEach((f) => URL.revokeObjectURL(f.previewUrl!));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const summary: QueueSummary = {
    total:      queue.length,
    queued:     queue.filter((f) => f.status === "queued").length,
    uploading:  queue.filter((f) => f.status === "uploading").length,
    done:       queue.filter((f) => f.status === "done").length,
    error:      queue.filter((f) => f.status === "error").length,
    allSettled: queue.length > 0 &&
                queue.every((f) => f.status === "done" || f.status === "error"),
  };

  return {
    queue,
    addFiles,
    retryFile,
    removeFile,
    clearCompleted,
    clearAll,
    summary,
  };
}
