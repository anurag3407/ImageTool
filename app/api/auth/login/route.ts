import { NextResponse } from "next/server";
import crypto from "crypto";

import { signAuthToken } from "@/lib/auth";
import { User } from "@/models/user";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

type LoginRequestBody = {
  username?: string;
  password?: string;
};

// Helper to compare hashes
function verifyPassword(password: string, hashHex: string): boolean {
  const hash = crypto.createHash("sha256").update(password).digest("hex");
  return hash === hashHex;
}

export async function POST(request: Request) {
  let payload: LoginRequestBody;
  try {
    payload = (await request.json()) as LoginRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const username = payload.username?.trim() || "";
  const password = payload.password || "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required." },
      { status: 400 },
    );
  }

  try {
    await connectToDatabase();

    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 },
      );
    }

    const isPasswordValid = verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 },
      );
    }

    const token = signAuthToken(username);

    return NextResponse.json(
      {
        token,
        username,
        tokenType: "Bearer",
        expiresInSeconds: 7 * 24 * 60 * 60,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 },
    );
  }
}