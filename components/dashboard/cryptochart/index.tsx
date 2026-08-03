"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, RefreshCw, Bell, AlertTriangle, Clock, Flame } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { db, auth, messaging } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getToken, onMessage } from "firebase/messaging";

/**
 * Componente principal do gráfico de criptomoedas e sistema de alertas em tempo real.
 * Gerencia a busca de dados na CoinGecko, salvamento de tokens FCM para múltiplos dispositivos
 * e escuta de notificações push (tanto em background quanto em primeiro plano).
 */
export function CryptoChart() {
  // Estados locais para controle de ativos, limites de alerta, período do gráfico e carregamento
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [availableCoins, setAvailableCoins] = useState<string[]>([
    "bitcoin",
    "ethereum",
    "tether",
    "axie-infinity",
  ]);
  const [upperAlert, setUpperAlert] = useState<number | null>(null);
  const [lowerAlert, setLowerAlert] = useState<number | null>(null);
  const [days, setDays] = useState("1");
  const [chartData, setChartData] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<string>("");

  // Estado para exibir o Banner Visual de Alerta diretamente na interface do usuário
  const [visualAlert, setVisualAlert] = useState<{ type: 'upper' | 'lower'; message: string } | null>(null);

  /**
   * Effect 0: Gerenciamento de Autenticação, Permissão de Notificações, Registro de Tokens FCM (Multi-dispositivo)
   * e Listener de Mensagens em Primeiro Plano (Foreground).
   */
  useEffect(() => {
    let unsubscribeOnMessage: (() => void) | undefined;

    // Monitora o estado de autenticação do usuário no Firebase Auth
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user && messaging) {
        try {
          // Verifica se o ambiente suporta notificações do navegador
          if (typeof window !== "undefined" && "Notification" in window) {
            const permission = await Notification.requestPermission();
            
            if (permission === "granted") {
              // Obtém o token FCM exclusivo deste dispositivo usando a chave VAPID pública
              const token = await getToken(messaging, {
                vapidKey: "BNr3BLcnDz071iGoW_CCZjzRl3Sq1RQq5n3jfFu8LBlP78kINsE_TKBwR8q5czVDTZIugTgJyyrmcpUlY6YvfRk"
              });
              
              if (token) {
                const userRef = doc(db, "user_settings", user.uid);
                const docSnap = await getDoc(userRef);
                
                // Trata a estrutura de tokens (suporta múltiplos dispositivos salvos em array)
                let existingTokens: string[] = [];
                if (docSnap.exists() && docSnap.data().fcmTokens) {
                  existingTokens = docSnap.data().fcmTokens;
                } else if (docSnap.exists() && docSnap.data().fcmToken) {
                  existingTokens = [docSnap.data().fcmToken];
                }

                // Evita duplicidade adicionando apenas se o token atual ainda não estiver salvo
                if (!existingTokens.includes(token)) {
                  existingTokens.push(token);
                }

                // Atualiza o documento do usuário no Firestore com a lista consolidada de tokens
                await updateDoc(userRef, { fcmTokens: existingTokens });
                console.log("Token FCM deste dispositivo salvo com sucesso no perfil!");
              }

              // Configura o listener para interceptar mensagens recebidas enquanto a aba está aberta (Foreground)
              unsubscribeOnMessage = onMessage(messaging, (payload) => {
                console.log("Mensagem recebida em primeiro plano:", payload);
                const title = payload?.notification?.title || "Alerta Cripto";
                const body = payload?.notification?.body || "Nova atualização de preço.";
                
                // Dispara o pop-up nativo do navegador caso permitido
                if (Notification.permission === "granted") {
                  new Notification(title, { body });
                }
              });
            }
          }
        } catch (error) {
          console.error("Erro ao registrar notificações push do Firebase:", error);
        }
      }
    });

    // Limpeza dos listeners ao desmontar o componente para evitar vazamento de memória
    return () => {
      unsubscribeAuth();
      if (unsubscribeOnMessage) {
        unsubscribeOnMessage();
      }
    };
  }, []);

  /**
   * Effect 1: Busca e sincroniza as configurações personalizadas do usuário salvas no Firestore
   * (moedas favoritas, limites de teto e piso configurados).
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "user_settings", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            if (data.customCoins && Array.isArray(data.customCoins) && data.customCoins.length > 0) {
              setAvailableCoins(data.customCoins);
            }
            if (data.cryptoAlertCoin) {
              setSelectedCoin(data.cryptoAlertCoin);
            } else if (data.customCoins && data.customCoins.length > 0) {
              setSelectedCoin(data.customCoins[0]);
            }
            if (data.cryptoUpperAlert) {
              setUpperAlert(parseFloat(data.cryptoUpperAlert));
            }
            if (data.cryptoLowerAlert) {
              setLowerAlert(parseFloat(data.cryptoLowerAlert));
            }
          }
        } catch (error) {
          console.error("Erro ao buscar configurações do usuário:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  /**
   * Effect 2: Motor principal de requisição de dados de mercado (CoinGecko API)
   * e validação de regras de negócio para disparos de alertas (teto e piso).
   */
  useEffect(() => {
    async function fetchCryptoData(isBackgroundUpdate = false) {
      if (!selectedCoin) return;
      
      // Controla o estado de loading apenas na primeira carga ou troca de ativo
      if (!isBackgroundUpdate) {
        setLoading(true);
      }

      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/${selectedCoin}/market_chart?vs_currency=brl&days=${days}`
        );

        // Tratamento preventivo para o limite de requisições da API pública (HTTP 429 - Throttled)
        if (res.status === 429) {
          console.warn("Limite da API do CoinGecko atingido temporariamente (429).");
          return;
        }

        const textResponse = await res.text();
        
        // Validação de segurança para garantir integridade do JSON retornado
        if (!textResponse.startsWith("{") && !textResponse.startsWith("[")) {
          console.warn("Resposta bloqueada ou inválida da API:", textResponse);
          return;
        }

        const data = JSON.parse(textResponse);

        if (data && data.prices) {
          // Mapeia e formata os dados brutos para exibição no gráfico de área (Recharts)
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

          // Extração do preço mais recente da série histórica
          const rawPrice = data.prices[data.prices.length - 1][1];
          const latestPrice = Number(rawPrice.toFixed(2));
          
          setCurrentPrice(latestPrice);

          // Cálculo da variação percentual do período selecionado
          const firstPrice = data.prices[0][1];
          const change = ((latestPrice - firstPrice) / firstPrice) * 100;
          setPriceChange(change);
          setLastChecked(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));

          // Validação dos Limites de Alerta configurados pelo usuário
          const numericUpper = upperAlert ? Number(upperAlert.toFixed(2)) : null;
          const numericLower = lowerAlert ? Number(lowerAlert.toFixed(2)) : null;

          if (numericUpper !== null && latestPrice >= numericUpper) {
            setVisualAlert({
              type: 'upper',
              message: `🚀 ALERTA DE TETO ATINGIDO! Preço: R$ ${latestPrice.toFixed(2)} (Seu Teto: R$ ${numericUpper.toFixed(2)})`
            });

            // Dispara notificação nativa imediata caso o preço ultrapasse o teto
            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
              try { new Notification("🚀 Alerta de Teto - Cripto!", { body: `Preço: R$ ${latestPrice.toFixed(2)}` }); } catch(e) {}
            }
          } else if (numericLower !== null && latestPrice <= numericLower) {
            setVisualAlert({
              type: 'lower',
              message: `⚠️ ALERTA DE PISO ATINGIDO! Preço: R$ ${latestPrice.toFixed(2)} (Seu Piso: R$ ${numericLower.toFixed(2)})`
            });

            // Dispara notificação nativa imediata caso o preço caia abaixo do piso
            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
              try { new Notification("⚠️ Alerta de Piso - Cripto!", { body: `Preço: R$ ${latestPrice.toFixed(2)}` }); } catch(e) {}
            }
          } else {
            setVisualAlert(null);
          }
        }
      } catch (error) {
        console.error("Erro ao processar dados da criptomoeda:", error);
      } finally {
        if (!isBackgroundUpdate) {
          setLoading(false);
        }
      }
    }

    // Execução inicial ao carregar o componente
    fetchCryptoData(false);

    // Configuração de polling: Atualização automática do gráfico e verificação a cada 2 minutos
    const intervalTime = 120 * 1000; 
    const intervalId = setInterval(() => {
      fetchCryptoData(true);
    }, intervalTime);

    return () => clearInterval(intervalId);

  }, [selectedCoin, days, upperAlert, lowerAlert]);

  /**
   * Funções de Teste Manual (Painel QA):
   * Permitem simular cenários de teto e piso diretamente na interface para validação visual.
   */
  const handleSimulateUpper = () => {
    const fakePrice = 10.00;
    const fakeUpper = 5.00; 
    setCurrentPrice(fakePrice);
    setUpperAlert(fakeUpper);
    setLoading(false);
    setVisualAlert({
      type: 'upper',
      message: `🧪 [TESTE] TETO ATINGIDO! Preço simulado: R$ ${fakePrice.toFixed(2)} (Teto: R$ ${fakeUpper.toFixed(2)})`
    });
  };

  const handleSimulateLower = () => {
    const fakePrice = 1.00;
    const fakeLower = 3.00; 
    setCurrentPrice(fakePrice);
    setLowerAlert(fakeLower);
    setLoading(false);
    setVisualAlert({
      type: 'lower',
      message: `🧪 [TESTE] PISO ATINGIDO! Preço simulado: R$ ${fakePrice.toFixed(2)} (Piso: R$ ${fakeLower.toFixed(2)})`
    });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-white flex flex-col justify-between shadow-xl relative overflow-hidden">
      
      {/* Banner dinâmico de alerta visual exibido na interface quando uma meta é atingida */}
      {visualAlert && (
        <div className={`mb-4 p-4 rounded-xl border flex items-center justify-between animate-pulse ${
          visualAlert.type === 'upper' 
            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200' 
            : 'bg-amber-950/80 border-amber-500 text-amber-200'
        }`}>
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 animate-bounce text-yellow-400" />
            <span className="font-bold text-sm sm:text-base">{visualAlert.message}</span>
          </div>
          <button 
            onClick={() => setVisualAlert(null)}
            className="text-xs bg-black/40 hover:bg-black/70 px-2.5 py-1 rounded-lg transition"
          >
            Fechar ✕
          </button>
        </div>
      )}

      {/* Cabeçalho do Card: Informações da moeda, variação percentual, preço atual e seletores */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
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
            
            {upperAlert && (
              <span className="flex items-center text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <Bell className="w-3 h-3 mr-1" />
                Teto: R$ {upperAlert.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            )}
            {lowerAlert && (
              <span className="flex items-center text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Piso: R$ {lowerAlert.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-2xl font-extrabold">
              {currentPrice
                ? currentPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                : "Carregando..."}
            </p>
            {lastChecked && (
              <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Atualizado às {lastChecked}
              </span>
            )}
          </div>

          {/* Painel QA para testes manuais rápidos de simulação de alertas */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase">Painel QA / Teste:</span>
            <button
              type="button"
              onClick={handleSimulateUpper}
              className="text-[10px] bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-md transition font-medium cursor-pointer"
            >
              🧪 Simular Teto (Alta)
            </button>
            <button
              type="button"
              onClick={handleSimulateLower}
              className="text-[10px] bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-md transition font-medium cursor-pointer"
            >
              🧪 Simular Piso (Queda)
            </button>
          </div>
        </div>

        {/* Controles de seleção de ativo e período (24h ou 7 dias) */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-medium text-white focus:outline-none focus:border-purple-500 capitalize"
          >
            {availableCoins.map((c) => (
              <option key={c} value={c} className="capitalize">
                {c.replace("-", " ").toUpperCase()}
              </option>
            ))}
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

      {/* Renderização do Gráfico de Área utilizando a biblioteca Recharts */}
      <div className="h-62.5 w-full">
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