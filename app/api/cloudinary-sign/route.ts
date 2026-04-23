import { NextResponse } from "next/server";
import crypto from "crypto";
import { extractBearerToken, verifyAuthToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = extractBearerToken(authHeader);
    const authUser = token ? verifyAuthToken(token) : null;

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { folder } = body;
    const timestamp = Math.round(new Date().getTime() / 1000);
    const secret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY;

    if (!secret || !apiKey) {
      return NextResponse.json({ error: "Cloudinary credentials missing on server." }, { status: 500 });
    }

    let strToSign = "";
    if (folder) {
      strToSign += `folder=${folder}&`;
    }
    strToSign += `timestamp=${timestamp}`;
    strToSign += secret;

    const signature = crypto.createHash("sha1").update(strToSign).digest("hex");

    return NextResponse.json({ timestamp, signature, apiKey });
  } catch (error: any) {
    console.error("Cloudinary Signature Error:", error);
    return NextResponse.json({ error: "Failed to generate signature" }, { status: 500 });
  }
}
