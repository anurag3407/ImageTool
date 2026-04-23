import mongoose from "mongoose";

type MongooseCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var __mongooseCache: MongooseCache | undefined;
}

const globalCache = globalThis as typeof globalThis & {
  __mongooseCache?: MongooseCache;
};

const cached =
  globalCache.__mongooseCache ??
  (globalCache.__mongooseCache = {
    connection: null,
    promise: null,
  });

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.connection) {
    return cached.connection;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing. Add it to .env.local.");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, {
        dbName: process.env.MONGODB_DB_NAME || "image_tool",
      })
      .then((instance) => instance);
  }

  cached.connection = await cached.promise;
  return cached.connection;
}