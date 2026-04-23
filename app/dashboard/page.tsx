"use client";

import { useEffect, useState } from "react";
import { useDashboardState } from "@/hooks/use-dashboard-state";
import AuthPanel from "@/components/dashboard/AuthPanel";
import UploadDropzone from "@/components/dashboard/UploadDropzone";
import QueueList from "@/components/dashboard/QueueList";

export default function DashboardPage() {
  const state = useDashboardState();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Prevents hydration mismatch
  }

  if (!state.authToken) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <AuthPanel onLogin={state.loginOrRegister} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div className="flex items-center justify-between border-b-2 border-[#272727] pb-6">
        <h1 className="font-heading text-4xl font-black uppercase tracking-tighter text-white">Workspace</h1>
        <button onClick={state.handleLogout} className="btn-neo-white text-xs px-4 py-2 uppercase">Logout</button>
      </div>

      <div className="flex flex-col gap-8">
        <UploadDropzone
          processingMode={state.processingMode}
          setProcessingMode={state.setProcessingMode}
          onDrop={state.ingestFiles}
        />
        {state.queue.length > 0 && (
          <QueueList queue={state.queue} onClear={state.clearQueue} />
        )}
      </div>
    </div>
  );
}
