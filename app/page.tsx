"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Importando a função de login do Firebase e a nossa configuração do auth
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Ajuste o caminho se a sua pasta "lib" estiver em outro lugar

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
  
  // Estados para capturar os dados dos inputs, erros e estado de carregamento
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Limpa erros antigos
    setLoading(true); // Ativa o estado de carregando

    try {
      // Faz o login no Firebase com os dados do estado
      await signInWithEmailAndPassword(auth, email, password);
      
      // Se der certo, redireciona para a dashboard
      router.push("/dash-board");
    } catch (err: any) {
      // Trata erros comuns do Firebase para o usuário entender o que aconteceu
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("E-mail ou senha incorretos.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Muitas tentativas malsucedidas. Tente novamente mais tarde.");
      } else {
        setError("Ocorreu um erro ao fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false); // Desativa o carregamento independente de ter dado certo ou errado
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

              <Button
                type="button"
                variant="outline"
                className="w-full text-base sm:text-lg font-bold"
                disabled={loading}
                onClick={() => alert("O login com Google ainda não está disponível.")}
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