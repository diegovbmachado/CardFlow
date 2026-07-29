"use client";

import React, { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Bell, Coins, CheckCircle2 } from "lucide-react";

export default function CryptoSettingsPage() {
  const [coin, setCoin] = useState("bitcoin");
  const [targetPrice, setTargetPrice] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  // Monitora o usuário logado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        // Busca configurações já salvas anteriormente, se houver
        const docRef = doc(db, "user_settings", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.cryptoAlertCoin) setCoin(data.cryptoAlertCoin);
          if (data.cryptoTargetPrice) setTargetPrice(data.cryptoTargetPrice);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    setSuccessMessage(false);

    try {
      // Salva no Firestore usando merge: true para não apagar outras configurações existentes
      const docRef = doc(db, "user_settings", userId);
      await setDoc(
        docRef,
        {
          cryptoAlertCoin: coin,
          cryptoTargetPrice: targetPrice,
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
            Defina sua moeda de monitoramento e o preço-alvo para receber alertas de variação.
          </p>
        </div>

        <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-300">Moeda Padrão (Dashboard)</label>
            <select
              value={coin}
              onChange={(e) => setCoin(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition"
            >
              <option value="bitcoin">Bitcoin (BTC)</option>
              <option value="ethereum">Ethereum (ETH)</option>
              <option value="tether">Tether (USDT)</option>
              <option value="axie-infinity">Axie Infinity (AXS)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-300 flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-400" />
              Preço Alvo para Notificação (R$)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="Ex: 350000.00"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition"
            />
            <p className="text-xs text-zinc-500 mt-1.5">
              Você será avisado quando o preço atingir ou ultrapassar este valor em Reais.
            </p>
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