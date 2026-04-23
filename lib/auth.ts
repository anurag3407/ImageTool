import jwt from "jsonwebtoken";

const JWT_EXPIRY = "7d";

export type VerifiedAuthToken = {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is missing. Add it to your .env file.");
  }

  return secret;
}

export function signAuthToken(username: string): string {
  return jwt.sign({ username }, getJwtSecret(), {
    expiresIn: JWT_EXPIRY,
    subject: username,
  });
}

export function extractBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

export function verifyAuthToken(token: string): VerifiedAuthToken | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (!decoded || typeof decoded === "string") {
      return null;
    }

    const username =
      typeof decoded.username === "string"
        ? decoded.username
        : typeof decoded.sub === "string"
          ? decoded.sub
          : null;

    if (!username) {
      return null;
    }

    return {
      sub: username,
      username,
      iat: decoded.iat,
      exp: decoded.exp,
    };
  } catch {
    return null;
  }
}