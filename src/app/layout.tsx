import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Lumina",
  description: "Internal Goal Setting & Tracking Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased h-screen overflow-hidden flex bg-slate-50 relative`}>
        {/* Pastel background decoration */}
        <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-pink-50/80 via-orange-50/40 to-transparent pointer-events-none -z-10" />
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-pink-100/40 rounded-full blur-3xl pointer-events-none -z-10 transform -translate-x-1/2 -translate-y-1/4" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-yellow-100/40 rounded-full blur-3xl pointer-events-none -z-10 transform translate-x-1/3 -translate-y-1/4" />
        
        <Providers>
          <div className="flex h-screen w-full overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto z-0">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
