// SRC/APP/CATALOGO/PAGE.TSX
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/services/api";
import BookCard from "@/components/BookCard/BookCard";
import BookModal from "@/components/BookModal/BookModal";
import GeneroModal from "@/components/GeneroModal/GeneroModal";
import { RouteGuard } from "@/components/RouteGuard";
import { Livro } from "@/types/livros";
import { Genero } from "@/types/generos";

export default function Catalogo() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [busca, setBusca] = useState("");
  const [generoSelecionado, setGeneroSelecionado] = useState<string>("");
  const [abrirModal, setAbrirModal] = useState(false);
  const [abrirGenero, setAbrirGenero] = useState(false);
  const [livroEditando, setLivroEditando] = useState<Livro | null>(null);

  async function carregarLivros() {
    const data = await apiFetch<Livro[]>("/livros");
    setLivros(data);
  }

  async function carregarGeneros() {
    const data = await apiFetch<Genero[]>("/generos");
    setGeneros(data);
  }

  useEffect(() => {
    carregarLivros();
    carregarGeneros();
  }, []);

  const generosMap = Object.fromEntries(
    generos.map((g) => [g.id, g.nome])
  );

  const livrosFiltrados = livros.filter((livro) => {
    const matchBusca =
      livro.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      livro.autor.toLowerCase().includes(busca.toLowerCase());

    const matchGenero =
      generoSelecionado === "" ||
      livro.genero.id === generoSelecionado;

    return matchBusca && matchGenero;
  });


  const handleEditBook = (livro: Livro) => {
    setLivroEditando(livro);
    setAbrirModal(true);
  };


  const handleModalSuccess = () => {
    carregarLivros();
    setLivroEditando(null);
  };


  const handleCloseModal = () => {
    setAbrirModal(false);
    setLivroEditando(null);
  };

  return (
    <RouteGuard>
      <main style={{ padding: 20 }}>

        <h1>Catálogo</h1>

        <div style={{ marginBottom: 20 }}>
          <button onClick={() => {
            setLivroEditando(null);
            setAbrirModal(true);
          }}>
            + Livro
          </button>

          <button
            style={{ marginLeft: 10 }}
            onClick={() => setAbrirGenero(true)}
          >
            + Novo Gênero
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar por título ou autor..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{
            padding: 5,
            width: "100%",
            maxWidth: 400,
            marginBottom: 20,
          }}
        />

        <select
          value={generoSelecionado}
          onChange={(e) => setGeneroSelecionado(e.target.value)}
          style={{
            marginBottom: 20,
            marginLeft: 10,
            padding: 5,
          }}
        >
          <option value="">Todos os gêneros</option>

          {generos.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nome}
            </option>
          ))}
        </select>

        <div className="grid">
          {livrosFiltrados.map((livro) => (
            <BookCard
              key={livro.id}
              livro={livro}
              generoNome={generosMap[livro.genero.id]}
              onEdit={handleEditBook}
            />
          ))}
        </div>


        {abrirModal && (
          <BookModal
            fechar={handleCloseModal}
            onSuccess={handleModalSuccess}
            livro={livroEditando}
          />
        )}


        {abrirGenero && (
          <GeneroModal
            fechar={() => setAbrirGenero(false)}
            onCreated={() => {
              carregarGeneros();
              setAbrirGenero(false);
            }}
          />
        )}

      </main>
    </RouteGuard>
  );
}