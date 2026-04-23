"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/services/api";
import { Genero } from "@/types/generos";
import { useUser } from "@/contexts/UserContext";

type Props = {
  fechar: () => void;
  onCreated: () => void;
};

export default function BookModal({ fechar, onCreated }: Props) {

  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [genero_id, setGenero] = useState("");
  const [sinopse, setSinopse] = useState("");
  const [ano, setAno] = useState("");
  const [capa_url, setCapa] = useState("");
  const { usuario } = useUser();
  const [generos, setGeneros] = useState<Genero[]>([]);


  useEffect(() => {
    async function carregarGeneros() {
      const data = await apiFetch<Genero[]>("/generos");
      setGeneros(data);
    }

    carregarGeneros();
  }, []);



  async function criarLivro(e: React.FormEvent) {

    if (!usuario) {
      alert("Faça login para cadastrar livros");
      return;
    }

    e.preventDefault();

    await apiFetch("/livros",
      {

        method: "POST",
        body: JSON.stringify({
          titulo,
          autor,
          genero_id,
          sinopse,
          capa_url,
          ano_publicacao: Number(ano),
          cadastrado_por: usuario?.nome ?? "anonimo",
        }),
      });

    onCreated();
    fechar();
  }

  return (
    <div className="modal-overlay" onClick={fechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <form style={modal} onSubmit={criarLivro}>
          <h2>Novo Livro</h2>

          <input
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />

          <input
            placeholder="Autor"
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            required
          />


          <select
            value={genero_id}
            onChange={(e) => setGenero(e.target.value)}
            required
          >
            <option value="">Selecione um gênero</option>

            {generos.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nome}
              </option>
            ))}
          </select>

          <input
            placeholder="URL da capa"
            value={capa_url}
            onChange={(e) => setCapa(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Ano de publicação"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            required
          />

          <textarea
            placeholder="Sinopse"
            value={sinopse}
            onChange={(e) => setSinopse(e.target.value)}
            required
          />

          <button type="submit">Salvar</button>

          <button type="button" onClick={fechar}>
            Cancelar
          </button>
        </form>
      </div>
    </div>

  );
}

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  background: "white",
  padding: 20,
  borderRadius: 8,
  display: "flex",
  flexDirection: "column" as const,
  gap: 10,
  minWidth: 300,
};