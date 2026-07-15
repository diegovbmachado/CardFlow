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
  Package,
  PanelBottom,
  Settings2,
  ShoppingBag,
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
      {/* Fundo alterado para bg-zinc-950 e bordas cinza-escuras */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 border-r border-zinc-900 bg-zinc-950 sm:flex flex-col">
        <nav className="flex flex-col items-center gap-4 px-2 py-5">
          <TooltipProvider>
            <Link
              href="#"
              className="flex h-9 w-9 shrink-0 items-center justify-center bg-primary text-primary-foreground rounded-full"
            >
              <Package className="h-4 w-4" />
              <span className="sr-only">Dashboard Avatar</span>
            </Link>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="#"
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

            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="#"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:text-white hover:bg-zinc-900"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span className="sr-only">Pedidos</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-zinc-900 text-white border-zinc-800">
                <p>Pedidos</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="#"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:text-white hover:bg-zinc-900"
                >
                  <Package className="h-5 w-5" />
                  <span className="sr-only">Produtos</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-zinc-900 text-white border-zinc-800">
                <p>Produtos</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="#"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:text-white hover:bg-zinc-900"
                >
                  <User className="h-5 w-5" />
                  <span className="sr-only">Clientes</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-zinc-900 text-white border-zinc-800">
                <p>Clientes</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="#"
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
          {/* Avatar discreto do usuário ativo */}
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

          {/* Botão de Sair com gatilho de Logout */}
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
              {/* Seção Superior do menu Mobile */}
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="#"
                  className="flex h-10 w-10 bg-primary rounded-full text-lg items-center justify-center text-primary-foreground md:text-base gap-2"
                  prefetch={false}
                >
                  <Package className="h-5 w-5 transition-all" />
                  <span>Logo</span>
                </Link>

                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-zinc-400 hover:text-white"
                  prefetch={false}
                >
                  <Home className="h-5 w-5 transition-all" />
                  Início
                </Link>

                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-zinc-400 hover:text-white"
                  prefetch={false}
                >
                  <ShoppingBag className="h-5 w-5 transition-all" />
                  Pedidos
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-zinc-400 hover:text-white"
                  prefetch={false}
                >
                  <Package className="h-5 w-5 transition-all" />
                  Produtos
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-zinc-400 hover:text-white"
                  prefetch={false}
                >
                  <User className="h-5 w-5 transition-all" />
                  Clientes
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-zinc-400 hover:text-white"
                  prefetch={false}
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
                        Usuário Ativo
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
          <h2 className="text-white font-bold">Menu</h2>
        </header>
      </div>
    </div>
  );
}