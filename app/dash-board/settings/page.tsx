"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";

export default function SettingsPage() {
  const [newCat, setNewCat] = useState("");
  const [customCategories, setCustomCategories] = useState<any[]>([]);

  // Busca categorias customizadas do usuário
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "categories"), where("userId", "==", auth.currentUser.uid));
    return onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setCustomCategories(cats);
    });
  }, []);

  const addCategory = async () => {
    if (!newCat || !auth.currentUser) return;
    await addDoc(collection(db, "categories"), {
      name: newCat,
      userId: auth.currentUser.uid,
      type: "expense" // você pode adicionar um seletor para isso depois
    });
    setNewCat("");
  };

  const deleteCategory = async (id: string) => {
    await deleteDoc(doc(db, "categories", id));
  };

  return (
    <div className="p-6 text-white max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      
      {/* Gerenciador de Categorias */}
      <section className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-semibold mb-4">Minhas Categorias</h2>
        <div className="flex gap-2 mb-4">
          <Input 
            value={newCat} 
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="Ex: Mesada da vovó"
            className="bg-zinc-950 border-zinc-800"
          />
          <Button onClick={addCategory}><Plus className="w-4 h-4 mr-2" /> Adicionar</Button>
        </div>
        
        <ul className="space-y-2">
          {customCategories.map((cat) => (
            <li key={cat.id} className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              {cat.name}
              <Button variant="ghost" size="icon" onClick={() => deleteCategory(cat.id)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}