"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * Componente de Proteção de Rotas (ProtectedRoute).
 * Intercepta o acesso às páginas internas do dashboard, verificando se o usuário 
 * possui uma sessão ativa no Firebase Auth. Caso não esteja autenticado, 
 * redireciona automaticamente para a tela de login.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  /**
   * Monitoramento em tempo real do estado de autenticação via Firebase Auth.
   * Adiciona um observer que valida a sessão ao carregar e limpa a subscription ao desmontar.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
        router.push("/"); // Redireciona o usuário não autenticado de volta para a raiz (Login)
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  /**
   * Tela de Carregamento Preventivo (Splash / Loader).
   * Exibida temporariamente enquanto o Firebase valida o estado assíncrono da sessão,
   * evitando piscadas de tela ou acesso indevido indesejado.
   */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-lg font-bold animate-pulse text-muted-foreground">
          Carregando...
        </div>
      </div>
    );
  }

  // Renderiza os componentes filhos protegidos apenas se a autenticação for verdadeira
  return authenticated ? <>{children}</> : null;
}