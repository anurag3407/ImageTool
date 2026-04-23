import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { extractBearerToken, verifyAuthToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { ProcessedUpload } from "@/models/processed-upload";

export const runtime = "nodejs";

const validProcessingModes = ["with_bg_removal", "without_bg_removal"] as const;
type ProcessingMode = (typeof validProcessingModes)[number];

export async function POST(request: Request) {
  const token = extractBearerToken(request.headers.get("authorization"));
  const authUser = token ? verifyAuthToken(token) : null;
  if (!authUser) {
    return NextResponse.json(
      { error: "Unauthorized. Provide a valid Bearer token." },
      { status: 401 },
    );
  }

  try {
    const payload = await request.json();
    const { cloudinaryUrl, publicId, fileName, processingMode, clientQueueItemId } = payload;

    if (!cloudinaryUrl || !publicId || !fileName || !processingMode) {
      return NextResponse.json(
        { error: "Missing required fields: cloudinaryUrl, publicId, fileName, processingMode." },
        { status: 400 },
      );
    }

    if (!validProcessingModes.includes(processingMode as ProcessingMode)) {
      return NextResponse.json(
        { error: "Invalid processing mode." },
        { status: 400 },
      );
    }

    let recordId: string | null = null;
    let persistenceWarning: string | null = null;

    try {
      await connectToDatabase();

      const createdRecord = await ProcessedUpload.create({
        ownerUser: authUser.username,
        fileName,
        cloudinaryUrl,
        cloudinaryPublicId: publicId,
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
        secureUrl: cloudinaryUrl,
        publicId,
        processingMode,
        recordId,
        persistenceWarning,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save record.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
