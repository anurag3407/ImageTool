export const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const MAX_UPLOAD_SIZE_BYTES = 12 * 1024 * 1024;
export const MAX_UPLOAD_SIZE_MB = MAX_UPLOAD_SIZE_BYTES / (1024 * 1024);

export function isAcceptedImageType(mimeType: string): boolean {
  return ACCEPTED_IMAGE_TYPES.includes(
    mimeType as (typeof ACCEPTED_IMAGE_TYPES)[number],
  );
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateImageFile(file: File): string | null {
  if (!isAcceptedImageType(file.type)) {
    return "Only PNG, JPEG, and WEBP files are supported.";
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return `File is too large. Maximum allowed size is ${MAX_UPLOAD_SIZE_MB}MB.`;
  }

  return null;
}