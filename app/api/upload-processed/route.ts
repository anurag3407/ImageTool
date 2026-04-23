import { randomUUID } from "crypto";

import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

import { extractBearerToken, verifyAuthToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import {
  isAcceptedImageType,
  MAX_UPLOAD_SIZE_BYTES,
  MAX_UPLOAD_SIZE_MB,
} from "@/lib/shared-validation";
import { ProcessedUpload } from "@/models/processed-upload";

export const runtime = "nodejs";

const validProcessingModes = ["with_bg_removal", "without_bg_removal"] as const;
type ProcessingMode = (typeof validProcessingModes)[number];

let hasConfiguredCloudinary = false;

function ensureCloudinaryConfigured(): string | null {
  if (hasConfiguredCloudinary) {
    return null;
  }

  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return "Cloudinary credentials are missing. Set CLOUDINARY_CLOUD_NAME (or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME), CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.";
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  hasConfiguredCloudinary = true;
  return null;
}

export async function POST(request: Request) {
  const configError = ensureCloudinaryConfigured();
  if (configError) {
    return NextResponse.json({ error: configError }, { status: 500 });
  }

  const token = extractBearerToken(request.headers.get("authorization"));
  const authUser = token ? verifyAuthToken(token) : null;
  if (!authUser) {
    return NextResponse.json(
      { error: "Unauthorized. Provide a valid Bearer token." },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();
    const payload = formData.get("file");
    const originalFileName = formData.get("originalFileName");
    const clientQueueItemId = formData.get("clientQueueItemId");
    const processingModeRaw = formData.get("processingMode");

    if (
      typeof processingModeRaw !== "string" ||
      !validProcessingModes.includes(processingModeRaw as ProcessingMode)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid processing mode. Use with_bg_removal or without_bg_removal.",
        },
        { status: 400 },
      );
    }

    const processingMode = processingModeRaw as ProcessingMode;

    if (!(payload instanceof File)) {
      return NextResponse.json(
        { error: "Missing processed file payload." },
        { status: 400 },
      );
    }

    if (!isAcceptedImageType(payload.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use PNG, JPEG, or WEBP." },
        { status: 400 },
      );
    }

    if (payload.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `Processed file is too large. Limit is ${MAX_UPLOAD_SIZE_MB}MB.`,
        },
        { status: 400 },
      );
    }

    const arrayBuffer = await payload.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUri = `data:${payload.type};base64,${base64}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder:
        processingMode === "with_bg_removal"
          ? "bg-removed-images"
          : "original-images",
      public_id: `${processingMode === "with_bg_removal" ? "bgless" : "original"}-${Date.now()}-${randomUUID().slice(0, 8)}`,
      resource_type: "image",
      overwrite: false,
    });

    let recordId: string | null = null;
    let persistenceWarning: string | null = null;

    try {
      await connectToDatabase();

      const createdRecord = await ProcessedUpload.create({
        ownerUser: authUser.username,
        fileName:
          typeof originalFileName === "string" && originalFileName.length > 0
            ? originalFileName
            : payload.name,
        cloudinaryUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        processingMode,
        clientQueueItemId:
          typeof clientQueueItemId === "string" && clientQueueItemId.length > 0
            ? clientQueueItemId
            : undefined,
      });

      recordId = String(createdRecord._id);
    } catch (mongoError) {
      const mongoMessage =
        mongoError instanceof Error
          ? mongoError.message
          : "MongoDB persistence failed.";
      persistenceWarning = `Cloudinary upload succeeded, but MongoDB save failed: ${mongoMessage}`;
    }

    return NextResponse.json(
      {
        secureUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        processingMode,
        recordId,
        persistenceWarning,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to upload image.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}