"use client";

import { useState } from "react";
import { apiFetch } from "@/services/api";

type Props = {
  fechar: () => void;
  onCreated: () => void;
};

export default function GeneroModal({ fechar, onCreated }: Props) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  async function criarGenero(e: React.FormEvent) {
    e.preventDefault();

    await apiFetch("/generos", {
      method: "POST",
      body: JSON.stringify({
        nome,
        descricao,
      }),
    });

    onCreated();
    fechar();
  }

  return (
    <form onSubmit={criarGenero}>
      <input
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
      />

      <input
        placeholder="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
      />

      <button type="submit">Salvar</button>
    </form>
  );
}