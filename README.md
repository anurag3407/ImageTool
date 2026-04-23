# Background Removal Console (Next.js)

A Technical Minimalist web app that:

1. Accepts multiple image files.
2. Lets you choose per upload mode: with background removal or direct upload.
3. Processes items one-by-one (strict sequential queue).
4. Uploads to Cloudinary and streams each secure URL as soon as that item finishes.
5. Saves URL history in MongoDB (URL metadata only, no image binaries).
6. Protects upload and history APIs with JWT.

## Stack

- Next.js App Router + TypeScript
- `@imgly/background-removal` for free in-browser background removal
- Cloudinary server-side upload route
- MongoDB (Mongoose) for persistence
- JWT auth (login + bearer token verification)

## Install

```bash
npm install
```

## Environment

1. Copy `.env.example` to `.env.local`.
2. Add your Cloudinary values:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MONGODB_URI=mongodb+srv://username:password@cluster0.example.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=image_tool
JWT_SECRET=replace_with_a_long_random_secret
AUTH_USERNAME=replace_with_login_username
AUTH_PASSWORD=replace_with_login_password
```

Use `.env.local` for real secrets. Keep `.env.example` as placeholders only.

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Queue behavior

1. Files are added in selected order.
2. Valid files move through:
	- `pending`
	- `removing_background`
	- `uploading_cloudinary`
	- `done` or `failed`
3. Each queue item stores the selected mode (`with_bg_removal` / `without_bg_removal`).
3. Failures do not stop the queue.
4. Failed items can be retried individually.
5. Completed items expose:
	- open link
	- copy link
	- copy all successful URLs

## Size and format rules

- Accepted types: PNG, JPEG, WEBP
- Max file size: 12MB per item
- Large files (over 4MB) are optionally resized client-side first to improve speed

Tradeoff: resizing speeds up local inference and upload, but may reduce detail in edge quality.

## Cloudinary upload details

- API route: `app/api/upload-processed/route.ts`
- Upload folder: `bg-removed-images` (with bg removal) or `original-images` (without bg removal)
- Secure URLs returned per item
- Cloudinary secrets remain server-side only

## MongoDB persistence details

- Mongo connection helper: `lib/mongodb.ts`
- Mongoose model: `models/processed-upload.ts`
- Every successful Cloudinary upload is saved with URL-only metadata:
	- owner user (from JWT)
	- file name
	- Cloudinary URL + public id
	- processing mode
	- client queue item id
	- timestamps
- History endpoint: `app/api/upload-history/route.ts` (latest 50 records per authenticated user)

## JWT auth details

- Login endpoint: `app/api/auth/login/route.ts`
- Client gets token via username/password and sends `Authorization: Bearer <token>`
- Protected endpoints:
	- `POST /api/upload-processed`
	- `GET /api/upload-history`

## Manual test checklist

1. Select 3-5 valid images and confirm items process one-by-one.
2. Test both modes:
	- with background removal
	- without background removal
3. Confirm each row receives a secure URL as it completes.
4. Confirm completed rows include a MongoDB record reference in detail text.
5. Confirm URL history panel previews images from stored URLs.
6. Call `/api/upload-history` with a bearer token and verify records are user-scoped.
7. Upload one invalid file type and confirm row fails with validation message.
8. Retry a failed row and confirm it can finish independently.
9. Click `Copy URL` and `Copy All URLs` and verify clipboard output.

## Troubleshooting

1. `Cloudinary credentials are missing`
	- Verify `.env.local` contains all three Cloudinary keys.
	- Restart the dev server after editing env vars.

2. `MONGODB_URI is missing`
	- Add `MONGODB_URI` in `.env.local`.
	- Optional: add `MONGODB_DB_NAME`.
	- Restart the dev server.

3. `Unauthorized. Provide a valid Bearer token.`
	- Login from the app UI first (JWT section).
	- Verify `JWT_SECRET`, `AUTH_USERNAME`, and `AUTH_PASSWORD` are set.

4. Background model fails to load
	- Check browser network access to IMG.LY model assets.
	- If your environment blocks this, switch to a local rembg microservice fallback.

5. Slow first image
	- Expected. First run downloads and caches model files.

6. Next.js compatibility edge cases
	- `@imgly/background-removal` officially documents Next.js 15 support.
	- This app includes a user-facing fallback note for local rembg service when needed.
