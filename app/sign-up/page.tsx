"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Importações do Firebase Auth e do nosso arquivo de configuração
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";

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
  
  // Estados para controlar os inputs e mensagens de erro/carregamento
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Limpa erros antigos

    // 1. Validação local: Senhas precisam ser iguais
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    // 2. Validação local: Senha forte (Firebase exige no mínimo 6 caracteres)
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      // 3. Cria o usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 4. Salva o Nome no perfil do usuário recém-criado
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name,
        });
      }

      // 5. Redireciona com sucesso para a Dashboard
      router.push("/dash-board");
    } catch (err: any) {
      console.error("Erro ao cadastrar:", err);
      
      // Trata erros comuns de cadastro do Firebase
      if (err.code === "auth/email-already-in-use") {
        setError("Este e-mail já está em uso por outra conta.");
      } else if (err.code === "auth/invalid-email") {
        setError("O e-mail digitado não é válido.");
      } else {
        setError("Ocorreu um erro ao criar a conta. Tente novamente.");
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
              disabled={loading}
            >
              <Link href="/">Fazer login</Link>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              
              {/* Mensagem de Erro (se houver) */}
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md font-medium text-center">
                  {error}
                </div>
              )}

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
                  placeholder="Mínimo de 6 caracteres"
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
                  placeholder="Digite a senha novamente"
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