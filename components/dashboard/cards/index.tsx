"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, Wallet, Percent } from "lucide-react";

interface TransactionData {
  type: "expense" | "income";
  date: string | Date | { seconds: number; nanoseconds: number };
  transactionType?: string;
  money?: { value: number };
}

interface DashboardCardsProps {
  selectedYear: string;
  selectedMonth: string;
  firebaseData: TransactionData[];
}

/**
 * Componente de Cartões Principais do Dashboard (DashboardCards).
 * Processa as transações do mês/ano filtrados e calcula os indicadores globais:
 * Saldo Líquido, Total de Receitas, Total de Despesas e Taxa de Comprometimento.
 */
export function DashboardCards({ selectedYear, selectedMonth, firebaseData }: DashboardCardsProps) {
  
  /**
   * Memoriza o cálculo matemático das métricas macro para evitar reprocessamentos desnecessários.
   */
  const metrics = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    firebaseData.forEach((trans) => {
      if (!trans.date) return;

      // Tratamento seguro para conversão de datas vindas do Firestore (String, Date ou Timestamp)
      let dateStr = "";
      if (typeof trans.date === "string") {
        dateStr = trans.date;
      } else if (trans.date && typeof trans.date === "object" && "seconds" in trans.date) {
        const timestamp = trans.date as { seconds: number };
        dateStr = new Date(timestamp.seconds * 1000).toISOString();
      } else if (trans.date instanceof Date) {
        dateStr = trans.date.toISOString();
      }

      if (!dateStr || !dateStr.includes("-")) return;

      const [ano, mes] = dateStr.split("-");

      // Filtra e acumula valores estritamente para o ano e mês selecionados
      if (ano === selectedYear && mes === selectedMonth) {
        const valor = trans.money?.value || 0;
        if (trans.type === "income") {
          totalIncome += valor;
        } else if (trans.type === "expense") {
          totalExpense += valor;
        }
      }
    });

    const balance = totalIncome - totalExpense;
    
    // Cálculo da taxa percentual de comprometimento da receita com despesas
    const expenseRate = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

    return {
      income: totalIncome,
      expense: totalExpense,
      balance,
      rate: expenseRate,
    };
  }, [firebaseData, selectedYear, selectedMonth]);

  /**
   * Função auxiliar para formatar valores numéricos para o padrão de moeda Real (BRL).
   */
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full">
      
      {/* CARD 1: SALDO DISPONÍVEL (Balanço Líquido) */}
      <Card className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 text-white shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Saldo Disponível
          </CardTitle>
          <Wallet className={`h-4 w-4 ${metrics.balance >= 0 ? "text-purple-500" : "text-red-500"}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-extrabold tracking-tight ${metrics.balance < 0 && "text-red-400"}`}>
            {formatCurrency(metrics.balance)}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">
            Balanço líquido do período
          </p>
        </CardContent>
      </Card>

      {/* CARD 2: TOTAL DE RECEITAS (Ganhos do Período) */}
      <Card className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 text-white shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Total Receitas
          </CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-extrabold tracking-tight text-emerald-400">
            {formatCurrency(metrics.income)}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">
            Ganhos acumulados no mês
          </p>
        </CardContent>
      </Card>

      {/* CARD 3: TOTAL DE DESPESAS (Gastos do Período) */}
      <Card className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 text-white shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Total Despesas
          </CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-pink-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-extrabold tracking-tight text-pink-400">
            {formatCurrency(metrics.expense)}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">
            Gastos computados no mês
          </p>
        </CardContent>
      </Card>

      {/* CARD 4: TAXA DE COMPROMETIMENTO (Percentual gasto em relação à receita) */}
      <Card className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 text-white shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Comprometimento
          </CardTitle>
          <Percent className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-extrabold tracking-tight text-amber-400">
            {metrics.rate.toFixed(1)}%
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">
            Da receita comprometida com gastos
          </p>
        </CardContent>
      </Card>

    </div>
  );
}