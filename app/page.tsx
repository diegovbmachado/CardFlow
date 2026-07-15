"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Importações do Firebase
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase"; 

// Componentes do Shadcn UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dash-board");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("E-mail ou senha incorretos.");
      } else {
        setError("Ocorreu um erro ao fazer login.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dash-board");
    } catch (err: any) {
      console.error("Erro Google:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Não foi possível autenticar com o Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Fundo totalmente preto da tela
    <main className="relative min-h-screen w-full bg-black text-white flex items-center overflow-hidden">
      
      {/* 1. IMAGEM DO GLOBO (Alinhada à direita e cobrindo o lado direito no desktop) */}
      <div 
        className="absolute inset-y-0 right-0 w-full md:w-[60%] bg-[url('/bg-globe.jpg')] bg-cover bg-center md:bg-left pointer-events-none z-0 opacity-40 md:opacity-100"
        style={{ backgroundPosition: 'left center' }} // Puxa o globo mais para a esquerda para esconder o texto "World Economics" original
      />

      {/* 2. MÁSCARA DE DEGRADÊ (Faz a imagem sumir gradualmente no preto à esquerda) */}
      {/* No Mobile: Máscara escura completa para dar leitura. No Desktop: Suave da esquerda para a direita */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/60 md:bg-gradient-to-r md:from-black md:via-black/85 md:to-transparent z-10 pointer-events-none" />

      {/* 3. CONTEÚDO E FORMULÁRIO (Alinhado totalmente à esquerda no Desktop e centralizado no Mobile) */}
      <div className="relative z-20 w-full max-w-md px-6 py-12 sm:px-12 md:ml-16 lg:ml-32 flex flex-col justify-center min-h-screen">
        
        {/* Título Estilizado */}
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Faça seu Login<span className="text-pink-500">.</span>
          </h1>
          <p className="text-sm font-semibold text-zinc-400">
            Insira seu e-mail abaixo para acessar sua conta.
          </p>
        </div>

        {/* Exibição de erro */}
        {error && (
          <div className="mb-6 p-3 text-xs text-red-200 bg-red-950/40 border border-red-900 rounded-md font-semibold text-center backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Campo Email */}
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm font-bold text-zinc-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-purple-500"
            />
          </div>

          {/* Campo Senha */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-bold text-zinc-300">
                Senha
              </Label>
              <Button
                variant="link"
                asChild
                className="text-xs font-bold text-zinc-400 hover:text-white p-0 h-auto underline"
                disabled={loading}
              >
                <Link href="/forgot-password">
                  Esqueceu sua senha?
                </Link>
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="bg-zinc-950/50 border-zinc-800 text-white focus-visible:ring-purple-500"
            />
          </div>

          {/* Botões de Ação */}
          <div className="space-y-3 pt-2">
            
            {/* Botão de Entrar com o degradê do botão da Imagem 2 */}
            <Button
              type="submit"
              className="w-full text-base font-bold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:opacity-90 text-white transition-all duration-300 py-6 rounded-lg"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            {/* Divisor */}
            <div className="relative w-full flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800" />
              </div>
              <span className="relative bg-black px-2 text-[10px] uppercase font-bold text-zinc-500">
                Ou
              </span>
            </div>

            {/* Botão Google minimalista e escuro */}
            <Button
              type="button"
              variant="outline"
              className="w-full text-sm font-bold bg-zinc-950/50 border-zinc-800 text-white hover:bg-zinc-900 transition-colors py-6"
              disabled={loading}
              onClick={handleGoogleLogin}
            >
              Entrar com Google
            </Button>
          </div>
        </form>

        {/* Link para criar conta */}
        <div className="mt-8 text-center md:text-left">
          <p className="text-sm text-zinc-400">
            Ainda não tem uma conta?{" "}
            <Link href="/sign-up" className="text-purple-400 hover:text-purple-300 font-bold underline">
              Cadastre-se
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}