"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Importando os componentes visuais do seu Shadcn UI
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

export default function SignUpPage() {
  const router = useRouter();
  
  // Estados para controlar os inputs e fluxo visual
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Futuramente aqui ficará a lógica de criar conta no Firebase Authentication
    alert("Pronto para integrar com o Firebase! Cadastrando usuário...");
    
    setLoading(false);
    router.push("/dash-board"); // Redireciona de forma simples por enquanto
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-bold">
            Crie sua conta.
          </CardTitle>

          <CardDescription className="text-sm sm:text-base font-bold">
            Preencha os dados abaixo para começar.
          </CardDescription>

          <CardAction>
            <Button
              variant="link"
              asChild
              className="text-base sm:text-lg font-bold"
            >
              <Link href="/">Fazer login</Link>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              
              {/* Campo Nome */}
              <div className="grid gap-2">
                <Label
                  htmlFor="name"
                  className="text-base sm:text-lg font-bold"
                >
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Campo Email */}
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

              {/* Campo Senha */}
              <div className="grid gap-2">
                <Label
                  htmlFor="password"
                  className="text-base sm:text-lg font-bold"
                >
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Campo Confirmar Senha */}
              <div className="grid gap-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-base sm:text-lg font-bold"
                >
                  Confirmar Senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? "Criando conta..." : "Registrar"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}