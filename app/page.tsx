"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Importando os métodos de login do Firebase e as nossas configurações
// Adicionamos o "signInWithPopup" e o "googleProvider"
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase"; 

// Importando o visual (Shadcn UI)
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function CardDemo() {
  const router = useRouter();
  
  // Estados para os inputs, erros e carregamento
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Função de login com E-mail e Senha (que já estava funcionando)
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
      } else if (err.code === "auth/too-many-requests") {
        setError("Muitas tentativas malsucedidas. Tente novamente mais tarde.");
      } else {
        setError("Ocorreu um erro ao fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. NOVA FUNÇÃO: Login com o Google
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      // Abre a janela pop-up de login do Google
      await signInWithPopup(auth, googleProvider);
      
      // Se der certo, redireciona o usuário para a dashboard
      router.push("/dash-board");
    } catch (err: any) {
      console.error("Erro ao logar com Google:", err);
      
      // Se o usuário simplesmente fechar a janelinha do Google, não exibimos erro feio
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Não foi possível autenticar com o Google. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-bold">
            Faça login na sua conta.
          </CardTitle>

          <CardDescription className="text-sm sm:text-base font-bold">
            Insira seu e-mail abaixo para acessar sua conta.
          </CardDescription>

          <CardAction>
            <Button
              variant="link"
              asChild
              className="text-base sm:text-lg font-bold"
            >
              <Link href="/sign-up">Cadastrar-se</Link>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              
              {/* Exibição de mensagens de erro se houver */}
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md font-medium text-center">
                  {error}
                </div>
              )}

              <div className="grid gap-2">
                <Label
                  htmlFor="email"
                  className="text-base sm:text-lg font-bold"
                >
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
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label
                    htmlFor="password"
                    className="text-base sm:text-lg font-bold"
                  >
                    Senha
                  </Label>

                  <Button
                    variant="link"
                    asChild
                    className="ml-auto text-base sm:text-lg font-bold underline-offset-4 hover:underline"
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
                />
              </div>
            </div>

            <CardFooter className="mt-6 flex-col gap-2 px-0">
              <Button
                type="submit"
                className="w-full text-base sm:text-lg font-bold"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Login"}
              </Button>

              {/* Botão do Google AGORA ATIVO e conectado com a nova função */}
              <Button
                type="button"
                variant="outline"
                className="w-full text-base sm:text-lg font-bold"
                disabled={loading}
                onClick={handleGoogleLogin}
              >
                Login com Google
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}