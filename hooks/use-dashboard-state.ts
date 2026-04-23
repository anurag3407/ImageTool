import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { removeBackground } from "@imgly/background-removal";

import {
  getErrorMessage,
  resizeImageIfNeeded,
  toPngFile,
} from "@/lib/image-client-utils";
import type { ProcessingMode, QueueItem } from "@/lib/queue-types";
import { validateImageFile } from "@/lib/shared-validation";

const TOKEN_STORAGE_KEY = "image_tool.jwt";

type LoginApiResponse = {
  token?: string;
  username?: string;
  error?: string;
};

export type UploadHistoryItem = {
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

export function useDashboardState() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [processingMode, setProcessingMode] = useState<ProcessingMode>("with_bg_removal");
  
  const [authToken, setAuthToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  });
  
  const [history, setHistory] = useState<UploadHistoryItem[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);

  const queuedProcessIdsRef = useRef<string[]>([]);
  const queueStateRef = useRef<QueueItem[]>([]);
  const workerIsBusyRef = useRef(false);
  const trackedObjectUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    queueStateRef.current = queue;
  }, [queue]);

  const clearAuthSession = useCallback((message?: string) => {
    setAuthToken(null);
    setHistory([]);
    setHistoryError(null);
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
        clearAuthSession("SESSION EXPIRED. LOGIN AGAIN.");
        throw new Error("Session expired.");
      }
      if (!response.ok || !payload.history) {
        throw new Error(payload.error || "FAILED TO LOAD HISTORY.");
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

  const loginOrRegister = async (username: string, password: string, isRegistering: boolean) => {
    const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const payload = (await response.json()) as LoginApiResponse;
    if (!response.ok || !payload.token) {
      throw new Error(payload.error || "AUTH FAILED.");
    }

    setAuthToken(payload.token);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
    }
  };

  const handleLogout = useCallback(() => {
    clearAuthSession();
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
  ) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
      throw new Error("MISSING CLOUD_NAME ENV.");
    }

    const folder = metadata.processingMode === "with_bg_removal" ? "bg-removed-images" : "original-images";

    const signRes = await fetch("/api/cloudinary-sign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ folder }),
    });

    if (!signRes.ok) {
      throw new Error("FAILED TO SECURE UPLOAD SIGNATURE.");
    }

    const { timestamp, signature, apiKey } = await signRes.json();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("folder", folder);

    const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!cloudinaryRes.ok) {
      const errorData = await cloudinaryRes.json();
      throw new Error(errorData.error?.message || "UPLOAD FAILED.");
    }

    const cloudinaryData = await cloudinaryRes.json();
    const secureUrl = cloudinaryData.secure_url;
    const publicId = cloudinaryData.public_id;

    const recordRes = await fetch("/api/upload-record", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        cloudinaryUrl: secureUrl,
        publicId,
        fileName: metadata.originalFileName,
        processingMode: metadata.processingMode,
        clientQueueItemId: metadata.clientQueueItemId,
      }),
    });

    if (!recordRes.ok) {
      throw new Error("DB SAVE FAILED.");
    }

    return { secureUrl };
  }, []);

  const processOneItem = useCallback(async (itemId: string) => {
    const item = queueStateRef.current.find((entry) => entry.id === itemId);
    if (!item || item.status === "done") return;
    if (!authToken) {
      updateQueueItem(itemId, (c) => ({ ...c, status: "failed", error: "AUTH REQ." }));
      return;
    }

    try {
      let uploadFile = item.file;
      let localPreviewUrl: string | undefined;

      if (item.processingMode === "with_bg_removal") {
        updateQueueItem(itemId, (c) => ({ ...c, status: "removing_background", detail: "PROCESSING AI...", error: undefined }));
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
            updateQueueItem(itemId, (c) => c.status === "removing_background" ? { ...c, detail: `AI: ${percent}%` } : c);
          },
        });

        const prevPreview = queueStateRef.current.find(e => e.id === itemId)?.processedPreviewUrl;
        releaseObjectUrl(prevPreview);

        localPreviewUrl = rememberObjectUrl(URL.createObjectURL(processedBlob));
        uploadFile = toPngFile(processedBlob, item.fileName);
        updateQueueItem(itemId, (c) => ({ ...c, status: "uploading_cloudinary", detail: "UPLOADING...", processedPreviewUrl: localPreviewUrl }));
      } else {
        updateQueueItem(itemId, (c) => ({ ...c, status: "uploading_cloudinary", detail: "UPLOADING..." }));
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
        detail: "COMPLETE",
        processedPreviewUrl: uploadResult.secureUrl,
        cloudinaryUrl: uploadResult.secureUrl,
      }));
      void fetchUploadHistory(authToken);
    } catch (error) {
      const msg = getErrorMessage(error);
      if (msg.toLowerCase().includes("unauthorized")) clearAuthSession("SESSION EXPIRED.");
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
    if (!authToken) return;
    
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

  const clearQueue = () => {
    setQueue([]);
    queuedProcessIdsRef.current = [];
  };

  return {
    authToken,
    history,
    historyError,
    queue,
    processingMode,
    isProcessing,
    isHistoryLoading,
    setProcessingMode,
    loginOrRegister,
    handleLogout,
    ingestFiles,
    clearQueue,
    fetchUploadHistory
  };
}
