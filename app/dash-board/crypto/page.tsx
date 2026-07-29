"use client";

import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Coins, CheckCircle2, TrendingUp, TrendingDown, RefreshCw, Trash2, Search, Loader2 } from "lucide-react";

export default function CryptoSettingsPage() {
  const [coin, setCoin] = useState("bitcoin");
  const [upperAlert, setUpperAlert] = useState("");
  const [lowerAlert, setLowerAlert] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [currentMarketPrice, setCurrentMarketPrice] = useState<number | null>(null);

  // Lista de moedas personalizadas do usuário
  const [customCoins, setCustomCoins] = useState<string[]>([
    "bitcoin",
    "ethereum",
    "tether",
    "axie-infinity",
  ]);

  // Estados do Autocomplete
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown se clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. Monitora o usuário logado e busca configurações salvas
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const docRef = doc(db, "user_settings", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.cryptoAlertCoin) setCoin(data.cryptoAlertCoin);
          if (data.cryptoUpperAlert) setUpperAlert(data.cryptoUpperAlert);
          if (data.cryptoLowerAlert) setLowerAlert(data.cryptoLowerAlert);
          if (data.customCoins && Array.isArray(data.customCoins)) {
            setCustomCoins(data.customCoins);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Busca o preço atual apenas da moeda selecionada (Evita estourar o limite da API)
  useEffect(() => {
    async function fetchCurrentPrice() {
      if (!coin) return;
      setFetchingPrice(true);
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=brl`
        );
        const data = await res.json();
        if (data && data[coin] && data[coin].brl) {
          setCurrentMarketPrice(data[coin].brl);
        } else {
          setCurrentMarketPrice(null);
        }
      } catch (error) {
        console.error("Erro ao buscar preço atual da moeda:", error);
      } finally {
        setFetchingPrice(false);
      }
    }

    fetchCurrentPrice();
  }, [coin]);

  // Sugestão automática de ± R$ 0,30
  const handleApplySuggestion = () => {
    if (currentMarketPrice !== null) {
      const upper = (currentMarketPrice + 0.30).toFixed(2);
      const lower = (currentMarketPrice - 0.30).toFixed(2);
      setUpperAlert(upper);
      setLowerAlert(lower);
    }
  };

  // Autocomplete seguro buscando na API do CoinGecko
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${searchQuery}`);
        const data = await res.json();
        if (data && data.coins) {
          setSearchResults(data.coins.slice(0, 5));
          setShowDropdown(true);
        }
      } catch (error) {
        console.error("Erro no autocomplete:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500); // Debounce levemente maior para proteger as requisições

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Adicionar moeda selecionada corretamente pelo Autocomplete
  const handleSelectCoinToAdd = async (coinId: string) => {
    if (customCoins.includes(coinId)) {
      alert("Esta moeda já está na sua lista!");
      setShowDropdown(false);
      setSearchQuery("");
      return;
    }

    const updatedCoins = [...customCoins, coinId];
    setCustomCoins(updatedCoins);
    setCoin(coinId); // Já seleciona automaticamente a nova moeda
    setSearchQuery("");
    setShowDropdown(false);

    if (userId) {
      const docRef = doc(db, "user_settings", userId);
      await setDoc(docRef, { customCoins: updatedCoins, cryptoAlertCoin: coinId }, { merge: true });
    }
  };

  // Excluir moeda da lista
  const handleRemoveCoin = async (coinToRemove: string) => {
    if (customCoins.length <= 1) {
      alert("Você precisa manter pelo menos uma moeda na lista.");
      return;
    }

    const updatedCoins = customCoins.filter((c) => c !== coinToRemove);
    setCustomCoins(updatedCoins);

    if (coin === coinToRemove) {
      setCoin(updatedCoins[0]);
    }

    if (userId) {
      const docRef = doc(db, "user_settings", userId);
      await setDoc(docRef, { customCoins: updatedCoins, cryptoAlertCoin: coin === coinToRemove ? updatedCoins[0] : coin }, { merge: true });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    setSuccessMessage(false);

    try {
      const docRef = doc(db, "user_settings", userId);
      await setDoc(
        docRef,
        {
          cryptoAlertCoin: coin,
          cryptoUpperAlert: upperAlert,
          cryptoLowerAlert: lowerAlert,
          customCoins: customCoins,
        },
        { merge: true }
      );

      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar configurações de cripto:", error);
      alert("Erro ao salvar as configurações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="sm:pl-14 p-6 sm:p-10 text-white min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl space-y-6">
        <div>
          <div className="flex items-center gap-2 text-purple-500 mb-1">
            <Coins className="w-6 h-6" />
            <span className="text-xs font-semibold uppercase tracking-wider">Módulo Web3</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações de Criptomoedas</h1>
          <p className="text-sm text-zinc-400">
            Gerencie suas moedas com segurança e evite bloqueios de requisição da API pública.
          </p>
        </div>

        {/* Bloco de Adicionar com Autocomplete */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xl relative" ref={dropdownRef}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400">Adicionar Nova Criptomoeda</h2>
          
          <div className="relative">
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm focus-within:border-purple-500 transition">
              <Search className="w-4 h-4 text-zinc-500 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Pesquise por nome (ex: Solana, Cardano)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                className="w-full bg-transparent text-white focus:outline-none placeholder:text-zinc-600"
              />
              {isSearching && <Loader2 className="w-4 h-4 text-purple-500 animate-spin ml-2 flex-shrink-0" />}
            </div>

            {/* Dropdown de Autocomplete */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-zinc-900">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectCoinToAdd(item.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-zinc-900 transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <img src={item.thumb} alt={item.name} className="w-6 h-6 rounded-full" />
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-purple-400 transition">{item.name}</p>
                        <span className="text-[10px] text-zinc-500 uppercase">{item.symbol} (ID: {item.id})</span>
                      </div>
                    </div>
                    <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition">
                      Adicionar +
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Lista de moedas ativas atuais limpa e rápida */}
          <div className="space-y-2 pt-2">
            <span className="text-xs text-zinc-500 block">Moedas na sua lista:</span>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {customCoins.map((c) => (
                <div key={c} className="flex items-center justify-between bg-zinc-950 border border-zinc-800/80 px-3 py-2 rounded-xl text-xs">
                  <span className="capitalize font-medium text-zinc-300">{c.replace("-", " ")}</span>
                  {customCoins.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCoin(c)}
                      className="text-zinc-500 hover:text-red-400 transition p-1"
                      title="Excluir moeda"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Formulário Principal de Alertas */}
        <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-300">Moeda Padrão (Dashboard)</label>
            <select
              value={coin}
              onChange={(e) => setCoin(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition capitalize"
            >
              {customCoins.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c.replace("-", " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Card com preço de mercado atualizado da moeda selecionada */}
          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-zinc-400 block">Preço Atual ({coin.toUpperCase()}):</span>
              <span className="text-lg font-bold text-white">
                {fetchingPrice ? (
                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Buscando...
                  </span>
                ) : currentMarketPrice !== null ? (
                  currentMarketPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                ) : (
                  "Indisponível"
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={handleApplySuggestion}
              disabled={fetchingPrice || currentMarketPrice === null}
              className="text-xs bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 px-3 py-2 rounded-lg transition font-medium disabled:opacity-50"
            >
              Sugerir ± R$ 0,30 automático
            </button>
          </div>

          {/* Campo Teto */}
          <div>
            <label className="block text-sm font-medium mb-2 text-emerald-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Preço Teto para Alerta de Alta (R$)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="Ex: 4.54"
              value={upperAlert}
              onChange={(e) => setUpperAlert(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {/* Campo Piso */}
          <div>
            <label className="block text-sm font-medium mb-2 text-amber-400 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" /> Preço Piso para Alerta de Queda (R$)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="Ex: 3.94"
              value={lowerAlert}
              onChange={(e) => setLowerAlert(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 transition font-medium py-3 rounded-xl text-white shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar Configurações"}
          </button>

          {successMessage && (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-sm animate-fade-in">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>Configurações salvas com sucesso no Firebase!</span>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}