"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import {
  ChartContainer,
  ChartConfig,
  ChartTooltipContent,
  ChartTooltip,
} from "../ui/chart";
import { Bar, CartesianGrid, XAxis, BarChart } from "recharts";

export default function ChartOverview() {
  const chartData = [
    { month: "Janeiro", desktop: 186, mobile: 80 },
    { month: "Fevereiro", desktop: 305, mobile: 200 },
    { month: "Março", desktop: 237, mobile: 120 },
    { month: "Abril", desktop: 73, mobile: 190 },
    { month: "Maio", desktop: 209, mobile: 130 },
    { month: "Junho", desktop: 214, mobile: 140 },
  ];
  
  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "#2563eb",
    },
    mobile: {
      label: "Mobile",
      color: "#60a5fa",
    },
  } satisfies ChartConfig;

  return (
    /* marretando tamanho se quiser w-full md:w-1/3 md:max-w-600px */
    <Card className="flex-1">
      <CardHeader>
        <div className="flex items-center justify-center">
          <CardTitle className="text-lg sm:text-xl text-gray-800">
            Overview vendas
          </CardTitle>
          <DollarSign className="ml-auto w-4 h-4" />
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-50 w-full">
          {/* ✅ CORRIGIDO: Propriedades de animação removidas daqui */}
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            
            {/* As animações ficam perfeitas aqui dentro: */}
            <Bar
              dataKey="desktop"
              fill="var(--color-desktop)"
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
              animationDuration={1200}
              animationEasing="ease-out"
            />
            <Bar
              dataKey="mobile"
              fill="var(--color-mobile)"
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/* linha de um possivel outro codigo com implementação extra...
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartConfig,
  ChartTooltipContent,
  ChartTooltip,
} from "../ui/chart";
import { Bar, CartesianGrid, XAxis, BarChart } from "recharts";

export default function ChartOverview() {
  // Mantemos o estado caso queira usar para algum filtro no futuro, 
  // mas agora vamos renderizar as duas barras juntas na tela!
  const [activeChart, setActiveChart] = React.useState<"desktop" | "mobile">("desktop");

  // Restaurado exatamente o seu array de dados original com 'month'
  const chartData = [
    { month: "Janeiro", desktop: 186, mobile: 80 },
    { month: "Fevereiro", desktop: 305, mobile: 200 },
    { month: "Março", desktop: 237, mobile: 120 },
    { month: "Abril", desktop: 73, mobile: 190 },
    { month: "Maio", desktop: 209, mobile: 130 },
    { month: "Junho", desktop: 214, mobile: 140 },
  ];

  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "#2563eb", // Azul escuro
    },
    mobile: {
      label: "Mobile",
      color: "#60a5fa", // Azul claro
    },
  } satisfies ChartConfig;

  // Calcula o total somando os meses para exibir nos botões do topo
  const totals = React.useMemo(() => {
    return {
      desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0),
    };
  }, []);

  return (
    <Card className="flex-1">
     
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle className="text-lg sm:text-xl text-gray-800">
            Overview vendas
          </CardTitle>
          <CardDescription>
            Total de vendas nos últimos 6 meses
          </CardDescription>
        </div>
        
        
        <div className="flex">
          {(["desktop", "mobile"] as const).map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={key}
                data-active={activeChart === key}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6 transition-all"
                onClick={() => setActiveChart(key)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-2xl">
                  {totals[key].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <BarChart data={chartData} margin={{ top: 20, right: 12, left: 12, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)} // Transforma "Janeiro" em "Jan"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            
            
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


*/