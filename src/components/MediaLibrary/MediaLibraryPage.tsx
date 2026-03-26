/**
 * Media Library Page
 * Upload/organize images, videos
 */

import React, { useState } from "react";
import { Upload, Image, Video, Trash2, Download, Eye } from "lucide-react";

interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video";
  size: string;
  uploadedAt: string;
}

const DUMMY_MEDIA: MediaItem[] = [
  { id: "m1", name: "Clinic-entrance.jpg", type: "image", size: "2.4 MB", uploadedAt: "2 hours ago" },
  { id: "m2", name: "Team-photo.jpg", type: "image", size: "1.8 MB", uploadedAt: "1 day ago" },
  { id: "m3", name: "Surgery-room.jpg", type: "image", size: "3.1 MB", uploadedAt: "2 days ago" },
  { id: "m4", name: "Clinic-tour.mp4", type: "video", size: "45 MB", uploadedAt: "3 days ago" },
  { id: "m5", name: "Dr-intro.mp4", type: "video", size: "12 MB", uploadedAt: "5 days ago" },
  { id: "m6", name: "Reception-area.jpg", type: "image", size: "2.2 MB", uploadedAt: "1 week ago" },
];

export function MediaLibraryPage() {
  const [filterType, setFilterType] = useState<"all" | "image" | "video">("all");

  const filteredMedia =
    filterType === "all" ? DUMMY_MEDIA : DUMMY_MEDIA.filter((m) => m.type === filterType);

  const imageCount = DUMMY_MEDIA.filter((m) => m.type === "image").length;
  const videoCount = DUMMY_MEDIA.filter((m) => m.type === "video").length;

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="p-10">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-2">Total Images</p>
                <p className="text-3xl font-semibold text-gray-900">{imageCount}</p>
              </div>
              <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Image size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-2">Total Videos</p>
                <p className="text-3xl font-semibold text-gray-900">{videoCount}</p>
              </div>
              <div className="w-10 h-10 rounded-md bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Video size={20} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mb-10 hover:border-gray-400 transition">
          <Upload size={40} className="text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-900 mb-1">Drag and drop files here</p>
          <p className="text-xs text-gray-600 mb-4">Or click to select files from your computer</p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition">
            <Upload size={14} />
            Choose Files
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-8">
          {[
            { id: "all", label: "All" },
            { id: "image", label: "Images" },
            { id: "video", label: "Videos" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterType(filter.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                filterType === filter.id
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Media List */}
        <div className="space-y-3">
          {filteredMedia.length > 0 ? (
            filteredMedia.map((media) => (
              <div
                key={media.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5 flex-1">
                    <div className="w-10 h-10 rounded-md bg-gray-50 flex items-center justify-center flex-shrink-0">
                      {media.type === "image" ? (
                        <Image size={20} className="text-blue-600" />
                      ) : (
                        <Video size={20} className="text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900">{media.name}</h3>
                      <div className="flex flex-wrap gap-5 text-xs text-gray-600 mt-1.5">
                        <span>{media.size}</span>
                        <span>{media.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-6 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                    <button className="p-2 hover:bg-gray-100 rounded-md transition" title="Preview">
                      <Eye size={16} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-md transition" title="Download">
                      <Download size={16} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-md transition" title="Delete">
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-sm text-gray-600">No media files found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
