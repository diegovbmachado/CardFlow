"use client";

import React, { useState, useEffect } from "react";
import ChartOverview from "../../components/dashboard/chartoverview";
import { ChartPieInteractive } from "../../components/dashboard/chartpie"; // Certifique-se de ajustar o caminho da pasta
import { db, auth } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function DashboardPage() {
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("07"); // Julho como padrão inicial
  const [userId, setUserId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  // Escuta o usuário logado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
    return () => unsubscribe();
  }, []);

// Busca Única no Firebase por Usuário (Linter estrito fix)
  useEffect(() => {
    if (!userId) return;

    // Se o usuário ou filtro mudar e você fizer questão de reativar o loading visual, 
    // usamos o setTimeout para tirá-lo do fluxo síncrono do efeito:
    setTimeout(() => {
      setLoading(true);
    }, 0);

    const transRef = collection(db, "transactions");
    const q = query(transRef, where("user.uid", "==", userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: Record<string, unknown>[] = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setTransactions(docs);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar transações da Dashboard:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, selectedYear]);// Adicionado selectedYear para resetar o loading se o ano mudar

  return (
    <main className="sm:ml-14 p-4 md:p-6 bg-transparent min-h-screen space-y-6">
      {/* Aqui futuramente ficarão os seus 4 cards customizáveis do topo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Espaço reservado para os cards */}
      </div>

      {/* Grid com o layout dos dois gráficos em perfeita sincronia */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <ChartOverview 
            selectedYear={selectedYear} 
            setSelectedYear={setSelectedYear} 
            firebaseData={transactions}
            loading={loading}
          />
        </div>
        <div>
          <ChartPieInteractive 
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            firebaseData={transactions}
            loading={loading}
          />
        </div>
      </div>
    </main>
  );
}