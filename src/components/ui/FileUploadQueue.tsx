/**
 * FileUploadQueue — visual upload queue panel.
 *
 * Displays files added by useBulkFileQueue with:
 *  - Thumbnail for images, type icon for video/other
 *  - Individual progress bars with animated fill
 *  - Status badges (queued / uploading / done / error)
 *  - Per-file remove (queued) or retry (error) actions
 *  - Summary header: progress ring + counts + bulk actions
 *  - "All done" congratulation state
 *
 * Usage:
 *   <FileUploadQueue
 *     queue={queue}
 *     summary={summary}
 *     onRetry={retryFile}
 *     onRemove={removeFile}
 *     onClearCompleted={clearCompleted}
 *     onClearAll={clearAll}
 *   />
 */

import React from "react";
import {
  Image, Video, File as FileIcon, CheckCircle2, AlertCircle,
  Loader2, Clock, X, RefreshCcw, Trash2, CheckCheck,
} from "lucide-react";
import type { QueuedFile, QueueSummary, UploadStatus } from "../../hooks/useBulkFileQueue";

/* ── Sub-components ───────────────────────────────────────────────── */

/** Circular mini-progress ring for the queue header */
function ProgressRing({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const r   = 14;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width="36" height="36" className="-rotate-90" aria-hidden="true">
      <circle cx="18" cy="18" r={r} strokeWidth="3" className="stroke-gray-200" fill="none" />
      <circle
        cx="18" cy="18" r={r} strokeWidth="3"
        className="stroke-teal-500 transition-all duration-500"
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      <text
        x="18" y="18"
        dominantBaseline="middle"
        textAnchor="middle"
        className="rotate-90 fill-gray-700 text-[9px] font-bold"
        style={{ fontSize: 9, transform: "rotate(90deg)", transformOrigin: "18px 18px" }}
      >
        {pct}%
      </text>
    </svg>
  );
}

/** Thumbnail area: image preview, video icon, or file icon */
function FileThumb({ file }: { file: QueuedFile }) {
  if (file.previewUrl) {
    return (
      <img
        src={file.previewUrl}
        alt={file.name}
        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100"
      />
    );
  }
  const [Icon, bg, color] =
    file.mediaType === "video" ? [Video, "bg-purple-50", "text-purple-500"] :
    [FileIcon, "bg-gray-100", "text-gray-400"];
  return (
    <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
      <Icon size={18} className={color} aria-hidden="true" />
    </div>
  );
}

/** Status badge */
const STATUS_CONFIG: Record<UploadStatus, { label: string; cls: string; DotIcon: React.ElementType }> = {
  queued:    { label: "Queued",    cls: "bg-gray-100 text-gray-500",     DotIcon: Clock        },
  uploading: { label: "Uploading", cls: "bg-blue-50 text-blue-600",      DotIcon: Loader2      },
  done:      { label: "Done",      cls: "bg-emerald-50 text-emerald-600", DotIcon: CheckCircle2 },
  error:     { label: "Failed",    cls: "bg-red-50 text-red-600",         DotIcon: AlertCircle  },
};

function StatusBadge({ status }: { status: UploadStatus }) {
  const { label, cls, DotIcon } = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>
      <DotIcon size={10} className={status === "uploading" ? "animate-spin" : ""} aria-hidden="true" />
      {label}
    </span>
  );
}

/* ── Progress bar ─────────────────────────────────────────────────── */

function ProgressBar({ progress, status }: { progress: number; status: UploadStatus }) {
  const color =
    status === "done"  ? "bg-emerald-500" :
    status === "error" ? "bg-red-400"     :
    "bg-teal-500";
  return (
    <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-1.5">
      <div
        className={`h-full ${color} rounded-full transition-all duration-300 ease-out`}
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}

/* ── File row ─────────────────────────────────────────────────────── */

function FileRow({
  file,
  onRemove,
  onRetry,
}: {
  file: QueuedFile;
  onRemove: (id: string) => void;
  onRetry:  (id: string) => void;
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors ${
      file.status === "error" ? "bg-red-50/30" : ""
    }`}>
      <FileThumb file={file} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="text-xs font-medium text-gray-800 truncate max-w-[180px]" title={file.name}>
            {file.name}
          </p>
          <StatusBadge status={file.status} />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">{file.sizeLabel}</span>
          {file.status === "uploading" && (
            <span className="text-[10px] text-blue-500 font-medium">{file.progress}%</span>
          )}
        </div>

        {(file.status === "uploading" || file.status === "done" || file.status === "error") && (
          <ProgressBar progress={file.progress} status={file.status} />
        )}

        {file.errorMsg && (
          <p className="text-[10px] text-red-500 mt-1">{file.errorMsg}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0">
        {file.status === "error" && (
          <button
            onClick={() => onRetry(file.id)}
            aria-label={`Retry ${file.name}`}
            className="p-1.5 rounded-md text-blue-500 hover:bg-blue-50 transition-colors"
          >
            <RefreshCcw size={13} />
          </button>
        )}
        {(file.status === "queued" || file.status === "error") && (
          <button
            onClick={() => onRemove(file.id)}
            aria-label={`Remove ${file.name}`}
            className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={13} />
          </button>
        )}
        {file.status === "done" && (
          <CheckCircle2 size={16} className="text-emerald-500 mx-1.5" aria-label="Uploaded" />
        )}
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────── */

export interface FileUploadQueueProps {
  queue:             QueuedFile[];
  summary:           QueueSummary;
  onRetry:           (id: string) => void;
  onRemove:          (id: string) => void;
  onClearCompleted:  () => void;
  onClearAll:        () => void;
}

export function FileUploadQueue({
  queue,
  summary,
  onRetry,
  onRemove,
  onClearCompleted,
  onClearAll,
}: FileUploadQueueProps) {
  if (queue.length === 0) return null;

  const inFlight = summary.uploading + summary.queued;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50/60">
        <ProgressRing done={summary.done} total={summary.total} />

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800">
            {summary.allSettled
              ? `${summary.done} uploaded${summary.error > 0 ? `, ${summary.error} failed` : ""}`
              : `Uploading ${summary.done + summary.uploading} of ${summary.total}…`
            }
          </p>
          <div className="flex items-center gap-3 mt-0.5">
            {summary.done    > 0 && <span className="text-[10px] text-emerald-600 font-medium">{summary.done} done</span>}
            {summary.uploading > 0 && <span className="text-[10px] text-blue-500 font-medium animate-pulse">{summary.uploading} uploading</span>}
            {summary.queued  > 0 && <span className="text-[10px] text-gray-400">{summary.queued} queued</span>}
            {summary.error   > 0 && <span className="text-[10px] text-red-500 font-medium">{summary.error} failed</span>}
          </div>
        </div>

        {/* Bulk actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {summary.done > 0 && (
            <button
              onClick={onClearCompleted}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Remove completed from list"
            >
              <CheckCheck size={12} aria-hidden="true" />
              Clear done
            </button>
          )}
          {inFlight === 0 && (
            <button
              onClick={onClearAll}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Clear entire queue"
            >
              <Trash2 size={12} aria-hidden="true" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── All-done celebration banner ── */}
      {summary.allSettled && summary.error === 0 && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-emerald-50 border-b border-emerald-100">
          <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" aria-hidden="true" />
          <p className="text-xs font-medium text-emerald-700">
            All {summary.done} file{summary.done !== 1 ? "s" : ""} added to your library!
          </p>
        </div>
      )}

      {/* ── File list ── */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight: "320px" }}
        role="list"
        aria-label="Upload queue"
      >
        {queue.map((file) => (
          <div key={file.id} role="listitem">
            <FileRow file={file} onRemove={onRemove} onRetry={onRetry} />
          </div>
        ))}
      </div>
    </div>
  );
}
