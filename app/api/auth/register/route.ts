import { NextResponse } from "next/server";
import crypto from "crypto";

import { signAuthToken } from "@/lib/auth";
import { User } from "@/models/user";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

type RegisterRequestBody = {
  username?: string;
  password?: string;
};

// Helper to hash passwords using native crypto module since bcryptjs cannot be installed
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  let payload: RegisterRequestBody;
  try {
    payload = (await request.json()) as RegisterRequestBody;
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

  if (username.length < 3) {
    return NextResponse.json(
      { error: "Username must be at least 3 characters long." },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters long." },
      { status: 400 },
    );
  }

  try {
    await connectToDatabase();

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists." },
        { status: 409 },
      );
    }

    const passwordHash = hashPassword(password);

    await User.create({
      username,
      passwordHash,
    });

    const token = signAuthToken(username);

    return NextResponse.json(
      {
        token,
        username,
        tokenType: "Bearer",
        expiresInSeconds: 7 * 24 * 60 * 60,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 },
    );
  }
}
