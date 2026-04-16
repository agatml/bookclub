"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/services/api";
import { Livro } from "@/types/livros";
import { Avaliacao } from "@/types/avaliacoes";
import { useUser } from "@/contexts/UserContext";
import { votar } from "@/services/votos.service";


export default function LivroPage() {
const { usuario } = useUser();
  const params = useParams();
  const id = params?.id as string;


  const [livro, setLivro] = useState<Livro | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [comentario, setComentario] = useState("");
  const [nota, setNota] = useState(5);
  const [loading, setLoading] = useState(true);


  async function carregarLivro() {
    try {
      const data = await apiFetch<Livro>(`/livros/${id}`);
      setLivro(data);
    } catch (err) {
      console.error("Erro ao carregar livro:", err);
    }
  }


  async function carregarAvaliacoes() {
    try {
      const data = await apiFetch<Avaliacao[]>(
        `/livros/${id}/avaliacoes`
      );
      setAvaliacoes(data);
    } catch (err) {
      console.error("Erro ao carregar avaliações:", err);
    }
  }

  async function votarLivro() {
  if (!usuario) {
    alert("Faça login");
    return;
  }

  try {
    await votar(usuario.id, id);
    alert("Voto registrado!");
  } catch (err) {
    console.error(err);
    alert("Erro ao votar");
  }
}


  useEffect(() => {
    if (!id) return;

    async function carregarTudo() {
      setLoading(true);
      await Promise.all([
        carregarLivro(),
        carregarAvaliacoes(),
      ]);
      setLoading(false);
    }

    carregarTudo();
  }, [id]);


  async function criarAvaliacao(e: React.FormEvent) {
  e.preventDefault();

  if (!usuario) {
    alert("Faça login novamente");
    return;
  }

  try {
    await apiFetch(`/livros/${id}/avaliacoes`, {
      method: "POST",
      body: JSON.stringify({
        nota,
        comentario,
        usuario_id: usuario.id,
      }),
    });

    setComentario("");
    setNota(5);

    await carregarAvaliacoes();
  } catch (err) {
    console.error("Erro ao avaliar:", err);
    alert("Erro ao enviar avaliação");
  }
}
  


  if (loading) return <p>Carregando...</p>;
  if (!livro) return <p>Livro não encontrado.</p>;


  return (
    <main style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      {/* INFO DO LIVRO */}
      <div style={{ display: "flex", gap: 20 }}>
        <img
          src={livro.capa_url}
          width={150}
          alt={livro.titulo}
        />

        <div>
          <h1>{livro.titulo}</h1>
          <p><strong>Autor:</strong> {livro.autor}</p>
          <p><strong>Gênero:</strong> {livro.genero.nome}</p>
        </div>
      </div>

      <hr />


      <h2>Avaliar livro</h2>

      <form
        onSubmit={criarAvaliacao}
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
        <select
          value={nota}
          onChange={(e) => setNota(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} ⭐
            </option>
          ))}
        </select>

        <textarea
          placeholder="Comentário..."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={4}
        />

        <button type="submit">
          Enviar avaliação
        </button>
      </form>
      <button onClick={votarLivro}>
  ⭐ Votar neste livro
</button>

      <hr />


      <h2>Avaliações</h2>

      {avaliacoes.length === 0 ? (
        <p>Nenhuma avaliação ainda.</p>
      ) : (
        avaliacoes.map((a) => (
          <div
            key={a.id}
            style={{
              marginBottom: 15,
              padding: 10,
              border: "1px solid #ddd",
              borderRadius: 8,
            }}
          >
            <strong>{a.usuario.nome}</strong>
            <p>⭐ {a.nota}</p>
            <p>{a.comentario}</p>
          </div>
        ))
      )}
    </main>
  );
}