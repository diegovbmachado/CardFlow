"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TransactionData {
  type: "expense" | "income";
  date: string | Date | { seconds: number; nanoseconds: number };
  transactionType?: string;
  money?: { value: number };
}

interface CustomCardsProps {
  firebaseData: TransactionData[];
  selectedYear: string;
  selectedMonth: string;
  favoriteCategories: string[]; // Lista das 4 categorias que o usuário escolheu
}

export function CustomCards({ firebaseData, selectedYear, selectedMonth, favoriteCategories }: CustomCardsProps) {
  
  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    favoriteCategories.forEach(cat => totals[cat] = 0);

    firebaseData.forEach((trans) => {
       // Mesma lógica de tratamento de data que você já domina
       let dateStr = typeof trans.date === "string" ? trans.date : "";
       // (Adicione aqui o tratamento de objeto/Date se necessário para consistência)
       
       if (dateStr.startsWith(`${selectedYear}-${selectedMonth}`)) {
         const cat = trans.transactionType || "Outros";
         if (favoriteCategories.includes(cat)) {
           totals[cat] = (totals[cat] || 0) + (trans.money?.value || 0);
         }
       }
    });
    return totals;
  }, [firebaseData, selectedYear, selectedMonth, favoriteCategories]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full mt-6">
      {favoriteCategories.map((cat) => (
        <Card key={cat} className="bg-zinc-900/40 border border-zinc-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase text-zinc-500">{cat}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-white">
              R$ {(categoryData[cat] || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}