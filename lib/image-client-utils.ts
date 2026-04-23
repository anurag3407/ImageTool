"use client";

const RESIZE_TRIGGER_BYTES = 4 * 1024 * 1024;
const DEFAULT_MAX_DIMENSION = 2200;

export async function resizeImageIfNeeded(
  file: File,
  maxDimension = DEFAULT_MAX_DIMENSION,
): Promise<File> {
  if (file.size < RESIZE_TRIGGER_BYTES || typeof window === "undefined") {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const longestSide = Math.max(bitmap.width, bitmap.height);

  if (longestSide <= maxDimension) {
    bitmap.close();
    return file;
  }

  const scale = maxDimension / longestSide;
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return file;
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const targetMimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
  const quality = targetMimeType === "image/jpeg" ? 0.92 : undefined;

  const resizedBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("Unable to resize this image."));
          return;
        }
        resolve(result);
      },
      targetMimeType,
      quality,
    );
  });

  return new File([resizedBlob], file.name, {
    type: resizedBlob.type || file.type,
    lastModified: Date.now(),
  });
}

export function toPngFile(blob: Blob, originalName: string): File {
  const baseName = originalName.replace(/\.[^/.]+$/, "") || "image";
  return new File([blob], `${baseName}-bgless.png`, {
    type: "image/png",
    lastModified: Date.now(),
  });
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unexpected processing error.";
}