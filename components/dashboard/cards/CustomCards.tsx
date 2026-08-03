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
  favoriteCategories: string[]; // Lista de categorias favoritas configuradas pelo usuário
}

/**
 * Componente de Cartões Customizados por Categoria (CustomCards).
 * Renderiza dinamicamente cards de resumo para as categorias favoritas selecionadas,
 * filtrando e somando os gastos correspondentes ao mês e ano vigentes.
 */
export function CustomCards({ firebaseData, selectedYear, selectedMonth, favoriteCategories }: CustomCardsProps) {
  
  /**
   * Processamento e agrupamento dos gastos segmentados por categoria favorita.
   */
  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    favoriteCategories.forEach(cat => totals[cat] = 0);

    firebaseData.forEach((trans) => {
       // Tratamento de data seguro para consistência com o restante da aplicação
       let dateStr = "";
       if (typeof trans.date === "string") {
         dateStr = trans.date;
       } else if (trans.date && typeof trans.date === "object" && "seconds" in trans.date) {
         dateStr = new Date((trans.date as any).seconds * 1000).toISOString();
       } else if (trans.date instanceof Date) {
         dateStr = trans.date.toISOString();
       }
       
       // Valida se a transação pertence ao ano e mês selecionados
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