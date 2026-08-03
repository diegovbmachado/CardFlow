"use client";

import React, { useState, useEffect } from "react";
import { DashboardCards } from "../../components/dashboard/cards";
import { CustomCards } from "../../components/dashboard/cards/CustomCards";
import ChartOverview from "../../components/dashboard/chartoverview";
import { ChartPieInteractive } from "../../components/dashboard/chartpie";
import { CryptoChart } from "@/components/dashboard/cryptochart"; 
import { db, auth } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface TransactionData {
  type: "expense" | "income";
  date: string | Date | { seconds: number; nanoseconds: number };
  transactionType?: string;
  money?: { value: number };
  id?: string;
}

/**
 * Página Principal do Dashboard (DashboardPage).
 * Centraliza o gerenciamento de estados globais de filtros (Ano e Mês), 
 * escuta em tempo real os dados de transações e preferências do usuário autenticado no Firestore,
 * e distribui as informações para os componentes visuais e gráficos do painel.
 */
export default function DashboardPage() {
  // Estados globais de filtro e controle de sessão
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("07");
  const [userId, setUserId] = useState<string | null>(null);
  
  // Estados de dados e carregamento
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Monitoramento de autenticação do usuário.
   * Captura o UID ativo assim que a sessão é validada pelo Firebase Auth.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
    return () => unsubscribe();
  }, []);

  /**
   * Sincronização em tempo real (Real-time Listeners) com o Firestore.
   * Dispara assim que o ID do usuário é obtido, escutando alterações na coleção de transações 
   * e no documento de configurações/favoritos do usuário.
   */
  useEffect(() => {
    if (!userId) return;

    // 1. Escuta em tempo real das transações do usuário logado
    const transRef = collection(db, "transactions");
    const q = query(transRef, where("user.uid", "==", userId));
    const unsubTrans = onSnapshot(q, (snapshot) => {
      const docs: TransactionData[] = [];
      snapshot.forEach((doc) => docs.push({ id: doc.id, ...doc.data() } as TransactionData));
      setTransactions(docs);
      setLoading(false);
    });

    // 2. Escuta em tempo real das categorias favoritas (user_settings)
    const unsubPrefs = onSnapshot(doc(db, "user_settings", userId), (doc) => {
      if (doc.exists()) {
        setFavoriteCategories(doc.data().favorites || []);
      }
    });

    // Limpeza dos listeners do Firestore ao desmontar o componente
    return () => { unsubTrans(); unsubPrefs(); };
  }, [userId]);

  return (
    <main className="sm:ml-14 p-4 md:p-6 bg-transparent min-h-screen space-y-6">
      
      {/* 1. CARDS DE MÉTRICAS GLOBAIS (Saldo, Receitas, Despesas e Comprometimento) */}
      <DashboardCards 
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        firebaseData={transactions}
      />

      {/* 2. CARDS CUSTOMIZADOS POR CATEGORIAS FAVORITAS */}
      <CustomCards 
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        firebaseData={transactions}
        favoriteCategories={favoriteCategories} 
      />

      {/* 3. SEÇÃO DE GRÁFICOS ANALÍTICOS (Fluxo de Caixa Anual + Distribuição por Pizza) */}
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

      {/* 4. GRÁFICO DE MONITORAMENTO DE CRIPTOMOEDAS */}
      <div className="w-full">
        <CryptoChart />
      </div>

    </main>
  );
}