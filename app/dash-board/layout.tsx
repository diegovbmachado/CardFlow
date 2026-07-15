"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/dashboard/sidebar";
// Importamos o componente de proteção que você criou
import { ProtectedRoute } from "@/components/auth/protected-route";

// Configuração das fontes originais do seu projeto
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
    // 1. Envolvemos todo o layout na rota protegida do Firebase
    <ProtectedRoute>
      {/* 2. Mantemos a div principal com as suas fontes bonitas e antialiased */}
      <div className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        
        {/* 3. Estrutura visual da sua Dashboard */}
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
          <Sidebar />
          <div className="flex flex-col sm:gap-4 sm:pl-14">
            {children}
          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}