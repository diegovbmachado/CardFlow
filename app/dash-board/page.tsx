"use client";

import React, { useState, useEffect } from "react";
import { DashboardCards } from "../../components/dashboard/cards";
import { CustomCards } from "../../components/dashboard/cards/CustomCards";
import ChartOverview from "../../components/dashboard/chartoverview";
import { ChartPieInteractive } from "../../components/dashboard/chartpie";
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

export default function DashboardPage() {
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("07");
  const [userId, setUserId] = useState<string | null>(null);
  
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]); // Estado das categorias favoritas
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    // 1. Busca Transações
    const transRef = collection(db, "transactions");
    const q = query(transRef, where("user.uid", "==", userId));
    const unsubTrans = onSnapshot(q, (snapshot) => {
      const docs: TransactionData[] = [];
      snapshot.forEach((doc) => docs.push({ id: doc.id, ...doc.data() } as TransactionData));
      setTransactions(docs);
      setLoading(false);
    });

    // 2. Busca Preferências (Favoritos)
    const unsubPrefs = onSnapshot(doc(db, "user_settings", userId), (doc) => {
      if (doc.exists()) {
        setFavoriteCategories(doc.data().favorites || []);
      }
    });

    return () => { unsubTrans(); unsubPrefs(); };
  }, [userId]);

  return (
    <main className="sm:ml-14 p-4 md:p-6 bg-transparent min-h-screen space-y-6">
      
      <DashboardCards 
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        firebaseData={transactions}
      />

      {/* Agora o array é dinâmico, vindo direto do banco */}
      <CustomCards 
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        firebaseData={transactions}
        favoriteCategories={favoriteCategories} 
      />

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