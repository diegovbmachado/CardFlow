"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, ArrowUpCircle, ArrowDownCircle, Calendar, Coins, Tag, FileText, Loader2 } from "lucide-react";

import { db, auth } from "@/lib/firebase";
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

/**
 * Página de Gestão e Criação de Lançamentos (TransactionsPage).
 * Permite ao usuário registrar novas receitas ou despesas, escolhendo a data, valor, 
 * moeda e categoria (combinando categorias padrão e customizadas buscadas em tempo real do Firestore).
 */
export default function TransactionsPage() {
  // Estados locais para gerenciar os campos do formulário de transação
  const [type, setType] = useState<"income" | "expense">("expense");
  const [date, setDate] = useState("");
  const [currency, setCurrency] = useState("BRL");
  const [value, setValue] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [description, setDescription] = useState("");

  // Estados de controle de requisição e sessão
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Estado para armazenar a lista unificada de categorias (Padrão + Customizadas do usuário)
  const [todasCategorias, setTodasCategorias] = useState<string[]>([]);

  // Lista base de categorias padrão do sistema
  const categoriasPadrao = ["Acomodação", "Alimentação", "Outros", "Salário", "Supermercado", "Transporte"];

  /**
   * Monitoramento em tempo real do estado de autenticação.
   * Identifica e armazena o UID do usuário logado.
   */
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribeAuth();
  }, []);

  /**
   * Sincronização de categorias personalizadas.
   * Quando o usuário está autenticado, busca no Firestore as categorias criadas por ele,
   * fazendo o merge com as categorias padrão e removendo duplicatas.
   */
  useEffect(() => {
    if (!userId) {
      setTodasCategorias(categoriasPadrao);
      return;
    }

    const q = query(collection(db, "categories"), where("userId", "==", userId));
    const unsubscribeCats = onSnapshot(q, (snapshot) => {
      const customCats = snapshot.docs.map(doc => doc.data().name);
      setTodasCategorias([...new Set([...categoriasPadrao, ...customCats])]);
    });

    return () => unsubscribeCats();
  }, [userId]);

  // Validação booleana dos campos obrigatórios do formulário
  const isFormValid = Boolean(date && currency && value && transactionType && userId && !loading);

  /**
   * Manipulador de submissão do formulário.
   * Cria o objeto da transação vinculado ao UID do usuário e o persiste na coleção do Firestore.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !userId) return;

    setLoading(true);

    try {
      const novaTransacao = {
        date,
        description,
        money: { currency, value: Number(value) },
        transactionType,
        type,
        user: { uid: userId }
      };

      // Adiciona o documento à coleção "transactions" no Firestore
      await addDoc(collection(db, "transactions"), novaTransacao);
      
      // Reseta os campos do formulário após o sucesso
      setDate("");
      setValue("");
      setDescription("");
      setTransactionType("");
      
      alert("Lançamento salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar a transação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="sm:ml-14 p-4 md:p-6 bg-transparent min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-lg bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 text-white shadow-2xl">
        
        {/* Cabeçalho do Card */}
        <CardHeader className="border-b border-zinc-800/50 pb-4">
          <CardTitle className="text-xl font-bold text-white">Novo Lançamento</CardTitle>
          <CardDescription className="text-zinc-400 text-xs">
            Adicione uma receita ou despesa.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Seletor de Tipo (Despesa ou Receita) via RadioGroup */}
            <div className="space-y-2">
               <Label className="text-zinc-300 font-semibold">Transação</Label>
               <RadioGroup value={type} onValueChange={(val) => setType(val as "income" | "expense")} className="flex gap-4">
                  <div className="flex items-center space-x-2 bg-zinc-950/40 border border-zinc-800 px-4 py-2 rounded-lg flex-1">
                    <RadioGroupItem value="expense" id="expense" />
                    <Label htmlFor="expense">Despesa</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-zinc-950/40 border border-zinc-800 px-4 py-2 rounded-lg flex-1">
                    <RadioGroupItem value="income" id="income" />
                    <Label htmlFor="income">Receita</Label>
                  </div>
               </RadioGroup>
            </div>

            {/* Campo de Data */}
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-zinc-950/40 border-zinc-800" />
            
            {/* Campo de Valor Numérico */}
            <Input type="number" placeholder="0,00" value={value} onChange={(e) => setValue(e.target.value)} className="bg-zinc-950/40 border-zinc-800" />

            {/* Seletor Dinâmico de Categoria */}
            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger className="bg-zinc-950/40 border-zinc-800">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                {todasCategorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Botão de Submissão com Indicador de Carregamento */}
            <Button type="submit" disabled={!isFormValid} className="w-full bg-purple-600">
              {loading ? <Loader2 className="animate-spin" /> : "Salvar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}