"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, RefreshCw, Bell } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export function CryptoChart() {
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [targetPrice, setTargetPrice] = useState<number | null>(null);
  const [days, setDays] = useState("1"); // "1" para 24h, "7" para 7 dias
  const [chartData, setChartData] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertTriggered, setAlertTriggered] = useState(false);

  // 1. Busca a moeda padrão e o preço alvo salvos no Firebase pelo usuário
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "user_settings", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.cryptoAlertCoin) {
              setSelectedCoin(data.cryptoAlertCoin);
            }
            if (data.cryptoTargetPrice) {
              setTargetPrice(parseFloat(data.cryptoTargetPrice));
            }
          }
        } catch (error) {
          console.error("Erro ao buscar configurações do usuário:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Pede permissão para notificações do navegador ao carregar
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  // 3. Busca dados de preço da API do CoinGecko
  useEffect(() => {
    async function fetchCryptoData() {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/${selectedCoin}/market_chart?vs_currency=brl&days=${days}`
        );
        const data = await res.json();

        if (data && data.prices) {
          const formattedData = data.prices.map((item: [number, number]) => {
            const date = new Date(item[0]);
            const timeLabel =
              days === "1"
                ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : date.toLocaleDateString([], { month: "short", day: "numeric" });

            return {
              time: timeLabel,
              price: item[1],
            };
          });

          setChartData(formattedData);

          const latestPrice = data.prices[data.prices.length - 1][1];
          setCurrentPrice(latestPrice);

          const firstPrice = data.prices[0][1];
          const change = ((latestPrice - firstPrice) / firstPrice) * 100;
          setPriceChange(change);

          // 4. Lógica de Disparo de Alerta de Preço
          if (targetPrice && latestPrice >= targetPrice && !alertTriggered) {
            setAlertTriggered(true);
            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
              new Notification("🚨 Alerta de Criptomoeda!", {
                body: `A moeda ${selectedCoin.toUpperCase()} atingiu R$ ${latestPrice.toFixed(2)} (Meta: R$ ${targetPrice.toFixed(2)})`,
              });
            }
          }
        
        }
      } catch (error) {
        console.error("Erro ao buscar dados da criptomoeda:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCryptoData();
  }, [selectedCoin, days, targetPrice, alertTriggered]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-white flex flex-col justify-between shadow-xl">
      {/* Cabeçalho do Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold capitalize">{selectedCoin.replace("-", " ")}</h3>
            {priceChange !== null && (
              <span
                className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                  priceChange >= 0
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {priceChange >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {priceChange.toFixed(2)}%
              </span>
            )}
            {targetPrice && (
              <span className="flex items-center text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                <Bell className="w-3 h-3 mr-1" />
                Alvo: R$ {targetPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
          <p className="text-2xl font-extrabold mt-1">
            {currentPrice
              ? currentPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
              : "Carregando..."}
          </p>
        </div>

        {/* Controles de Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCoin}
            onChange={(e) => {
              setSelectedCoin(e.target.value);
              setAlertTriggered(false); // Reseta o alerta ao trocar de moeda
            }}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-medium text-white focus:outline-none focus:border-purple-500"
          >
            <option value="bitcoin">Bitcoin</option>
            <option value="ethereum">Ethereum</option>
            <option value="tether">Tether (USDT)</option>
            <option value="axie-infinity">Axie Infinity</option>
          </select>

          <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setDays("1")}
              className={`px-3 py-1 rounded-md transition ${
                days === "1" ? "bg-purple-600 text-white font-semibold" : "text-zinc-400 hover:text-white"
              }`}
            >
              24h
            </button>
            <button
              onClick={() => setDays("7")}
              className={`px-3 py-1 rounded-md transition ${
                days === "7" ? "bg-purple-600 text-white font-semibold" : "text-zinc-400 hover:text-white"
              }`}
            >
              7 Dias
            </button>
          </div>
        </div>
      </div>

      {/* Corpo do Gráfico */}
      <div className="h-[250px] w-full">
        {loading ? (
          <div className="h-full flex items-center justify-center text-zinc-500 gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-purple-500" />
            <span>Carregando gráfico...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="cryptoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9333ea" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
                tickFormatter={(val) => `R$ ${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "8px", color: "#fff" }}
                formatter={(value: any) => [
                  Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                  "Preço",
                ]}
              />
              <Area type="monotone" dataKey="price" stroke="#9333ea" strokeWidth={2} fillOpacity={1} fill="url(#cryptoGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}