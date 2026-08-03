"use client";

import React, { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, setDoc, addDoc, deleteDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Save } from "lucide-react";

/**
 * Página de Configurações da Conta (SettingsPage).
 * Permite ao usuário gerenciar suas preferências de exibição de cartões de destaque no dashboard 
 * (selecionando até 4 categorias favoritas) e administrar suas categorias customizadas no Firestore.
 */
export default function SettingsPage() {
  // Estados locais para inputs, listagem de categorias customizadas e favoritos
  const [newCat, setNewCat] = useState("");
  const [customCats, setCustomCats] = useState<{id: string, name: string}[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Lista padrão de categorias globais do sistema
  const padrao = ["Acomodação", "Alimentação", "Outros", "Salário", "Supermercado", "Transporte"];

  /**
   * Sincronização em tempo real com o Firestore.
   * Busca as categorias personalizadas do usuário autenticado e suas preferências salvas de favoritos.
   */
  useEffect(() => {
    if (!auth.currentUser) return;

    // 1. Escuta em tempo real das categorias customizadas do usuário
    const q = query(collection(db, "categories"), where("userId", "==", auth.currentUser.uid));
    const unsubCats = onSnapshot(q, (snapshot) => {
      setCustomCats(snapshot.docs.map(d => ({ id: d.id, name: d.data().name })));
    });

    // 2. Escuta em tempo real das preferências de cards favoritos (user_settings)
    const unsubPrefs = onSnapshot(doc(db, "user_settings", auth.currentUser.uid), (doc) => {
      if (doc.exists()) setFavorites(doc.data().favorites || []);
    });

    // Limpeza dos listeners ao desmontar o componente
    return () => { unsubCats(); unsubPrefs(); };
  }, []);

  /**
   * Adiciona uma nova categoria customizada vinculada ao UID do usuário no Firestore.
   */
  const addCategory = async () => {
    if (!newCat || !auth.currentUser) return;
    await addDoc(collection(db, "categories"), { name: newCat, userId: auth.currentUser.uid });
    setNewCat("");
  };

  /**
   * Remove uma categoria customizada do Firestore pelo seu ID.
   */
  const deleteCategory = async (id: string) => {
    await deleteDoc(doc(db, "categories", id));
  };

  /**
   * Alterna o estado de seleção de uma categoria nos favoritos.
   * Mantém um limite de até 4 itens selecionados utilizando controle de array slice.
   */
  const toggleFavorite = (cat: string) => {
    setFavorites(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev.slice(-3), cat]);
  };

  /**
   * Salva as preferências de categorias favoritas do usuário na coleção `user_settings`.
   */
  const savePreferences = async () => {
    if (!auth.currentUser) return;
    await setDoc(doc(db, "user_settings", auth.currentUser.uid), { favorites }, { merge: true });
    alert("Preferências salvas!");
  };

  return (
    <div className="p-6 text-white max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Configurações</h1>
      
      {/* SEÇÃO 1: CARDS DE DESTAQUE (FAVORITOS) */}
      <section className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-semibold mb-4">Cards de Destaque (Escolha até 4)</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[...padrao, ...customCats.map(c => c.name)].map(cat => (
            <div key={cat} className="flex items-center space-x-2">
              <Checkbox checked={favorites.includes(cat)} onCheckedChange={() => toggleFavorite(cat)} />
              <label className="text-sm">{cat}</label>
            </div>
          ))}
        </div>
        <Button onClick={savePreferences} className="w-full bg-purple-600"><Save className="w-4 h-4 mr-2" /> Salvar</Button>
      </section>

      {/* SEÇÃO 2: GERENCIAR CATEGORIAS PERSONALIZADAS */}
      <section className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-semibold mb-4">Minhas Categorias</h2>
        <div className="flex gap-2 mb-4">
          <Input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Nova categoria..." />
          <Button onClick={addCategory}><Plus className="w-4 h-4" /></Button>
        </div>
        <ul className="space-y-2">
          {customCats.map(cat => (
            <li key={cat.id} className="flex justify-between items-center bg-zinc-950 p-2 rounded border border-zinc-800">
              {cat.name}
              <Button variant="ghost" size="icon" onClick={() => deleteCategory(cat.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}