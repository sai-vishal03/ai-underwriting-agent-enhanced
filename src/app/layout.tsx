import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { AuthProvider } from "@/components/auth/AuthContext";
import { Toaster } from "sonner";
import QueryProvider from "@/lib/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GrabOn AI Underwriting Dashboard",
  description: "Enterprise-grade AI-powered fintech underwriting platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0d0d0d] text-zinc-100 overflow-hidden`}
      >
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster 
              position="top-right" 
              theme="dark" 
              expand={false} 
              richColors 
              closeButton
              toastOptions={{
                className: 'bg-[#121212] border border-zinc-800 text-zinc-100 rounded-2xl shadow-2xl',
              }}
            />
          </AuthProvider>
        </QueryProvider>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
