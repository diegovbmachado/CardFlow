"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "../../ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Importações do Firebase
import { signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";

import {
  Home,
  LogOut,
  PlusCircle,
  PanelBottom,
  Settings2,
  Wallet,
  User,
} from "lucide-react";
import {
  TooltipProvider,
  TooltipTrigger,
  Tooltip,
  TooltipContent,
} from "../../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Sidebar() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);

  // Monitora se o usuário está logado e pega as informações dele
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Função para fazer logout e voltar para a home de login
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/"); // Redireciona para a página inicial de login
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  // Pega a inicial do e-mail ou nome para mostrar no Avatar caso não tenha foto
  const getFallbackLetter = () => {
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <div className="flex w-full flex-col bg-zinc-950">
      {/* SIDEBAR PARA COMPUTADOR (Telas maiores que 'sm') */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-14 border-r border-zinc-900 bg-zinc-950 sm:flex flex-col">
        <nav className="flex flex-col items-center gap-4 px-2 py-5">
          <TooltipProvider>
            {/* Logo do App - Ícone de Carteira */}
            <Link
              href="/dash-board"
              className="flex h-9 w-9 shrink-0 items-center justify-center bg-purple-600 text-white rounded-full shadow-lg shadow-purple-500/20"
            >
              <Wallet className="h-4 w-4" />
              <span className="sr-only">CardFlow</span>
            </Link>

            {/* Link 1: Início (Dashboard) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dash-board"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:text-white hover:bg-zinc-900"
                >
                  <Home className="h-5 w-5" />
                  <span className="sr-only">Início</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-zinc-900 text-white border-zinc-800">
                <p>Início</p>
              </TooltipContent>
            </Tooltip>

            {/* Link 2: Registrar Lançamento (Antigo Pedidos) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dash-board/transactions"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:text-white hover:bg-zinc-900"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span className="sr-only">Registrar</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-zinc-900 text-white border-zinc-800">
                <p>Registrar Lançamento</p>
              </TooltipContent>
            </Tooltip>

            {/* Link 3: Configurações */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dash-board/settings"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:text-white hover:bg-zinc-900"
                >
                  <Settings2 className="h-5 w-5" />
                  <span className="sr-only">Configurações</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-zinc-900 text-white border-zinc-800">
                <p>Configurações</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>

        {/* Seção inferior Desktop */}
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 pb-16">
          {user && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="w-8 h-8 cursor-default border border-zinc-800">
                    {user.photoURL && <AvatarImage src={user.photoURL} />}
                    <AvatarFallback className="bg-zinc-900 text-white font-bold text-xs flex items-center justify-center w-full h-full">
                      {getFallbackLetter()}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-zinc-900 text-white border-zinc-800">
                  <p className="text-xs">{user.email}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleSignOut}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="h-5 w-5 text-red-500" />
                  <span className="sr-only">Sair</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-zinc-900 text-white border-zinc-800">
                <p>Sair</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>

      {/* HEADER E MENU PARA CELULAR/TABLET (Telas menores que 'sm') */}
      <div className="sm:hidden flex flex-col bg-zinc-950">
        <header className="sticky top-0 z-30 flex h-14 items-center px-4 border-b border-zinc-900 bg-zinc-950 gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800">
                <PanelBottom className="h-5 w-5" />
                <span className="sr-only">Abrir / fechar menu</span>
              </Button>
            </SheetTrigger>
            
            <SheetContent side="left" className="sm:max-w-xs flex flex-col h-full bg-zinc-950 border-r border-zinc-900 text-white">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/dash-board"
                  className="flex h-10 w-10 bg-purple-600 rounded-full text-lg items-center justify-center text-white gap-2 shadow-lg shadow-purple-500/20"
                >
                  <Wallet className="h-5 w-5" />
                </Link>

                <Link
                  href="/dash-board"
                  className="flex items-center gap-4 px-2.5 text-zinc-400 hover:text-white"
                >
                  <Home className="h-5 w-5 transition-all" />
                  Início
                </Link>

                <Link
                  href="/dash-board/transactions"
                  className="flex items-center gap-4 px-2.5 text-zinc-400 hover:text-white"
                >
                  <PlusCircle className="h-5 w-5 transition-all" />
                  Registrar
                </Link>

                <Link
                  href="/dash-board/settings"
                  className="flex items-center gap-4 px-2.5 text-zinc-400 hover:text-white"
                >
                  <Settings2 className="h-5 w-5 transition-all" />
                  Configurações
                </Link>
              </nav>

              {/* SEÇÃO INFERIOR MOBILE */}
              {user && (
                <div className="mt-auto pt-6 border-t border-zinc-900 flex flex-col gap-4">
                  <div className="flex items-center gap-3 px-2.5">
                    <Avatar className="w-9 h-9 border border-zinc-800">
                      {user.photoURL && <AvatarImage src={user.photoURL} />}
                      <AvatarFallback className="bg-zinc-900 text-white font-bold text-sm flex items-center justify-center w-full h-full">
                        {getFallbackLetter()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-semibold text-white truncate">
                        {user.displayName || "Usuário Ativo"}
                      </span>
                      <span className="text-xs text-zinc-400 truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-4 px-2.5 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md text-left w-full transition-colors font-medium"
                  >
                    <LogOut className="h-5 w-5" />
                    Sair da Conta
                  </button>
                </div>
              )}
            </SheetContent>
          </Sheet>
          <h2 className="text-white font-bold text-sm">CardFlow</h2>
        </header>
      </div>
    </div>
  );
}