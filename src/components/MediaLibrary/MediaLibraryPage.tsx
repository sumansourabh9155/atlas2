/**
 * Media Library Page — Upload / organise images and videos.
 *
 * Bulk upload:
 *  - Multi-file drag-and-drop or file picker
 *  - Per-file progress queue panel appears below drop zone
 *  - Files auto-start uploading (max 3 concurrent)
 *  - Completed files are automatically added to the library in real-time
 *  - Retry failed uploads individually
 *  - Progress ring + summary in queue header
 */

import React, { useState, useRef, useCallback } from "react";
import { Upload, Image, Video, Trash2, Download, Eye, FileX } from "lucide-react";
import { KpiCard } from "../ui/KpiCard";
import { FilterPill } from "../ui/FilterPill";
import { IconButton } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { EmptyState } from "../ui/EmptyState";
import { ConfirmDialog, type ConfirmState } from "../ui/ConfirmDialog";
import { ToastContainer, useToast } from "../ui/Toast";
import { FileUploadQueue } from "../ui/FileUploadQueue";
import { useBulkFileQueue } from "../../hooks/useBulkFileQueue";
import { surface } from "../../lib/styles/tokens";

/* ── Types ──────────────────────────────────────────────────────────── */

interface MediaItem {
  id:         string;
  name:       string;
  type:       "image" | "video";
  size:       string;
  uploadedAt: string;
}

const INIT_MEDIA: MediaItem[] = [
  { id: "m1", name: "Clinic-entrance.jpg", type: "image", size: "2.4 MB", uploadedAt: "2 hours ago"  },
  { id: "m2", name: "Team-photo.jpg",      type: "image", size: "1.8 MB", uploadedAt: "1 day ago"    },
  { id: "m3", name: "Surgery-room.jpg",    type: "image", size: "3.1 MB", uploadedAt: "2 days ago"   },
  { id: "m4", name: "Clinic-tour.mp4",     type: "video", size: "45 MB",  uploadedAt: "3 days ago"   },
  { id: "m5", name: "Dr-intro.mp4",        type: "video", size: "12 MB",  uploadedAt: "5 days ago"   },
  { id: "m6", name: "Reception-area.jpg",  type: "image", size: "2.2 MB", uploadedAt: "1 week ago"   },
];

/* ── Component ─────────────────────────────────────────────────────── */

export function MediaLibraryPage() {
  const [media,      setMedia]      = useState<MediaItem[]>(INIT_MEDIA);
  const [filterType, setFilterType] = useState<"all" | "image" | "video">("all");
  const [isDragging, setIsDragging] = useState(false);
  const [confirm,    setConfirm]    = useState<ConfirmState | null>(null);
  const { toasts, toast, dismiss }  = useToast();
  const fileInputRef                = useRef<HTMLInputElement>(null);

  /* ── Upload queue ── */
  const { queue, addFiles, retryFile, removeFile, clearCompleted, clearAll, summary } =
    useBulkFileQueue({
      maxSizeMB:        100,
      maxFiles:         50,
      maxConcurrent:    3,
      simulateErrorRate: 0.08,
      onFileComplete: (completed) => {
        // Add to library as soon as each file finishes
        setMedia((prev) => [{
          id:         `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name:       completed.name,
          type:       completed.mediaType === "video" ? "video" : "image",
          size:       completed.sizeLabel,
          uploadedAt: "Just now",
        }, ...prev]);
      },
    });

  /* Notify when entire batch finishes */
  const prevAllSettled = useRef(false);
  React.useEffect(() => {
    if (summary.allSettled && !prevAllSettled.current && summary.total > 0) {
      if (summary.error === 0) {
        toast.success(`${summary.done} file${summary.done !== 1 ? "s" : ""} uploaded to library`);
      } else {
        toast.warning(`${summary.done} uploaded · ${summary.error} failed — use Retry to try again`);
      }
    }
    prevAllSettled.current = summary.allSettled;
  }, [summary.allSettled, summary.done, summary.error, summary.total]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Drag-and-drop on drop zone ── */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    if (files.length) addFiles(files);
  }, [addFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  }, [addFiles]);

  /* ── Delete ── */
  const handleDelete = (item: MediaItem) => {
    setConfirm({
      title:       `Delete "${item.name}"?`,
      message:     "This file will be permanently removed from your library.",
      confirmLabel: "Delete",
      variant:     "danger",
      onConfirm: () => {
        setMedia((prev) => prev.filter((m) => m.id !== item.id));
        toast.success(`"${item.name}" deleted`);
      },
    });
  };

  /* ── Derived ── */
  const filteredMedia = filterType === "all" ? media : media.filter((m) => m.type === filterType);
  const imageCount    = media.filter((m) => m.type === "image").length;
  const videoCount    = media.filter((m) => m.type === "video").length;

  return (
    <div className={surface.page}>
      <div className="p-6 space-y-5">

        {/* ── KPI stats ── */}
        <div className="grid grid-cols-2 gap-4">
          <KpiCard label="Total Images" value={imageCount} icon={Image} color="blue"   />
          <KpiCard label="Total Videos" value={videoCount} icon={Video} color="violet" />
        </div>

        {/* ── Upload drop zone ── */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
          role="button"
          tabIndex={0}
          aria-label="Upload media files — drag and drop or click to browse"
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all group ${
            isDragging
              ? "border-teal-400 bg-teal-50/50 scale-[1.01]"
              : "border-gray-300 hover:border-teal-400 hover:bg-teal-50/30"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileInput}
            aria-hidden="true"
          />
          <Upload
            size={32}
            className={`mx-auto mb-3 transition-colors ${
              isDragging ? "text-teal-500" : "text-gray-300 group-hover:text-teal-500"
            }`}
            aria-hidden="true"
          />
          <p className="text-sm font-semibold text-gray-700 mb-1">
            {isDragging ? "Drop files to upload" : "Drag and drop files here"}
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Images & videos · JPG, PNG, MP4, MOV · Max 100 MB per file · Up to 50 files at once
          </p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
            aria-label="Choose files to upload"
          >
            <Upload size={14} aria-hidden="true" />
            Choose Files
          </button>
        </div>

        {/* ── File upload queue (appears when files are added) ── */}
        {queue.length > 0 && (
          <FileUploadQueue
            queue={queue}
            summary={summary}
            onRetry={retryFile}
            onRemove={removeFile}
            onClearCompleted={clearCompleted}
            onClearAll={clearAll}
          />
        )}

        {/* ── Filter pills + count ── */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5" role="group" aria-label="Filter by type">
            {(["all", "image", "video"] as const).map((f) => (
              <FilterPill key={f} active={filterType === f} onClick={() => setFilterType(f)}>
                {f === "all" ? "All" : f === "image" ? "Images" : "Videos"}
              </FilterPill>
            ))}
          </div>
          <span className="text-xs text-gray-400">
            {filteredMedia.length} file{filteredMedia.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Media list ── */}
        {filteredMedia.length === 0 ? (
          <EmptyState
            icon={FileX}
            title="No files found"
            subtitle={filterType === "all" ? "Upload your first file above." : `No ${filterType}s in your library yet.`}
          />
        ) : (
          <div className="space-y-2" role="list" aria-label="Media files">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                role="listitem"
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  {/* Type icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.type === "image" ? "bg-blue-50" : "bg-purple-50"
                  }`}>
                    {item.type === "image"
                      ? <Image  size={18} className="text-blue-600"   aria-hidden="true" />
                      : <Video  size={18} className="text-purple-600" aria-hidden="true" />
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                      <Badge variant={item.type === "image" ? "info" : "violet"} size="sm">
                        {item.type === "image" ? "Image" : "Video"}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-400 mt-0.5">
                      <span>{item.size}</span>
                      <span>{item.uploadedAt}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity"
                    role="group"
                    aria-label={`Actions for ${item.name}`}
                  >
                    <IconButton icon={Eye}      label={`Preview ${item.name}`}  size="sm" />
                    <IconButton icon={Download} label={`Download ${item.name}`} size="sm" />
                    <IconButton icon={Trash2}   label={`Delete ${item.name}`}   size="sm" variant="danger" onClick={() => handleDelete(item)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
