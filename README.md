# ImageTool — Neo-Brutalist Background Removal SaaS

ImageTool is a high-performance, minimalist web application built with Next.js that allows users to rapidly remove backgrounds from images entirely in the browser using WASM, and seamlessly upload them directly to Cloudinary. It features a striking, high-contrast Neo-Brutalist design system.

![ImageTool Dashboard Architecture](https://img.shields.io/badge/Next.js-16.2.4-black?style=for-the-badge&logo=next.js)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Integration-blue?style=for-the-badge&logo=cloudinary)
![MongoDB](https://img.shields.io/badge/MongoDB-Persistence-green?style=for-the-badge&logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Core Features

- **In-Browser AI Inference**: Utilizes `@imgly/background-removal` to process images directly in the user's browser, eliminating expensive backend GPU costs.
- **Direct-to-Cloudinary Signed Uploads**: Images are sent directly from the browser to Cloudinary using secure, server-generated cryptographic signatures. This completely bypasses Vercel's strict 4.5MB free-tier serverless payload limits.
- **Neo-Brutalist Aesthetic**: Built from the ground up with a strict high-contrast color palette, hard un-blurred shadows, and playful mechanical push-button micro-interactions.
- **Modular Dashboard Architecture**: Clean separation of marketing landing pages and the functional workspace.
- **Secure Authentication**: Multi-user JWT-based authentication system backed by MongoDB.
- **Persistent Link History**: Every processed image is saved to a beautiful, responsive grid layout for easy access and clipboard copying.

## 🛠 Tech Stack

- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 (Neo-Brutalist Design System)
- **AI Model**: `isnet_quint8` via `@imgly/background-removal`
- **Storage**: Cloudinary (Signed Direct Uploads)
- **Database**: MongoDB (Mongoose)
- **Authentication**: Custom JWT implementation

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local` and add your secrets.
```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=image_tool

# Security
JWT_SECRET=generate_a_long_random_string
```

### 3. Run the Development Server
```bash
npm run dev
```
Open `http://localhost:3000` to see the landing page, and navigate to `/dashboard` to use the tool.

## 🏗 Architecture Details

### The Upload Pipeline
1. **Drop & Validate**: User drops an image (up to 12MB). File is validated for type and size.
2. **AI Processing**: If "Remove Background" is selected, the image is passed to the local WASM model.
3. **Signature Generation**: The client requests a secure upload signature from `/api/cloudinary-sign` via the JWT token.
4. **Direct Upload**: The processed Blob is uploaded directly to Cloudinary using the cryptographic signature.
5. **Persistence**: The resulting secure URL is saved to MongoDB via `/api/upload-record`.

### UI/UX Design System
The UI explicitly prevents OS-level Dark/Light mode overrides to maintain the strict yellow (`#ffe17c`), sage (`#b7c6c2`), and charcoal (`#171e19`) color palette. Component interactions rely on sharp `translate-x` and `translate-y` CSS transforms over smooth blurs.

## 🐛 Troubleshooting

| Error | Solution |
| :--- | :--- |
| `Upload preset must be whitelisted` | Ensure `CLOUDINARY_API_SECRET` is set correctly. The app uses Signed Uploads, which require the secret to generate a valid hash. |
| `Hydration failed because the server rendered HTML didn't match` | Ensure you aren't removing the `isMounted` checks in the Dashboard components. |
| `Unauthorized. Provide a valid Bearer token` | Your JWT has expired or the `JWT_SECRET` changed. Clear your `localStorage` and log in again. |
| Background model fails to load | First load takes longer to cache the model. If it repeatedly fails, ensure your network isn't blocking `.wasm` binaries. |
