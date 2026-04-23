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
    <div className="modal-overlay" onClick={fechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Novo Gênero</h2>

        <form onSubmit={criarGenero}>
          <input
            type="text"
            placeholder="Nome do gênero"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <div style={{ marginTop: 10 }}>
            <button type="submit">Salvar</button>
            <button type="button" onClick={fechar}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}