import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ImageTool | Premium Image Processing SaaS",
  description:
    "Professional grade background removal and Cloudinary integration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-background text-foreground flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
