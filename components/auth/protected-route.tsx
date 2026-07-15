"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Fica escutando se o usuário está logado ou não no Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
        router.push("/"); // Se não estiver logado, manda de volta para o login
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Enquanto o Firebase verifica se há um usuário ativo, mostramos uma tela de carregamento simples
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-lg font-bold animate-pulse text-muted-foreground">
          Carregando...
        </div>
      </div>
    );
  }

  // Se estiver autenticado, renderiza a página normalmente
  return authenticated ? <>{children}</> : null;
}