"use client";

import React, { useState, useEffect } from "react";
import { DashboardCards } from "../../components/dashboard/cards";
import ChartOverview from "../../components/dashboard/chartoverview";
import { ChartPieInteractive } from "../../components/dashboard/chartpie";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Contrato de dados unificado com os componentes gráficos
interface TransactionData {
  type: "expense" | "income";
  date: string | Date | { seconds: number; nanoseconds: number };
  transactionType?: string;
  money?: { value: number };
  id?: string;
}

export default function DashboardPage() {
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("07"); // Julho como padrão inicial
  const [userId, setUserId] = useState<string | null>(null);
  
  // Tipagem estrita aplicada ao estado global de transações
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
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

    // setTimeout evita o erro de "cascading renders" no linter do Next.js
    const timer = setTimeout(() => {
      setLoading(true);
    }, 0);

    const transRef = collection(db, "transactions");
    const q = query(transRef, where("user.uid", "==", userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Tipagem estrita aplicada também ao array temporário do snapshot
      const docs: TransactionData[] = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() } as TransactionData);
      });
      setTransactions(docs);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar transações da Dashboard:", error);
      setLoading(false);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [userId, selectedYear]);

  return (
    <main className="sm:ml-14 p-4 md:p-6 bg-transparent min-h-screen space-y-6">
      
      {/* 4 Cards Principais e Dinâmicos do Topo */}
      <DashboardCards 
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        firebaseData={transactions}
      />

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
          />
        </div>
      </div>
    </main>
  );
}