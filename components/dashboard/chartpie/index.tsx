"use client";

import { useMemo, useState, useCallback } from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorShapeProps } from "recharts/types/polar/Pie";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Configuração de cores para as categorias cadastradas no seu Firestore
const chartConfig = {
  value: { label: "Total" },
  Acomodação: { label: "Acomodação", color: "#a855f7" }, // Roxo
  Alimentação: { label: "Alimentação", color: "#ec4899" }, // Fúcsia/Rosa
  Salário: { label: "Salário", color: "#22c55e" }, // Verde
  Supermercado: { label: "Supermercado", color: "#3b82f6" }, // Azul
  Transporte: { label: "Transporte", color: "#eab308" }, // Amarelo
  Outros: { label: "Outros", color: "#64748b" }, // Cinza
} satisfies ChartConfig;
interface ChartPieProps {
  selectedYear: string;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  firebaseData: Array<{
    type: "expense" | "income";
    date: string;
    transactionType?: string;
    money?: { value: number };
  }>;
}

export function ChartPieInteractive({
  selectedYear,
  selectedMonth,
  setSelectedMonth,
  firebaseData,
}: ChartPieProps) {
  const id = "pie-categories";
  const [viewType, setViewType] = useState<"expense" | "income">("expense");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const mesesExtenso: Record<string, string> = {
    "01": "Janeiro",
    "02": "Fevereiro",
    "03": "Março",
    "04": "Abril",
    "05": "Maio",
    "06": "Junho",
    "07": "Julho",
    "08": "Agosto",
    "09": "Setembro",
    "10": "Outubro",
    "11": "Novembro",
    "12": "Dezembro",
  };

  // 1. Filtra os dados com base no Ano, Mês e Tipo de Transação selecionados
  const pieData = useMemo(() => {
    const categoriasAcumuladas: Record<string, number> = {};

    firebaseData.forEach((trans) => {
      if (trans.type !== viewType || !trans.date) return;

      const [ano, mes] = trans.date.split("-");
      if (ano === selectedYear && mes === selectedMonth) {
        const cat = trans.transactionType || "Outros";
        const valor = trans.money?.value || 0;
        categoriasAcumuladas[cat] = (categoriasAcumuladas[cat] || 0) + valor;
      }
    });

    return Object.entries(categoriasAcumuladas).map(([category, total]) => {
      const categoryConfig = chartConfig[category as keyof typeof chartConfig];
      const fillColor =
        categoryConfig && "color" in categoryConfig && categoryConfig.color
          ? categoryConfig.color
          : chartConfig["Outros"].color;

      return {
        category,
        value: total,
        fill: fillColor,
      };
    });
  }, [firebaseData, selectedYear, selectedMonth, viewType]);

  const activeIndex = useMemo(() => {
    if (!activeCategory) return 0;
    const idx = pieData.findIndex((item) => item.category === activeCategory);
    return idx === -1 ? 0 : idx;
  }, [activeCategory, pieData]);

  const totalGeralMes = useMemo(() => {
    return pieData.reduce((acc, curr) => acc + curr.value, 0);
  }, [pieData]);

  const renderPieShape = useCallback(
    ({ index, outerRadius = 0, ...props }: PieSectorShapeProps) => {
      if (index === activeIndex && pieData.length > 0) {
        return (
          <g>
            <Sector {...props} outerRadius={outerRadius + 6} />
            <Sector
              {...props}
              outerRadius={outerRadius + 14}
              innerRadius={outerRadius + 8}
            />
          </g>
        );
      }
      return <Sector {...props} outerRadius={outerRadius} />;
    },
    [activeIndex, pieData],
  );

  return (
    <Card
      data-chart={id}
      className="flex flex-col bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 text-white shadow-xl overflow-hidden"
    >
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex flex-col gap-4 border-b border-zinc-800/50 p-6 pb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="grid gap-1">
          <CardTitle className="text-base font-bold text-white">
            {viewType === "expense"
              ? "Despesas por Categoria"
              : "Receitas por Categoria"}
          </CardTitle>
          <CardDescription className="text-zinc-400 text-xs">
            {mesesExtenso[selectedMonth]} de {selectedYear}
          </CardDescription>
        </div>

        {/* Contêiner de seletores alinhados */}
        <div className="flex items-center gap-2">
          {/* Seletor Despesa / Receita */}
          <Select
            value={viewType}
            onValueChange={(val: "expense" | "income") => {
              setViewType(val);
              setActiveCategory(null);
            }}
          >
            <SelectTrigger className="w-[105px] bg-zinc-950/50 border-zinc-800 text-zinc-300 rounded-lg h-8 text-xs focus:ring-purple-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-white text-xs">
              <SelectItem value="expense">Despesas</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
            </SelectContent>
          </Select>

          {/* Seletor de Mês */}
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[100px] bg-zinc-950/50 border-zinc-800 text-zinc-300 rounded-lg h-8 text-xs focus:ring-purple-500">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent
              align="end"
              className="bg-zinc-950 border-zinc-800 text-white text-xs"
            >
              {Object.entries(mesesExtenso).map(([key, value]) => (
                <SelectItem
                  key={key}
                  value={key}
                  className="focus:bg-zinc-800/50 text-zinc-300 focus:text-white rounded-md cursor-pointer"
                >
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-center p-6 pb-4">
        {pieData.length === 0 ? (
          <div className="flex h-[260px] items-center justify-center text-zinc-500 text-xs font-medium">
            Nenhum registro encontrado neste período.
          </div>
        ) : (
          <ChartContainer
            id={id}
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[260px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    className="bg-zinc-950 border-zinc-800 text-white shadow-xl rounded-lg p-2"
                    nameKey="category"
                    formatter={(value, name) => [
                      `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                      chartConfig[name as keyof typeof chartConfig]?.label ||
                        name,
                    ]}
                  />
                }
              />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="category"
                innerRadius={65}
                strokeWidth={3}
                stroke="#18181b"
                shape={renderPieShape}
                onMouseEnter={(_, index) => {
                  if (pieData[index])
                    setActiveCategory(pieData[index].category);
                }}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-white text-2xl font-extrabold"
                          >
                            R${" "}
                            {totalGeralMes.toLocaleString("pt-BR", {
                              maximumFractionDigits: 0,
                            })}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className="fill-zinc-400 text-[10px] font-medium uppercase tracking-wider"
                          >
                            {viewType === "expense"
                              ? "Total Gasto"
                              : "Total Recebido"}
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
