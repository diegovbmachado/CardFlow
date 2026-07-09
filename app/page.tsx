import { CardOverview } from "@/components/cardoverview";
import ChartOverview from "@/components/chartoverview";
import { Sales } from "@/components/sales";

export default function Home() {
  return (
    // Adicionado p-4 para desgrudar os componentes das bordas da tela
    <main className="sm:ml-14 p-4 md:p-6">
      {/* Seção dos Cards: Agora vai funcionar em 2 colunas no celular e 4 no PC */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CardOverview />
      </section>

      {/* Seção dos Gráficos: Corrigido para flex-col (celular) e lg:flex-row (telas maiores) */}
      <section className="mt-4 flex flex-col lg:flex-row gap-4">
        <ChartOverview />
        <Sales />
      </section>
    </main>
  );
}