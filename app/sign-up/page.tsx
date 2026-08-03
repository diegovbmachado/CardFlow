"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Importações dos módulos de autenticação e gerenciamento de perfil do Firebase
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Importação dos componentes visuais da biblioteca Shadcn UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Página de Cadastro de Nova Conta (SignUpPage).
 * Permite que novos usuários registrem-se informando nome, e-mail e senha,
 * realizando a criação da credencial no Firebase Auth e atualizando o nome de exibição.
 */
export default function SignUpPage() {
  const router = useRouter();
  
  // Estados locais para controle do formulário, validações, erros e estado de carregamento
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Manipulador do processo de cadastro.
   * Valida as senhas digitadas, interage com o Firebase Auth para criar o usuário 
   * e define o nome de exibição (displayName) antes de redirecionar para o dashboard.
   */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validação de correspondência entre senha e confirmação de senha
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    // Validação do requisito mínimo de segurança de caracteres da senha
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      // Criação da conta com e-mail e senha no Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Atualiza o perfil do usuário recém-criado para incluir o Nome Completo (displayName)
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name,
        });
      }

      // Redireciona o usuário para o dashboard principal após o sucesso
      router.push("/dash-board");
    } catch (err: any) {
      console.error("Erro ao cadastrar:", err);
      // Tratamento amigável para os erros mais comuns do Firebase Auth
      if (err.code === "auth/email-already-in-use") {
        setError("Este e-mail já está em uso por outra conta.");
      } else if (err.code === "auth/invalid-email") {
        setError("O e-mail digitado não é válido.");
      } else {
        setError("Ocorreu um erro ao criar a conta.");
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

      {/* 2. MÁSCARA DE DEGRADÊ (Para suavizar o fundo e garantir contraste no formulário) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/60 md:bg-gradient-to-r md:from-black md:via-black/85 md:to-transparent z-10 pointer-events-none" />

      {/* 3. CONTEÚDO E FORMULÁRIO DE CADASTRO */}
      <div className="relative z-20 w-full max-w-md px-6 py-12 sm:px-12 md:ml-16 lg:ml-32 flex flex-col justify-center min-h-screen">
        
        {/* Cabeçalho */}
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Crie sua conta<span className="text-pink-500">.</span>
          </h1>
          <p className="text-sm font-semibold text-zinc-400">
            Preencha os dados abaixo para começar.
          </p>
        </div>

        {/* Exibição condicional de Alerta de Erro */}
        {error && (
          <div className="mb-6 p-3 text-xs text-red-200 bg-red-950/40 border border-red-900 rounded-md font-semibold text-center backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Formulário Principal de Registro */}
        <form onSubmit={handleSignUp} className="space-y-5">
          
          {/* Campo Nome Completo */}
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm font-bold text-zinc-300">
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
              className="bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-purple-500"
            />
          </div>

          {/* Campo E-mail */}
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
            <Label htmlFor="password" className="text-sm font-bold text-zinc-300">
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
              className="bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-purple-500"
            />
          </div>

          {/* Campo Confirmar Senha */}
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword" className="text-sm font-bold text-zinc-300">
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
              className="bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-purple-500"
            />
          </div>

          {/* Botão de Submissão */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full text-base font-bold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:opacity-90 text-white transition-all duration-300 py-6 rounded-lg"
              disabled={loading}
            >
              {loading ? "Criando conta..." : "Registrar"}
            </Button>
          </div>
        </form>

        {/* Rodapé: Link para retornar à tela de Login */}
        <div className="mt-8 text-center md:text-left">
          <p className="text-sm text-zinc-400">
            Já tem uma conta?{" "}
            <Link href="/" className="text-purple-400 hover:text-purple-300 font-bold underline">
              Fazer login
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}