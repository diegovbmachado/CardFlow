import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeDollarSign, DollarSign, Percent, Users } from "lucide-react";

export function CardOverview() {
  return (
    <>
      {/* CARD 1: Total de vendas */}
      <Card className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 text-white shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm sm:text-base font-bold text-zinc-300">
              Total de vendas
            </CardTitle>
            <DollarSign className="ml-auto w-4 h-4 text-purple-400" />
          </div>
          <CardDescription className="text-xs text-zinc-500">
            Total de vendas em 90 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">R$ 40.000</p>
        </CardContent>
      </Card>

      {/* CARD 2: Novos clientes */}
      <Card className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 text-white shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm sm:text-base font-bold text-zinc-300">
              Novos clientes
            </CardTitle>
            <Users className="ml-auto w-4 h-4 text-fuchsia-400" />
          </div>
          <CardDescription className="text-xs text-zinc-500">
            Novos clientes em 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">234</p>
        </CardContent>
      </Card>

      {/* CARD 3: Pedidos hoje */}
      <Card className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 text-white shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm sm:text-base font-bold text-zinc-300">
              Pedidos hoje
            </CardTitle>
            <Percent className="ml-auto w-4 h-4 text-amber-400" />
          </div>
          <CardDescription className="text-xs text-zinc-500">
            Total pedidos hoje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">65</p>
        </CardContent>
      </Card>

      {/* CARD 4: Total pedidos */}
      <Card className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 text-white shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm sm:text-base font-bold text-zinc-300">
              Total pedidos
            </CardTitle>
            <BadgeDollarSign className="ml-auto w-4 h-4 text-purple-400" />
          </div>
          <CardDescription className="text-xs text-zinc-500">
            Total de pedidos em 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">2300</p>
        </CardContent>
      </Card>
    </>
  );
}