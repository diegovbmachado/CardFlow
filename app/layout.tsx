import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; // Essencial para o Tailwind continuar funcionando

// Configuração da fonte principal (Geist Sans) com suporte a variáveis CSS
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
 * Metadados globais da aplicação (SEO e Título da Guia do Navegador).
 */
export const metadata: Metadata = {
  title: "CardFlow - Login",
  description: "Faça login para gerenciar seus gastos",
};

/**
 * Layout Raiz da Aplicação (RootLayout).
 * Envolve todas as páginas do Next.js App Router, injetando as configurações de idioma,
 * as fontes tipográficas personalizadas e a folha de estilos global.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Renderiza dinamicamente as páginas filhas da rota ativa */}
        {children}
      </body>
    </html>
  );
}