"use client";

/* eslint-disable @next/next/no-img-element */

import { removeBackground } from "@imgly/background-removal";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  getErrorMessage,
  resizeImageIfNeeded,
  toPngFile,
} from "@/lib/image-client-utils";
import type {
  ProcessingMode,
  QueueItem,
  QueueStatus,
} from "@/lib/queue-types";
import {
  ACCEPTED_IMAGE_TYPES,
  formatBytes,
  MAX_UPLOAD_SIZE_MB,
  validateImageFile,
} from "@/lib/shared-validation";

const TOKEN_STORAGE_KEY = "image_tool.jwt";

const MODE_LABELS: Record<ProcessingMode, string> = {
  with_bg_removal: "Remove Background (AI)",
  without_bg_removal: "Keep Original",
};

type UploadApiResponse = {
  secureUrl?: string;
  recordId?: string | null;
  persistenceWarning?: string | null;
  processingMode?: ProcessingMode;
  error?: string;
};

type UploadResult = {
  secureUrl: string;
  recordId?: string;
  persistenceWarning?: string;
  processingMode?: ProcessingMode;
};

type LoginApiResponse = {
  token?: string;
  username?: string;
  error?: string;
};

type UploadHistoryItem = {
  id: string;
  fileName: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  processingMode: ProcessingMode;
  createdAt: string;
};

type UploadHistoryApiResponse = {
  history?: UploadHistoryItem[];
  error?: string;
};

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
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

// Simple SVG Icons since lucide-react could not be installed
const IconImage = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>;
const IconImageMinus = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><line x1="16" x2="22" y1="5" y2="5"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>;
const IconUploadCloud = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>;
const IconCopy = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>;
const IconTrash2 = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>;
const IconRefreshCw = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;
const IconLogOut = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
const IconShield = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 3 0 5 1 7 2a1 1 0 0 1 1 1v7z"/></svg>;
const IconZap = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;


export default function BgRemovalWorkbench() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [processingMode, setProcessingMode] = useState<ProcessingMode>("with_bg_removal");
  const [authToken, setAuthToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  });
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [history, setHistory] = useState<UploadHistoryItem[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveMessage, setLiveMessage] = useState("Queue is idle.");
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const queuedProcessIdsRef = useRef<string[]>([]);
  const queueStateRef = useRef<QueueItem[]>([]);
  const workerIsBusyRef = useRef(false);
  const trackedObjectUrlsRef = useRef<Set<string>>(new Set());
  const copyItemTimeoutRef = useRef<number | null>(null);
  const copyAllTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    queueStateRef.current = queue;
  }, [queue]);

  const clearAuthSession = useCallback((message?: string) => {
    setAuthToken(null);
    setHistory([]);
    setHistoryError(null);
    setAuthError(message || null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, []);

  const fetchUploadHistory = useCallback(async (token: string) => {
    setIsHistoryLoading(true);
    setHistoryError(null);
    try {
      const response = await fetch("/api/upload-history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = (await response.json()) as UploadHistoryApiResponse;
      if (response.status === 401) {
        clearAuthSession("Session expired. Please login again.");
        throw new Error("Session expired.");
      }
      if (!response.ok || !payload.history) {
        throw new Error(payload.error || "Failed to load URL history.");
      }
      setHistory(payload.history);
    } catch (error) {
      setHistoryError(getErrorMessage(error));
    } finally {
      setIsHistoryLoading(false);
    }
  }, [clearAuthSession]);

  useEffect(() => {
    if (authToken) {
      const timeoutId = window.setTimeout(() => void fetchUploadHistory(authToken), 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [authToken, fetchUploadHistory]);

  const handleAuthSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const username = authUsername.trim();
    if (!username || !authPassword) {
      setAuthError("Username and password are required.");
      return;
    }
    if (isRegistering && username.length < 3) {
      setAuthError("Username must be at least 3 characters long.");
      return;
    }
    if (isRegistering && authPassword.length < 6) {
      setAuthError("Password must be at least 6 characters long.");
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: authPassword }),
      });

      const payload = (await response.json()) as LoginApiResponse;
      if (!response.ok || !payload.token) {
        throw new Error(payload.error || "Authentication failed.");
      }

      setAuthToken(payload.token);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
      }
      setAuthPassword("");
      setLiveMessage(isRegistering ? "Registered and logged in successfully." : "Logged in successfully.");
    } catch (error) {
      setAuthError(getErrorMessage(error));
    } finally {
      setIsAuthenticating(false);
    }
  }, [authPassword, authUsername, isRegistering]);

  const handleLogout = useCallback(() => {
    clearAuthSession("You have been logged out.");
    setLiveMessage("Authentication removed.");
  }, [clearAuthSession]);

  const rememberObjectUrl = useCallback((url: string) => {
    trackedObjectUrlsRef.current.add(url);
    return url;
  }, []);

  const releaseObjectUrl = useCallback((url?: string) => {
    if (!url) return;
    if (trackedObjectUrlsRef.current.delete(url)) {
      URL.revokeObjectURL(url);
    }
  }, []);

  const updateQueueItem = useCallback((itemId: string, updater: (item: QueueItem) => QueueItem) => {
    setQueue((current) => current.map((item) => (item.id === itemId ? updater(item) : item)));
  }, []);

  const uploadProcessedFile = useCallback(async (
    file: File,
    metadata: { originalFileName: string; clientQueueItemId: string; processingMode: ProcessingMode; },
    token: string,
  ): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("originalFileName", metadata.originalFileName);
    formData.append("clientQueueItemId", metadata.clientQueueItemId);
    formData.append("processingMode", metadata.processingMode);

    const response = await fetch("/api/upload-processed", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const payload = (await response.json()) as UploadApiResponse;
    if (response.status === 401) throw new Error("Unauthorized. Please login again.");
    if (!response.ok || !payload.secureUrl) throw new Error(payload.error || "Cloudinary upload failed.");

    return {
      secureUrl: payload.secureUrl,
      recordId: payload.recordId ?? undefined,
      persistenceWarning: payload.persistenceWarning ?? undefined,
      processingMode: payload.processingMode,
    };
  }, []);

  const processOneItem = useCallback(async (itemId: string) => {
    const item = queueStateRef.current.find((entry) => entry.id === itemId);
    if (!item || item.status === "done") return;
    if (!authToken) {
      updateQueueItem(itemId, (c) => ({ ...c, status: "failed", error: "Please login first." }));
      return;
    }

    try {
      let uploadFile = item.file;
      let localPreviewUrl: string | undefined;

      if (item.processingMode === "with_bg_removal") {
        updateQueueItem(itemId, (c) => ({ ...c, status: "removing_background", detail: "Removing background...", error: undefined }));
        let progressBucket = -1;
        const optimizedFile = await resizeImageIfNeeded(item.file);
        const processedBlob = await removeBackground(optimizedFile, {
          model: "isnet_quint8",
          output: { format: "image/png", quality: 1 },
          progress: (_key, current, total) => {
            if (!total) return;
            const bucket = Math.floor((current / total) * 10);
            if (bucket === progressBucket) return;
            progressBucket = bucket;
            const percent = Math.min(100, bucket * 10);
            updateQueueItem(itemId, (c) => c.status === "removing_background" ? { ...c, detail: `AI Processing: ${percent}%` } : c);
          },
        });

        const prevPreview = queueStateRef.current.find(e => e.id === itemId)?.processedPreviewUrl;
        releaseObjectUrl(prevPreview);

        localPreviewUrl = rememberObjectUrl(URL.createObjectURL(processedBlob));
        uploadFile = toPngFile(processedBlob, item.fileName);
        updateQueueItem(itemId, (c) => ({ ...c, status: "uploading_cloudinary", detail: "Uploading to Cloudinary...", processedPreviewUrl: localPreviewUrl }));
      } else {
        updateQueueItem(itemId, (c) => ({ ...c, status: "uploading_cloudinary", detail: "Uploading original to Cloudinary..." }));
      }

      const uploadResult = await uploadProcessedFile(uploadFile, {
        originalFileName: item.fileName,
        clientQueueItemId: item.id,
        processingMode: item.processingMode,
      }, authToken);

      if (localPreviewUrl) releaseObjectUrl(localPreviewUrl);

      updateQueueItem(itemId, (c) => ({
        ...c,
        status: "done",
        detail: "Completed",
        processedPreviewUrl: uploadResult.secureUrl,
        cloudinaryUrl: uploadResult.secureUrl,
      }));
      void fetchUploadHistory(authToken);
    } catch (error) {
      const msg = getErrorMessage(error);
      if (msg.toLowerCase().includes("unauthorized")) clearAuthSession("Session expired.");
      updateQueueItem(itemId, (c) => ({ ...c, status: "failed", error: msg }));
    }
  }, [authToken, clearAuthSession, fetchUploadHistory, releaseObjectUrl, rememberObjectUrl, updateQueueItem, uploadProcessedFile]);

  const runQueueWorker = useCallback(async () => {
    if (workerIsBusyRef.current) return;
    workerIsBusyRef.current = true;
    setIsProcessing(true);
    try {
      while (queuedProcessIdsRef.current.length > 0) {
        const nextId = queuedProcessIdsRef.current.shift();
        if (nextId) await processOneItem(nextId);
      }
    } finally {
      workerIsBusyRef.current = false;
      setIsProcessing(false);
      setLiveMessage("Queue complete.");
    }
  }, [processOneItem]);

  const scheduleForProcessing = useCallback((itemIds: string[]) => {
    if (itemIds.length === 0) return;
    const existingIds = new Set(queuedProcessIdsRef.current);
    for (const id of itemIds) {
      if (!existingIds.has(id)) {
        existingIds.add(id);
        queuedProcessIdsRef.current.push(id);
      }
    }
  }, []);

  useEffect(() => {
    if (queuedProcessIdsRef.current.length > 0 && !workerIsBusyRef.current) {
      void runQueueWorker();
    }
  }, [queue, runQueueWorker]);

  const ingestFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;
    if (!authToken) {
      setAuthError("Please login before adding files.");
      return;
    }
    const newItems: QueueItem[] = [];
    const processableIds: string[] = [];
    for (const file of files) {
      const id = crypto.randomUUID();
      const err = validateImageFile(file);
      const url = rememberObjectUrl(URL.createObjectURL(file));
      if (err) {
        newItems.push({ id, file, fileName: file.name, processingMode, status: "failed", error: err, originalPreviewUrl: url });
      } else {
        newItems.push({ id, file, fileName: file.name, processingMode, status: "pending", originalPreviewUrl: url });
        processableIds.push(id);
      }
    }
    setQueue((cur) => [...cur, ...newItems]);
    if (processableIds.length > 0) scheduleForProcessing(processableIds);
  }, [authToken, processingMode, rememberObjectUrl, scheduleForProcessing]);

  const successfulUrls = useMemo(() => queue.map((i) => i.cloudinaryUrl).filter(Boolean) as string[], [queue]);

  const queueSummary = useMemo(() => ({
    total: queue.length,
    success: queue.filter((i) => i.status === "done").length,
    failed: queue.filter((i) => i.status === "failed").length,
    inProgress: queue.filter((i) => i.status === "removing_background" || i.status === "uploading_cloudinary").length,
  }), [queue]);

  const isAuthenticated = Boolean(authToken);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 glass-panel border-b-0 border-b-white/5 mx-4 mt-4 mb-8 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white w-5 h-5 flex items-center justify-center"><IconImage /></span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">ImageTool<span className="text-primary">.ai</span></h1>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-white/70 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                <span className="w-4 h-4 text-emerald-400 flex items-center justify-center"><IconShield /></span>
                Authenticated
              </span>
              <button onClick={handleLogout} className="text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
                <span className="w-4 h-4 flex items-center justify-center"><IconLogOut /></span> Logout
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-20 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
        
        {/* Left Column: Auth & Controls */}
        <div className="flex flex-col gap-6">
          {!isAuthenticated ? (
            <div className="glass-card p-6 border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-2">{isRegistering ? "Create Account" : "Welcome Back"}</h2>
              <p className="text-white/60 text-sm mb-6">
                {isRegistering ? "Sign up to start processing images." : "Log in to access your processing queue."}
              </p>
              <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/50">Username</label>
                  <input
                    type="text"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    className="glass-input rounded-lg px-4 py-2.5 text-sm"
                    placeholder="Enter username"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/50">Password</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="glass-input rounded-lg px-4 py-2.5 text-sm"
                    placeholder="••••••••"
                  />
                </div>
                {authError && <p className="text-destructive text-sm font-medium">{authError}</p>}
                <button type="submit" disabled={isAuthenticating} className="glass-button w-full py-2.5 rounded-lg font-semibold mt-2 flex justify-center items-center gap-2">
                  {isAuthenticating ? <span className="w-4 h-4 animate-spin flex items-center justify-center"><IconRefreshCw /></span> : <span className="w-4 h-4 flex items-center justify-center"><IconShield /></span>}
                  {isRegistering ? "Sign Up" : "Sign In"}
                </button>
              </form>
              <div className="mt-6 text-center">
                <button onClick={() => { setIsRegistering(!isRegistering); setAuthError(null); }} className="text-xs text-white/50 hover:text-primary transition-colors">
                  {isRegistering ? "Already have an account? Log in" : "Need an account? Sign up"}
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card p-1">
              <div className="p-5 border-b border-white/5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-4">Processing Mode</h3>
                <div className="flex bg-black/40 rounded-lg p-1 relative">
                  <div
                    className="absolute inset-y-1 w-[calc(50%-4px)] bg-primary/20 border border-primary/50 rounded-md transition-all duration-300 ease-in-out"
                    style={{ left: processingMode === "with_bg_removal" ? "4px" : "calc(50% + 0px)" }}
                  />
                  <button
                    onClick={() => setProcessingMode("with_bg_removal")}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-md relative z-10 transition-colors ${processingMode === "with_bg_removal" ? "text-white" : "text-white/50 hover:text-white/80"}`}
                  >
                    <span className="w-5 h-5 mb-1 flex items-center justify-center"><IconImageMinus /></span>
                    <span className="text-xs font-medium">Remove BG</span>
                  </button>
                  <button
                    onClick={() => setProcessingMode("without_bg_removal")}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-md relative z-10 transition-colors ${processingMode === "without_bg_removal" ? "text-white" : "text-white/50 hover:text-white/80"}`}
                  >
                    <span className="w-5 h-5 mb-1 flex items-center justify-center"><IconImage /></span>
                    <span className="text-xs font-medium">Keep Original</span>
                  </button>
                </div>
                <p className="text-xs text-white/40 mt-3 text-center leading-relaxed">
                  {processingMode === "with_bg_removal" 
                    ? "AI will automatically extract the foreground before uploading to Cloudinary."
                    : "Original image will be optimized and uploaded to Cloudinary."}
                </p>
              </div>
              
              <div className="p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-3">System Metrics</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                    <div className="text-2xl font-bold text-white mb-1">{queueSummary.success}</div>
                    <div className="text-xs text-emerald-400 font-medium">Completed</div>
                  </div>
                  <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                    <div className="text-2xl font-bold text-white mb-1">{queueSummary.inProgress}</div>
                    <div className="text-xs text-primary font-medium flex items-center gap-1">
                      <span className="w-3 h-3 flex items-center justify-center"><IconZap /></span> Active
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Dropzone & Queue */}
        <div className="flex flex-col gap-6">
          <div
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out p-12 flex flex-col items-center justify-center text-center overflow-hidden
              ${isDragging ? "border-primary bg-primary/10" : "border-white/10 bg-black/40 hover:bg-black/60 hover:border-white/20"}
              ${!isAuthenticated ? "opacity-50 pointer-events-none grayscale" : "cursor-pointer"}
            `}
            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              ingestFiles(Array.from(e.dataTransfer.files || []));
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              multiple
              onChange={(e) => {
                if (e.target.files) ingestFiles(Array.from(e.target.files));
                e.target.value = "";
              }}
              className="hidden"
            />
            
            <div className={`w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 transition-transform duration-500 ${isDragging ? "scale-110 bg-primary/20" : ""}`}>
              <span className={`w-8 h-8 flex items-center justify-center ${isDragging ? "text-primary" : "text-white/60"}`}><IconUploadCloud /></span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {isDragging ? "Drop images here" : "Drag & drop images here"}
            </h3>
            <p className="text-sm text-white/50 max-w-[300px]">
              Supports PNG, JPEG, WEBP. Max size: {MAX_UPLOAD_SIZE_MB}MB.
            </p>
            
            {!isAuthenticated && (
              <div className="absolute inset-0 backdrop-blur-[2px] bg-background/50 flex items-center justify-center z-10">
                <p className="bg-black/80 px-4 py-2 rounded-full text-sm font-medium border border-white/10 text-white/80">
                  Authentication Required
                </p>
              </div>
            )}
          </div>

          {queue.length > 0 && (
            <div className="glass-card border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40">
                <h3 className="font-semibold text-white">Processing Queue</h3>
                <div className="flex gap-2">
                  {successfulUrls.length > 0 && (
                    <button 
                      onClick={async () => {
                        await copyToClipboard(successfulUrls.join("\n"));
                        setCopiedAll(true);
                        setTimeout(() => setCopiedAll(false), 2000);
                      }}
                      className="text-xs px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white transition-colors flex items-center gap-1.5"
                    >
                      {copiedAll ? <span className="w-3.5 h-3.5 text-emerald-400 flex items-center justify-center"><IconCheck /></span> : <span className="w-3.5 h-3.5 flex items-center justify-center"><IconCopy /></span>}
                      {copiedAll ? "Copied" : "Copy Links"}
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setQueue([]);
                      queuedProcessIdsRef.current = [];
                    }}
                    className="text-xs px-3 py-1.5 rounded-md bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-3.5 h-3.5 flex items-center justify-center"><IconTrash2 /></span>
                    Clear
                  </button>
                </div>
              </div>
              <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
                {queue.map((item) => (
                  <div key={item.id} className="p-4 flex gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-black/50 border border-white/10 flex-shrink-0 relative">
                      <img src={item.originalPreviewUrl} className="w-full h-full object-cover opacity-50" alt="" />
                      {item.processedPreviewUrl && (
                        <img src={item.processedPreviewUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-white truncate max-w-[200px]">{item.fileName}</p>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold
                          ${item.status === 'done' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 
                            item.status === 'failed' ? 'bg-destructive/20 text-destructive border border-destructive/20' : 
                            item.status === 'pending' ? 'bg-white/10 text-white/60 border border-white/10' :
                            'bg-primary/20 text-primary border border-primary/20 animate-pulse'}`}
                        >
                          {item.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 mb-2">{formatBytes(item.file.size)} &middot; {MODE_LABELS[item.processingMode]}</p>
                      
                      {item.cloudinaryUrl ? (
                        <div className="flex items-center gap-2">
                          <input type="text" readOnly value={item.cloudinaryUrl} className="bg-black/50 text-xs text-white/70 px-2 py-1 rounded border border-white/5 flex-1 w-full outline-none" />
                          <button onClick={() => {
                            copyToClipboard(item.cloudinaryUrl as string);
                            setCopiedItemId(item.id);
                            setTimeout(() => setCopiedItemId(null), 2000);
                          }} className="text-white/50 hover:text-white p-1">
                            {copiedItemId === item.id ? <span className="w-4 h-4 text-emerald-400 flex items-center justify-center"><IconCheck /></span> : <span className="w-4 h-4 flex items-center justify-center"><IconCopy /></span>}
                          </button>
                        </div>
                      ) : (
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-2">
                          {['removing_background', 'uploading_cloudinary'].includes(item.status) && (
                            <div className="h-full bg-primary w-full animate-pulse-glow" style={{ transformOrigin: 'left' }} />
                          )}
                        </div>
                      )}
                      {item.error && <p className="text-xs text-destructive mt-1">{item.error}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}