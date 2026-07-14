"use client";

// 1. Importando a lógica
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
// 2. Importando o visual (que está na sua pasta components/ui)
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
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
  const handleLogin = (e) => {
    e.preventDefault()

    // Futuramente aqui ficará o login com Firebase
    router.push("/dash-board");
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
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
                required
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
                >
                  <Link href="/forgot-password">
                    Esqueceu sua senha?
                  </Link>
                </Button>
              </div>

              <Input
                id="password"
                type="password"
                required
              />
            </div>
          </div>

          <CardFooter className="mt-6 flex-col gap-2 px-0">
            <Button
              type="submit"
              className="w-full text-base sm:text-lg font-bold"
            >
              Login
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full text-base sm:text-lg font-bold"
              onClick={() => alert("O login com Google ainda não está disponível.")}
            >
              Login com Google
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
    </main>
  )
}