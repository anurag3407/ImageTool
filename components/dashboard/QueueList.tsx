"use client";

import { useState } from "react";
import { QueueItem } from "@/lib/queue-types";
import { formatBytes } from "@/lib/shared-validation";

export default function QueueList({ queue, onClear }: { queue: QueueItem[]; onClear: () => void }) {
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopiedItemId(id);
    setTimeout(() => setCopiedItemId(null), 2000);
  };

  return (
    <div className="bg-[#b7c6c2] border-2 border-black shadow-neo-lg p-6 rounded-lg text-black">
      <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-4">
        <h3 className="font-heading text-2xl font-black uppercase tracking-tighter">Queue</h3>
        <button onClick={onClear} className="btn-neo-white text-xs px-3 py-2 uppercase">Clear All</button>
      </div>
      <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
        {queue.map((item) => (
          <div key={item.id} className="bg-white border-2 border-black p-4 flex gap-4 shadow-neo">
            <div className="w-16 h-16 border-2 border-black bg-gray-200 relative shrink-0">
              <img src={item.originalPreviewUrl} className="w-full h-full object-cover opacity-50" alt="" />
              {item.processedPreviewUrl && (
                <img src={item.processedPreviewUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-lg truncate uppercase">{item.fileName}</p>
                <span className={`text-xs font-bold px-2 py-1 uppercase border-2 border-black ${item.status === 'done' ? 'bg-[#28c840] text-black' : item.status === 'failed' ? 'bg-[#ff5f57] text-white' : 'bg-[#febc2e] text-black'}`}>
                  {item.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm font-medium opacity-70 mb-2">{formatBytes(item.file.size)}</p>
              {item.cloudinaryUrl ? (
                <div className="flex items-center gap-2">
                  <input type="text" readOnly value={item.cloudinaryUrl} className="flex-1 border-2 border-black p-2 text-sm bg-gray-50 focus:outline-none" />
                  <button onClick={() => copyToClipboard(item.cloudinaryUrl as string, item.id)} className="btn-neo text-sm py-2 px-4">
                    {copiedItemId === item.id ? "OK" : "CPY"}
                  </button>
                </div>
              ) : (
                <p className="text-sm font-bold uppercase">{item.detail || "WAITING..."}</p>
              )}
              {item.error && <p className="text-[#ff5f57] font-bold mt-1 text-sm uppercase">{item.error}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
