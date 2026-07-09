import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeDollarSign, DollarSign, Percent, Users } from "lucide-react";

export function CardOverview() {
  return (
    <> {/* ✅ Modificado aqui: Usando fragment para o Grid do page.tsx enxergar os Cards individualmente */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center">
            <CardTitle className="text-lg sm:text-xl text-gray-600">
              Total de vendas
            </CardTitle>
            <DollarSign className="ml-auto w-4 h-4" />
          </div>
          <CardDescription>
            Total de vendas em 90 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-base sm:text-lg font-bold">R$ 40.000</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-center">
            <CardTitle className="text-lg sm:text-xl text-gray-600">
              Novos clientes
            </CardTitle>
            <Users className="ml-auto w-4 h-4" />
          </div>
          <CardDescription>
            Novos clientes em 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-base sm:text-lg font-bold">234</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-full">
              <CardTitle className="text-lg sm:text-xl text-gray-800 flex-1">
                Pedidos hoje
              </CardTitle>
              <Percent className="ml-auto w-4 h-4" />
            </div>
          </div>
          <CardDescription>
            Total pedidos hoje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-base sm:text-lg font-bold">65</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-center">
            <CardTitle className="text-lg sm:text-xl text-gray-800">
              Total pedidos
            </CardTitle>
            <BadgeDollarSign className="ml-auto w-4 h-4" />
          </div>
          <CardDescription>
            Total de pedidos em 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-base sm:text-lg font-bold">2300</p>
        </CardContent>
      </Card>
    </>
  );
}