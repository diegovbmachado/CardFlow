"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartConfig,
  ChartTooltipContent,
  ChartTooltip,
} from "../../ui/chart";
import { Bar, CartesianGrid, XAxis, BarChart } from "recharts";

export default function ChartOverview() {
  const [activeChart, setActiveChart] = React.useState<"desktop" | "mobile">("desktop");

  const chartData = [
    { month: "Janeiro", desktop: 186, mobile: 80 },
    { month: "Fevereiro", desktop: 305, mobile: 200 },
    { month: "Março", desktop: 237, mobile: 120 },
    { month: "Abril", desktop: 73, mobile: 190 },
    { month: "Maio", desktop: 209, mobile: 130 },
    { month: "Junho", desktop: 214, mobile: 140 },
  ];

  // Configuração de cores em Neon combinando com o Login: Roxo e Fúcsia!
  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "#a855f7", // Roxo vibrante
    },
    mobile: {
      label: "Mobile",
      color: "#ec4899", // Fúcsia vibrante
    },
  } satisfies ChartConfig;

  const totals = React.useMemo(() => {
    return {
      desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0),
    };
  }, []);

  return (
    <Card className="flex-1 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 text-white shadow-xl overflow-hidden">
      
      {/* 💥 INJEÇÃO DE ESTILO INLINE: Isso anula qualquer background branco do cursor do Recharts forçadamente */}
      <style jsx global>{`
        .recharts-rectangle.recharts-tooltip-cursor {
          fill: rgba(255, 255, 255, 0.05) !important;
          fill-opacity: 1 !important;
        }
      `}</style>

      <CardHeader className="flex flex-col items-stretch space-y-0 border-b border-zinc-800/50 p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle className="text-base sm:text-lg font-bold text-white">
            Overview vendas
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Total de vendas nos últimos 6 meses
          </CardDescription>
        </div>
        
        <div className="flex border-t border-zinc-800/50 sm:border-t-0">
          {(["desktop", "mobile"] as const).map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={key}
                data-active={activeChart === key}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-r border-zinc-800/50 last:border-r-0 px-6 py-4 text-left data-[active=true]:bg-zinc-800/50 sm:border-l sm:border-r-0 sm:border-t-0 sm:px-8 sm:py-6 transition-all"
                onClick={() => setActiveChart(key)}
              >
                <span className="text-xs text-zinc-400">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-extrabold leading-none sm:text-2xl text-white">
                  {totals[key].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="min-h-62.5 w-full">
          <BarChart data={chartData} margin={{ top: 20, right: 12, left: 12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#27272a" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              stroke="#a1a1aa"
            />
            
            {/* Mantemos o cursor como a variável do CSS injetada acima */}
            <ChartTooltip 
              cursor={{ fill: "rgba(255, 255, 255, 0.05)", radius: 4 }} 
              content={<ChartTooltipContent className="bg-zinc-950 border-zinc-800 text-white" />} 
            />
            
            <Bar
              dataKey="desktop"
              fill="var(--color-desktop)"
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
              animationDuration={1000}
            />
            <Bar
              dataKey="mobile"
              fill="var(--color-mobile)"
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
              animationDuration={1000}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}