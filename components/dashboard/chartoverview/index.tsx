"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartConfig, ChartTooltipContent, ChartTooltip } from "../../ui/chart";
import { Bar, CartesianGrid, XAxis, BarChart } from "recharts";
import { ArrowUpCircle, ArrowDownCircle, Loader2 } from "lucide-react";

interface ChartOverviewProps {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  firebaseData: Array<{
    type: "expense" | "income";
    date: any;
    transactionType?: string;
    money?: { value: number };
  }>;
  loading: boolean;
}

// Array estático com os meses do ano abreviados (declarado fora do componente para otimização de dependências no useMemo)
const nomesMeses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/**
 * Componente de Visão Geral de Fluxo de Caixa (ChartOverview).
 * Agrupa as transações por mês do ano selecionado e exibe um gráfico de barras comparativo 
 * entre Entradas (Receitas) e Saídas (Despesas), além de totalizadores resumidos.
 */
export default function ChartOverview({ selectedYear, setSelectedYear, firebaseData, loading }: ChartOverviewProps) {
  
  /**
   * Processamento e consolidação dos dados brutos do Firestore.
   * Agrupa os valores somados de receitas e despesas mês a mês para o ano selecionado.
   */
  const chartData = useMemo(() => {
    const mesesAgrupados = Array.from({ length: 12 }, (_, i) => ({
      month: nomesMeses[i],
      income: 0,
      expense: 0,
    }));

    firebaseData.forEach((trans) => {
      if (!trans.date) return;

      // Tratamento seguro para diferentes formatos de data salvos no Firestore (String, Date ou Timestamp)
      let dateStr = "";
      if (typeof trans.date === "string") {
        dateStr = trans.date;
      } else if (trans.date && typeof trans.date === "object" && "seconds" in trans.date) {
        dateStr = new Date((trans.date as any).seconds * 1000).toISOString();
      } else if (trans.date instanceof Date) {
        dateStr = trans.date.toISOString();
      }

      if (!dateStr || !dateStr.includes("-")) return;

      const [ano, mesStr] = dateStr.split("-");
      
      // Filtra transações correspondentes ao ano selecionado e acumula nos respectivos meses
      if (ano === selectedYear) {
        const indexMes = parseInt(mesStr, 10) - 1;
        if (indexMes >= 0 && indexMes < 12) {
          const valor = trans.money?.value || 0;
          if (trans.type === "income") {
            mesesAgrupados[indexMes].income += valor;
          } else if (trans.type === "expense") {
            mesesAgrupados[indexMes].expense += valor;
          }
        }
      }
    });

    return mesesAgrupados;
  }, [firebaseData, selectedYear]);

  /**
   * Cálculo dos totais gerais de entradas e saídas do ano para exibição nos cards de resumo do topo.
   */
  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, curr) => {
        acc.income += curr.income;
        acc.expense += curr.expense;
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [chartData]);

  // Configuração visual de cores e rótulos para as barras do gráfico
  const chartConfig = {
    income: { label: "Receitas (Income)", color: "#a855f7" },
    expense: { label: "Despesas (Expense)", color: "#ec4899" },
  } satisfies ChartConfig;

  return (
    <Card className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 text-white shadow-xl overflow-hidden relative">
      
      {/* Estilização global injetada para customizar o cursor do tooltip do Recharts */}
      <style jsx global>{`
        .recharts-rectangle.recharts-tooltip-cursor {
          fill: rgba(255, 255, 255, 0.04) !important;
          fill-opacity: 1 !important;
        }
      `}</style>

      {/* Cabeçalho do Cartão: Título, indicador de carregamento, seletor de ano e cards de resumo */}
      <CardHeader className="flex flex-col items-stretch space-y-4 border-b border-zinc-800/50 p-6 sm:flex-row sm:space-y-0">
        <div className="flex flex-1 flex-col justify-center gap-1.5">
          <CardTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            Fluxo de Caixa
            {loading && <Loader2 className="w-4 h-4 animate-spin text-purple-500" />}
          </CardTitle>
          
          {/* Seletor de Ano de Referência */}
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[90px] bg-zinc-950/50 border-zinc-800 text-zinc-300 rounded-lg h-8 text-xs">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-white text-xs">
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2027">2027</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Painel de Indicadores Financeiros (Total de Entradas vs Saídas do Ano) */}
        <div className="flex border-t border-zinc-800/50 sm:border-t-0 bg-zinc-950/20 rounded-xl border border-zinc-800/30 overflow-hidden">
          <div className="flex flex-col justify-center gap-1 border-r border-zinc-800/50 px-5 py-3">
            <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1 uppercase">
              <ArrowUpCircle className="w-3 h-3 text-purple-400" /> Entradas
            </span>
            <span className="text-base font-extrabold text-purple-400">
              R$ {totals.income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex flex-col justify-center gap-1 px-5 py-3">
            <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1 uppercase">
              <ArrowDownCircle className="w-3 h-3 text-pink-400" /> Saídas
            </span>
            <span className="text-base font-extrabold text-pink-400">
              R$ {totals.expense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </CardHeader>

      {/* Corpo do Cartão: Renderização do Gráfico de Barras */}
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="min-h-62.5 w-full">
          <BarChart data={chartData} margin={{ top: 20, right: 12, left: 12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#27272a" />
            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} stroke="#a1a1aa" />
            <ChartTooltip 
              cursor={{ fill: "rgba(255, 255, 255, 0.04)", radius: 4 }} 
              content={
                <ChartTooltipContent 
                  className="bg-zinc-950 border-zinc-800 text-white" 
                  formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} 
                />
              } 
            />
            <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} isAnimationActive={true} />
            <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} isAnimationActive={true} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}