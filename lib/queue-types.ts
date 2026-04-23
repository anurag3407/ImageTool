export type ProcessingMode = "with_bg_removal" | "without_bg_removal";

export type QueueStatus =
  | "pending"
  | "removing_background"
  | "uploading_cloudinary"
  | "done"
  | "failed";

export type QueueItem = {
  id: string;
  file: File;
  fileName: string;
  processingMode: ProcessingMode;
  status: QueueStatus;
  detail?: string;
  error?: string;
  originalPreviewUrl: string;
  processedPreviewUrl?: string;
  cloudinaryUrl?: string;
};