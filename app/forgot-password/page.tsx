"use client";

import { useState } from "react";
import Link from "next/link";

// Importações do Firebase Auth e da configuração do auth
import { sendPasswordResetEmail } from "firebase/auth";
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // Guarda mensagem de sucesso
  const [error, setError] = useState("");     // Guarda mensagem de erro

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Envia o e-mail de redefinição de senha do Firebase
      await sendPasswordResetEmail(auth, email);
      
      setMessage("E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.");
      setEmail(""); // Limpa o campo do e-mail
    } catch (err: any) {
      console.error("Erro ao recuperar senha:", err);
      
      // Trata erros comuns de redefinição do Firebase
      if (err.code === "auth/invalid-email") {
        setError("O e-mail digitado não é válido.");
      } else if (err.code === "auth/user-not-found") {
        // Nota: Por questões de segurança, versões mais recentes do Firebase podem não retornar 'user-not-found'
        setError("Não encontramos nenhuma conta com este e-mail.");
      } else {
        setError("Ocorreu um erro ao enviar o e-mail. Tente novamente.");
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
            Recuperar senha.
          </CardTitle>

          <CardDescription className="text-sm sm:text-base font-bold">
            Insira seu e-mail para receber as instruções de recuperação.
          </CardDescription>

          <CardAction>
            <Button
              variant="link"
              asChild
              className="text-base sm:text-lg font-bold"
              disabled={loading}
            >
              <Link href="/">Voltar ao login</Link>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleResetPassword}>
            <div className="flex flex-col gap-6">
              
              {/* Alerta de Sucesso */}
              {message && (
                <div className="p-3 text-sm text-green-700 bg-green-100 border border-green-200 rounded-md font-medium text-center">
                  {message}
                </div>
              )}

              {/* Alerta de Erro */}
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-100 border border-red-200 rounded-md font-medium text-center">
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
            </div>

            <CardFooter className="mt-6 flex-col gap-2 px-0">
              <Button
                type="submit"
                className="w-full text-base sm:text-lg font-bold"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}