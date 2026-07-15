"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <div className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-zinc-950 text-white`}>
        
        {/* Trocamos o bg-muted/40 para bg-zinc-950 para dar o fundo escuro e luxuoso */}
        <div className="flex min-h-screen w-full flex-col bg-zinc-950">
          <Sidebar />
          <div className="flex flex-col sm:gap-4">
            {children}
          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}