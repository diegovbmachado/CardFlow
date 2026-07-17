import { CircleDollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Sales() {
  return (
    <Card className="flex-1 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 text-white shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-center">
          <CardTitle className="text-base sm:text-lg font-bold text-white">
            Últimos clientes
          </CardTitle>
          <CircleDollarSign className="ml-auto w-4 h-4 text-pink-400" />
        </div>
        <CardDescription className="text-xs text-zinc-400">
          Novos clientes nas últimas 24 horas
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-1">
        {/* Cliente 1 */}
        <article className="flex items-center gap-3 border-b border-zinc-800/50 py-3 last:border-b-0">
          <Avatar className="w-8 h-8 border border-zinc-800">
            <AvatarImage src="http://github.com/diegovbmachado.png" />
            <AvatarFallback className="bg-zinc-950 text-white font-bold text-xs">DV</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-zinc-200">
              Últimos clientes cadastrados
            </p>
            <span className="text-xs text-zinc-500">
              teste@teste.com
            </span>
          </div>
        </article>

        {/* Cliente 2 */}
        <article className="flex items-center gap-3 border-b border-zinc-800/50 py-3 last:border-b-0">
          <Avatar className="w-8 h-8 border border-zinc-800">
            <AvatarImage src="http://github.com/diegovbmachado.png" />
            <AvatarFallback className="bg-zinc-950 text-white font-bold text-xs">DV</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-zinc-200">
              Últimos clientes cadastrados
            </p>
            <span className="text-xs text-zinc-500">
              teste@teste.com
            </span>
          </div>
        </article>

        {/* Cliente 3 */}
        <article className="flex items-center gap-3 border-b border-zinc-800/50 py-3 last:border-b-0">
          <Avatar className="w-8 h-8 border border-zinc-800">
            <AvatarImage src="http://github.com/diegovbmachado.png" />
            <AvatarFallback className="bg-zinc-950 text-white font-bold text-xs">DV</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-zinc-200">
              Últimos clientes cadastrados
            </p>
            <span className="text-xs text-zinc-500">
              teste@teste.com
            </span>
          </div>
        </article>
      </CardContent>
    </Card>
  );
}