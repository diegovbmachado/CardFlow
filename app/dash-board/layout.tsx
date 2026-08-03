"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";

// Configuração da fonte tipográfica principal (Geist Sans)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Configuração da fonte monoespacial (Geist Mono)
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Layout de Rotas Protegidas do Dashboard (DashboardLayout).
 * Envolve todas as páginas internas do painel, assegurando que apenas usuários autenticados 
 * tenham acesso (`ProtectedRoute`). Aplica o tema visual padrão (fundo escuro `zinc-950`, 
 * imagem de fundo texturizada do globo com opacidade e camadas de degradê) e renderiza a navegação lateral (`Sidebar`).
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Protege o layout inteiro, impedindo o acesso não autorizado às sub-rotas do dashboard
    <ProtectedRoute>
      <div className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-zinc-950 text-white`}>
        
        {/* Container principal estrutural com controle de overflow */}
        <div className="relative flex min-h-screen w-full flex-col bg-zinc-950 overflow-hidden">
          
          {/* 1. IMAGEM DE FUNDO DO GLOBO (Textura visual sutil aplicada no fundo do dashboard) */}
          <div 
            className="absolute inset-0 bg-[url('/bg-globe.jpg')] bg-cover bg-center pointer-events-none z-10 opacity-20"
          />

          {/* 2. MÁSCARA DE GRADIENTE (Suaviza as bordas e garante contraste visual para o conteúdo) */}
          <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-transparent to-zinc-950 z-20 pointer-events-none" />

          {/* 3. CAMADA DE CONTEÚDO PRINCIPAL (Flutua acima do fundo com índice z-30) */}
          <div className="relative z-30 flex min-h-screen w-full flex-col">
            {/* Barra lateral de navegação */}
            <Sidebar />
            
            {/* Conteúdo dinâmico da página renderizado ao lado/abaixo da sidebar */}
            <div className="flex flex-col sm:gap-4">
              {children}
            </div>
          </div>

        </div>

      </div>
    </ProtectedRoute>
  );
}