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