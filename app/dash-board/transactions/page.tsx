"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, ArrowUpCircle, ArrowDownCircle, Calendar, Coins, Tag, FileText, Loader2 } from "lucide-react";

// Importações do Firebase Firestore e Auth
import { db, auth } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function TransactionsPage() {
  // Estados do formulário
  const [type, setType] = useState<"income" | "expense">("expense");
  const [date, setDate] = useState("");
  const [currency, setCurrency] = useState("BRL");
  const [value, setValue] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [description, setDescription] = useState("");

  // Estados de controle da requisição e do Usuário
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Monitora o usuário logado para pegar o UID dinâmico do Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const categorias = ["Acomodação", "Alimentação", "Outros", "Salário", "Supermercado", "Transporte"];

  // Validação em tempo real (Formulário só envia se tiver usuário logado também)
  const isFormValid = Boolean(date && currency && value && transactionType && userId && !loading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !userId) return;

    setLoading(true);

    try {
      // Estrutura idêntica ao que você já tem modelado no seu Firestore
      const novaTransacao = {
        date,
        description,
        money: {
          currency,
          value: Number(value),
        },
        transactionType,
        type,
        user: {
          uid: userId, // UID real vindo do Authentication
        }
      };

      // Adiciona o documento na coleção "transactions" do Firestore
      const docRef = await addDoc(collection(db, "transactions"), novaTransacao);
      console.log("Transação salva com sucesso! ID:", docRef.id);

      // Limpa os campos do formulário após o sucesso (menos Moeda e Tipo de Transação)
      setDate("");
      setValue("");
      setDescription("");
      setTransactionType("");
      
      alert("Lançamento salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar no Firestore:", error);
      alert("Erro ao salvar a transação. Verifique o console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="sm:ml-14 p-4 md:p-6 bg-transparent min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-lg bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 text-white shadow-2xl">
        <CardHeader className="border-b border-zinc-800/50 pb-4">
          <div className="flex items-center gap-2 text-purple-400">
            <Wallet className="w-5 h-5" />
            <CardTitle className="text-xl font-bold text-white">Novo Lançamento</CardTitle>
          </div>
          <CardDescription className="text-zinc-400 text-xs">
            Adicione uma receita ou despesa diretamente no seu controle financeiro.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* 1. Tipo de Transação (Despesa / Receita) */}
            <div className="space-y-2">
              <Label className="text-zinc-300 font-semibold flex items-center gap-1">
                Transação <span className="text-purple-400">*</span>
              </Label>
              <RadioGroup 
                value={type} 
                onValueChange={(val) => setType(val as "income" | "expense")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 bg-zinc-950/40 border border-zinc-800 px-4 py-2 rounded-lg cursor-pointer hover:bg-zinc-800/30 transition-all flex-1">
                  <RadioGroupItem value="expense" id="expense" className="border-zinc-500 text-purple-500" />
                  <Label htmlFor="expense" className="flex items-center gap-2 text-zinc-300 cursor-pointer w-full text-sm">
                    <ArrowDownCircle className="w-4 h-4 text-pink-500" /> Despesa
                  </Label>
                </div>
                <div className="flex items-center space-x-2 bg-zinc-950/40 border border-zinc-800 px-4 py-2 rounded-lg cursor-pointer hover:bg-zinc-800/30 transition-all flex-1">
                  <RadioGroupItem value="income" id="income" className="border-zinc-500 text-purple-500" />
                  <Label htmlFor="income" className="flex items-center gap-2 text-zinc-300 cursor-pointer w-full text-sm">
                    <ArrowUpCircle className="w-4 h-4 text-purple-500" /> Receita
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 2. Data da Transação */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-zinc-300 font-semibold flex items-center gap-1">
                <Calendar className="w-4 h-4 text-zinc-500" /> Data da transação <span className="text-purple-400">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-zinc-950/40 border-zinc-800 text-zinc-200 focus:border-purple-500 rounded-lg h-10 transition-all [color-scheme:dark]"
              />
            </div>

            {/* 3. Moeda */}
            <div className="space-y-2">
              <Label className="text-zinc-300 font-semibold flex items-center gap-1">
                <Coins className="w-4 h-4 text-zinc-500" /> Moeda <span className="text-purple-400">*</span>
              </Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="bg-zinc-950/40 border-zinc-800 text-zinc-200 rounded-lg h-10 focus:ring-purple-500">
                  <SelectValue placeholder="Selecione a moeda" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                  <SelectItem value="BRL">Real (BRL)</SelectItem>
                  <SelectItem value="USD">Dólar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 4. Valor */}
            <div className="space-y-2">
              <Label htmlFor="value" className="text-zinc-300 font-semibold flex items-center gap-1">
                Valor <span className="text-purple-400">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-500 text-sm font-bold">{currency === "BRL" ? "R$" : "$"}</span>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="bg-zinc-950/40 border-zinc-800 text-zinc-200 focus:border-purple-500 rounded-lg h-10 pl-9 transition-all"
                />
              </div>
            </div>

            {/* 5. Tipo de Transação (Categoria) */}
            <div className="space-y-2">
              <Label className="text-zinc-300 font-semibold flex items-center gap-1">
                <Tag className="w-4 h-4 text-zinc-500" /> Tipo de transação <span className="text-purple-400">*</span>
              </Label>
              <Select value={transactionType} onValueChange={setTransactionType}>
                <SelectTrigger className="bg-zinc-950/40 border-zinc-800 text-zinc-200 rounded-lg h-10">
                  <SelectValue placeholder="-- Selecione um tipo de transação --" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 6. Descrição (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-zinc-300 font-semibold flex items-center gap-1">
                <FileText className="w-4 h-4 text-zinc-500" /> Descrição <span className="text-zinc-600 text-xs font-normal">(Opcional)</span>
              </Label>
              <Input
                id="description"
                placeholder="Ex: Salário Petrobras"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-zinc-950/40 border-zinc-800 text-zinc-200 focus:border-purple-500 rounded-lg h-10 transition-all"
              />
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-2 pt-2">
              <Button 
                type="submit" 
                disabled={!isFormValid}
                className={`w-full h-10 font-bold rounded-lg transition-all text-white shadow-lg ${
                  isFormValid 
                    ? "bg-purple-600 hover:bg-purple-500 cursor-pointer" 
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/30"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}