"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/services/api";
import BookCard from "@/components/BookCard/BookCard";
import BookModal from "@/components/BookModal/BookModal";
import GeneroModal from "@/components/GeneroModal/GeneroModal";

import { Livro } from "@/types/livros";
import { Genero } from "@/types/generos";


export default function Catalogo() {

  const [livros, setLivros] = useState<Livro[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);

  const [busca, setBusca] = useState("");
  const [generoSelecionado, setGeneroSelecionado] = useState<string>("");

  const [abrirModal, setAbrirModal] = useState(false);
  const [abrirGenero, setAbrirGenero] = useState(false);



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


  return (
    <main style={{ padding: 20 }}>
      <h1>Catálogo</h1>


      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setAbrirModal(true)}>+ Livro</button>

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
          padding: 10,
          width: "100%",
          maxWidth: 400,
          marginBottom: 20,
        }}
      />


      <select
        value={generoSelecionado}
        onChange={(e) => setGeneroSelecionado(e.target.value)}
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
          />
        ))}
      </div>


      {abrirModal && (
        <BookModal
          fechar={() => setAbrirModal(false)}
          onCreated={carregarLivros}
        />
      )}

      {abrirGenero && (
        <GeneroModal
          fechar={() => setAbrirGenero(false)}
          onCreated={carregarGeneros}
        />
      )}
    </main>
  );

}