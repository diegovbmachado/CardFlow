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
        
        {/* Container principal com a imagem de fundo do globo */}
        <div className="relative flex min-h-screen w-full flex-col bg-zinc-950 overflow-hidden">
          
          {/* 1. Imagem do Globo (Posicionada de forma sutil no fundo da Dashboard) */}
          <div 
            className="absolute inset-0 bg-[url('/bg-globe.jpg')] bg-cover bg-center pointer-events-none z-10 opacity-20"
          />

{/* 2. Máscara que escurece as bordas para dar contraste (z-20) */}
<div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-transparent to-zinc-950 z-20 pointer-events-none" />

          {/* 3. Sidebar e conteúdo flutuando acima do fundo estilizado (z-10) */}
          <div className="relative z-30 flex min-h-screen w-full flex-col">
            <Sidebar />
            <div className="flex flex-col sm:gap-4">
              {children}
            </div>
          </div>

        </div>

      </div>
    </ProtectedRoute>
  );
}