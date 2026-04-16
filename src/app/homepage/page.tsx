"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";

import { getFeed } from "@/services/feed.service";
import { getRanking } from "@/services/ranking.service";
import { getLivroDoMes } from "@/services/votos.service";

import { Livro } from "@/types/livros";

export default function HomePage() {
  const { usuario, loading } = useUser();

  const [feed, setFeed] = useState<Livro[]>([]);
  const [ranking, setRanking] = useState<Livro[]>([]);
  const [livroMes, setLivroMes] = useState<Livro | null>(null);

  const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
    if (!usuario) return;

    async function carregarHome() {
      try {
        setLoadingData(true);

        const [feedData, rankingData, livroMesData] =
          await Promise.all([
            getFeed(),
            getRanking(),
            getLivroDoMes(),
          ]);

        setFeed(feedData);
        setRanking(rankingData);
        setLivroMes(livroMesData);
      } catch (err) {
        console.error("Erro ao carregar homepage:", err);
      } finally {
        setLoadingData(false);
      }
    }

    carregarHome();
  }, [usuario]);

    if (loading || loadingData) {
    return <p style={{ padding: 20 }}>Carregando homepage...</p>;
  }

  if (!usuario) {
    return <p>Usuário não autenticado</p>;
  }

    return (
    <main>
      <h1>Olá, {usuario.nome} 👋</h1>

     
      {livroMes && (
        <>
          <h2>Livro do mês</h2>

          <div style={card}>
            <img src={livroMes.capa_url} width={120} />
            <div>
              <h3>{livroMes.titulo}</h3>
              <p>{livroMes.autor}</p>
              <p>{livroMes.genero.nome}</p>
            </div>
          </div>
        </>
      )}

      <hr />

     
      <h2>Ranking</h2>

      <div style={grid}>
        {ranking.slice(0, 5).map((livro) => (
          <div key={livro.id} style={miniCard}>
            <img src={livro.capa_url} width={80} />
            <p>{livro.titulo}</p>
          </div>
        ))}
      </div>

      <hr />


      <h2>📚 Feed recente</h2>

      <div style={grid}>
        {feed.map((livro) => (
          <div key={livro.id} style={miniCard}>
            <img src={livro.capa_url} width={80} />
            <p>{livro.titulo}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))",
  gap: 16,
};

const card = {
  display: "flex",
  gap: 20,
  padding: 16,
  border: "1px solid #ddd",
  borderRadius: 10,
  marginBottom: 20,
};

const miniCard = {
  padding: 10,
  border: "1px solid #eee",
  borderRadius: 8,
};

