import { model, models, Schema, type InferSchemaType } from "mongoose";

const processingModes = ["with_bg_removal", "without_bg_removal"] as const;

const processedUploadSchema = new Schema(
  {
    ownerUser: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
      trim: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
      trim: true,
    },
    processingMode: {
      type: String,
      required: true,
      enum: [...processingModes],
    },
    clientQueueItemId: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

processedUploadSchema.index({ ownerUser: 1, createdAt: -1 });

export type ProcessedUploadDocument = InferSchemaType<typeof processedUploadSchema>;

export const ProcessedUpload =
  models.ProcessedUpload || model("ProcessedUpload", processedUploadSchema);