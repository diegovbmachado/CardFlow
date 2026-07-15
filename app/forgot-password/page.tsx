"use client";

import { useState } from "react";
import Link from "next/link";

// Importações do Firebase Auth e da configuração do auth
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Importando os componentes visuais do seu Shadcn UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); 
  const [error, setError] = useState("");     

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
      setEmail(""); 
    } catch (err: any) {
      console.error("Erro ao recuperar senha:", err);
      if (err.code === "auth/invalid-email") {
        setError("O e-mail digitado não é válido.");
      } else {
        setError("Ocorreu um erro ao enviar o e-mail. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full bg-black text-white flex items-center overflow-hidden">
      
      {/* Imagem do Globo à direita */}
      <div 
        className="absolute inset-y-0 right-0 w-full md:w-[60%] bg-[url('/bg-globe.jpg')] bg-cover bg-center md:bg-left pointer-events-none z-0 opacity-40 md:opacity-100"
        style={{ backgroundPosition: 'left center' }}
      />

      {/* Máscara de degradê preta para suavizar */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/60 md:bg-gradient-to-r md:from-black md:via-black/85 md:to-transparent z-10 pointer-events-none" />

      {/* Formulário de Recuperação de Senha */}
      <div className="relative z-20 w-full max-w-md px-6 py-12 sm:px-12 md:ml-16 lg:ml-32 flex flex-col justify-center min-h-screen">
        
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Recuperar senha<span className="text-pink-500">.</span>
          </h1>
          <p className="text-sm font-semibold text-zinc-400">
            Insira seu e-mail para receber as instruções de recuperação.
          </p>
        </div>

        {/* Alerta de Sucesso */}
        {message && (
          <div className="mb-6 p-3 text-xs text-green-200 bg-green-950/40 border border-green-900 rounded-md font-semibold text-center backdrop-blur-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 text-xs text-red-200 bg-red-950/40 border border-red-900 rounded-md font-semibold text-center backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-6">
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

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full text-base font-bold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:opacity-90 text-white transition-all duration-300 py-6 rounded-lg"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar link de recuperação"}
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center md:text-left">
          <p className="text-sm text-zinc-400">
            Lembrou suas credenciais?{" "}
            <Link href="/" className="text-purple-400 hover:text-purple-300 font-bold underline">
              Voltar ao login
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}