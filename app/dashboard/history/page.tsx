"use client";

import { useEffect, useState } from "react";
import { useDashboardState } from "@/hooks/use-dashboard-state";

export default function HistoryPage() {
  const state = useDashboardState();
  const [isMounted, setIsMounted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (!state.authToken) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center h-full text-center mt-20">
        <h2 className="font-heading text-4xl font-black uppercase tracking-tighter mb-4">Access Denied</h2>
        <p className="font-medium text-lg text-gray-400">You must be logged in to view your history.</p>
        <button onClick={() => window.location.href = '/dashboard'} className="btn-neo mt-6">Go to Login</button>
      </div>
    );
  }

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
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <div className="flex items-center justify-between border-b-2 border-[#272727] pb-6">
        <div>
          <h1 className="font-heading text-4xl font-black uppercase tracking-tighter text-white">Your Links</h1>
          <p className="text-gray-400 font-medium mt-1">A complete history of your processed images.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => state.fetchUploadHistory(state.authToken!)} className="btn-neo-white text-xs px-4 py-2 uppercase">
            {state.isHistoryLoading ? "Refreshing..." : "Refresh"}
          </button>
          <button onClick={state.handleLogout} className="btn-neo-sage text-xs px-4 py-2 uppercase">Logout</button>
        </div>
      </div>

      {state.historyError && (
        <div className="bg-[#ff5f57] border-2 border-black text-black font-bold p-4 uppercase shadow-neo">
          {state.historyError}
        </div>
      )}

      {state.history.length === 0 && !state.isHistoryLoading ? (
        <div className="bg-[#272727] border-2 border-black border-dashed p-12 text-center text-gray-400 font-medium text-lg uppercase tracking-widest">
          No history found. Start uploading!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {state.history.map((item) => (
            <div key={item.id} className="bg-white border-2 border-black shadow-neo flex flex-col">
              <div className="h-48 border-b-2 border-black bg-gray-200 relative overflow-hidden group">
                <img 
                  src={item.cloudinaryUrl} 
                  alt={item.fileName} 
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <div className="p-4 flex flex-col gap-3 text-black">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-black uppercase tracking-tighter text-lg truncate pr-2" title={item.fileName}>
                    {item.fileName}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-1 uppercase border-2 border-black ${item.processingMode === 'with_bg_removal' ? 'bg-[#ffe17c]' : 'bg-[#b7c6c2]'}`}>
                    {item.processingMode === 'with_bg_removal' ? 'NO BG' : 'ORIGINAL'}
                  </span>
                </div>
                <div className="text-xs font-bold text-gray-500 mb-2">
                  {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <input 
                    type="text" 
                    readOnly 
                    value={item.cloudinaryUrl} 
                    className="flex-1 border-2 border-black p-2 text-xs bg-gray-50 focus:outline-none truncate" 
                  />
                  <button 
                    onClick={() => copyToClipboard(item.cloudinaryUrl, item.id)} 
                    className="bg-black text-white text-xs px-3 py-2 font-bold hover:bg-gray-800 border-2 border-black transition-colors"
                  >
                    {copiedId === item.id ? "COPIED!" : "COPY"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
