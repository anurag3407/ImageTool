import { NextResponse } from "next/server";

import { extractBearerToken, verifyAuthToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { ProcessedUpload } from "@/models/processed-upload";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = extractBearerToken(request.headers.get("authorization"));
  const authUser = token ? verifyAuthToken(token) : null;

  if (!authUser) {
    return NextResponse.json(
      { error: "Unauthorized. Provide a valid Bearer token." },
      { status: 401 },
    );
  }

  try {
    await connectToDatabase();

    const records = await ProcessedUpload.find({ ownerUser: authUser.username })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const history = records.map((record) => ({
      id: String(record._id),
      fileName: record.fileName,
      cloudinaryUrl: record.cloudinaryUrl,
      cloudinaryPublicId: record.cloudinaryPublicId,
      processingMode: record.processingMode,
      createdAt: record.createdAt,
    }));

    return NextResponse.json({ history }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to fetch upload history from MongoDB.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}