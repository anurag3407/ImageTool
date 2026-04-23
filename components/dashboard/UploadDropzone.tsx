"use client";

import { useRef, useState } from "react";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_SIZE_MB } from "@/lib/shared-validation";
import { ProcessingMode } from "@/lib/queue-types";

export default function UploadDropzone({ 
  processingMode, 
  setProcessingMode, 
  onDrop 
}: { 
  processingMode: ProcessingMode; 
  setProcessingMode: (m: ProcessingMode) => void;
  onDrop: (files: File[]) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="bg-[#ffe17c] border-2 border-black shadow-neo-lg p-6 rounded-lg flex flex-col gap-6 text-black">
      <div className="flex bg-white border-2 border-black shadow-neo">
        <button
          onClick={() => setProcessingMode("with_bg_removal")}
          className={`flex-1 py-3 font-bold text-sm uppercase transition-colors ${processingMode === "with_bg_removal" ? "bg-black text-[#ffe17c]" : "hover:bg-gray-100"}`}
        >
          REMOVE BG
        </button>
        <div className="w-0.5 bg-black"></div>
        <button
          onClick={() => setProcessingMode("without_bg_removal")}
          className={`flex-1 py-3 font-bold text-sm uppercase transition-colors ${processingMode === "without_bg_removal" ? "bg-black text-[#ffe17c]" : "hover:bg-gray-100"}`}
        >
          ORIGINAL
        </button>
      </div>

      <div
        className={`border-2 border-dashed border-black p-12 text-center transition-all cursor-pointer shadow-neo
          ${isDragging ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50"}
        `}
        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          onDrop(Array.from(e.dataTransfer.files || []));
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          multiple
          onChange={(e) => {
            if (e.target.files) onDrop(Array.from(e.target.files));
            e.target.value = "";
          }}
          className="hidden"
        />
        <div className="text-6xl mb-4 transform -rotate-6 inline-block">🖼️</div>
        <h3 className="font-heading text-3xl font-black uppercase tracking-tighter mb-2">
          {isDragging ? "DROP NOW" : "DRAG & DROP ASSETS"}
        </h3>
        <p className="font-medium text-lg opacity-70">PNG, JPEG, WEBP. Up to {MAX_UPLOAD_SIZE_MB}MB.</p>
      </div>
    </div>
  );
}
