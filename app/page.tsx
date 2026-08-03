"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Importações dos módulos de autenticação do Firebase
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase"; 

// Componentes da biblioteca de UI (Shadcn UI)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Página de Autenticação / Login (LoginPage).
 * Ponto de entrada principal do aplicativo. Permite que o usuário autentique-se 
 * via e-mail e senha cadastrados ou através de sua conta Google, redirecionando-o para o dashboard.
 */
export default function LoginPage() {
  const router = useRouter();
  
  // Estados locais para gerenciar campos do formulário, mensagens de erro e status de carregamento
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Manipulador do login tradicional por e-mail e senha.
   * Realiza a chamada assíncrona ao Firebase Auth e redireciona em caso de sucesso.
   */
  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dash-board");
    } catch (err) {
      const errorAuth = err as { code: string };
      console.error(errorAuth);
      // Tratamento amigável de erros comuns retornados pelo Firebase Auth
      if (errorAuth.code === "auth/invalid-credential" || errorAuth.code === "auth/wrong-password" || errorAuth.code === "auth/user-not-found") {
        setError("E-mail ou senha incorretos.");
      } else {
        setError("Ocorreu um erro ao fazer login.");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manipulador do login social via pop-up do Google.
   */
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dash-board");
    } catch (err) {
      const errorAuth = err as { code: string };
      console.error("Erro Google:", errorAuth);
      // Ignora o erro caso o usuário simplesmente feche a janela pop-up intencionalmente
      if (errorAuth.code !== "auth/popup-closed-by-user") {
        setError("Não foi possível autenticar com o Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full bg-black text-white flex items-center overflow-hidden">
      
      {/* 1. IMAGEM DO GLOBO DE FUNDO (Background Visual) */}
      <div 
        className="absolute inset-y-0 right-0 w-full md:w-[60%] bg-[url('/bg-globe.jpg')] bg-cover bg-center md:bg-left pointer-events-none z-0 opacity-40 md:opacity-100"
        style={{ backgroundPosition: 'left center' }}
      />

      {/* 2. MÁSCARA DE DEGRADÊ (Para escurecer o fundo e dar contraste ao formulário) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/60 md:bg-gradient-to-r md:from-black md:via-black/85 md:to-transparent z-10 pointer-events-none" />

      {/* 3. CONTEÚDO E FORMULÁRIO DE LOGIN */}
      <div className="relative z-20 w-full max-w-md px-6 py-12 sm:px-12 md:ml-16 lg:ml-32 flex flex-col justify-center min-h-screen">
        
        {/* Cabeçalho de Boas-vindas */}
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Faça seu Login<span className="text-pink-500">.</span>
          </h1>
          <p className="text-sm font-semibold text-zinc-400">
            Insira seu e-mail abaixo para acessar sua conta.
          </p>
        </div>

        {/* Exibição condicional de Alerta de Erro */}
        {error && (
          <div className="mb-6 p-3 text-xs text-red-200 bg-red-950/40 border border-red-900 rounded-md font-semibold text-center backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Formulário Principal */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Campo de E-mail */}
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

          {/* Campo de Senha com link de recuperação */}
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
            
            {/* Botão de Submissão (Entrar com E-mail) */}
            <Button
              type="submit"
              className="w-full text-base font-bold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:opacity-90 text-white transition-all duration-300 py-6 rounded-lg"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            {/* Divisor Visual "Ou" */}
            <div className="relative w-full flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800" />
              </div>
              <span className="relative bg-black px-2 text-[10px] uppercase font-bold text-zinc-500">
                Ou
              </span>
            </div>

            {/* Botão de Login Social via Google */}
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

        {/* Rodapé do Card: Link para página de Cadastro */}
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