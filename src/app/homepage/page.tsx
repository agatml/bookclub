"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import { getFeed } from "@/services/feed.service";
import { getRanking } from "@/services/ranking.service";
import { getLivroDoMes, votar } from "@/services/votos.service";
import Link from "next/link";
import { RouteGuard } from "@/components/RouteGuard";

export default function HomePage() {
  const { usuario, loading } = useUser();

  const [feed, setFeed] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [livroMes, setLivroMes] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [votando, setVotando] = useState<string | null>(null);

  const dadosCarregados = useRef(false);

  const carregarDados = useCallback(async (recarregarRanking = true) => {
    if (!usuario) return;

    console.log("Carregando dados...");

    try {
      const [feedData, livroMesData] = await Promise.all([
        getFeed(),
        getLivroDoMes(),
      ]);

      setFeed(Array.isArray(feedData) ? feedData : []);
      setLivroMes(livroMesData || null);

      if (recarregarRanking) {
        const rankingData = await getRanking();
        
        const rankingFiltrado = Array.isArray(rankingData)
          ? rankingData.filter(livro => livro && livro.titulo && livro.titulo !== "")
          : [];
        setRanking(rankingFiltrado);
        console.log("Ranking filtrado:", rankingFiltrado.length);
      }

    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setLoadingData(false);
    }
  }, [usuario]);

  useEffect(() => {
    if (usuario && !loading && !dadosCarregados.current) {
      dadosCarregados.current = true;
      carregarDados(true);
    }
  }, [usuario, loading, carregarDados]);

  async function handleVotar(livroId: string) {
    if (!usuario) {
      alert("Faça login para votar!");
      return;
    }

    setVotando(livroId);
    try {
      console.log("Votando:", livroId);
      await votar(usuario.id, livroId);
      alert("Voto registrado com sucesso! 🎉");

      const [novoRanking, novoLivroMes] = await Promise.all([
        getRanking(),
        getLivroDoMes(),
      ]);

      
      const rankingFiltrado = Array.isArray(novoRanking)
        ? novoRanking.filter(livro => livro && livro.titulo && livro.titulo !== "")
        : [];
      setRanking(rankingFiltrado);
      setLivroMes(novoLivroMes || null);

    } catch (error) {
      console.error("Erro ao votar:", error);
      alert("Erro ao registrar voto. Tente novamente.");
    } finally {
      setVotando(null);
    }
  }

  if (loading || loadingData) {
    return (
      <div style={{ padding: 20 }}>
        <p>Carregando homepage...</p>
      </div>
    );
  }

  if (!usuario) {
    return <p>Usuário não autenticado</p>;
  }

  
  const livroDoMesObj = livroMes?.livro || livroMes;
  const livroDoMesId = livroDoMesObj?.id;
  const livroDoMesTitulo = livroDoMesObj?.titulo;
  const livroDoMesAutor = livroDoMesObj?.autor;
  const livroDoMesCapa = livroDoMesObj?.capa_url;
  const livroDoMesGenero = livroDoMesObj?.genero?.nome;
  const livroDoMesVotos = livroMes?.total_votos || 0;

  return (
    <RouteGuard>
    <main style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <h1>Olá, {usuario.nome} 👋</h1>

     

     
      {livroDoMesObj && (
        <>
          <h2>📖 Livro do mês</h2>
          <div style={card}>
            <img
              src={livroDoMesCapa || "https://via.placeholder.com/120x160"}
              width={120}
              height={160}
              alt={livroDoMesTitulo || "Livro"}
              style={{ borderRadius: 8, objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/120x160";
              }}
            />
            <div>
              <h3>{livroDoMesTitulo || "Sem título"}</h3>
              <p><strong>Autor:</strong> {livroDoMesAutor || "Desconhecido"}</p>
              <p><strong>Gênero:</strong> {livroDoMesGenero || "Não definido"}</p>
              <p><strong>Total de votos no mês:</strong> {livroDoMesVotos}</p>
              <button
                onClick={() => handleVotar(livroDoMesId)}
                disabled={votando === livroDoMesId}
                style={{
                  ...votarButton,
                  opacity: votando === livroDoMesId ? 0.6 : 1
                }}
              >
                {votando === livroDoMesId ? "Votando..." : "⭐ Votar neste livro"}
              </button>
            </div>
          </div>
        </>
      )}

      <hr style={{ margin: "30px 0" }} />

    
      <h2>🏆 Ranking de Livros</h2>


      {ranking.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, backgroundColor: '#f9f9f9', borderRadius: 8 }}>
          <p>📊 Nenhum livro no ranking ainda.</p>
          <p style={{ fontSize: 14, color: '#666' }}>Os livros com mais votos aparecerão aqui!</p>
        </div>
      ) : (
        <div style={grid}>
          {ranking.map((livro: any, index: number) => (
            <div key={livro.id} style={rankingCard}>
              <div style={medalhaContainer}>
                <span style={medalhaStyle(index + 1)}>
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}º`}
                </span>
              </div>
              <Link href={`/livros/${livro.id}`} style={{ textDecoration: 'none' }}>
                {/* // Na parte do ranking, substitua a imagem por : */}
                {livro.capa_url && (
                  <img
                    src={livro.capa_url}
                    width={100}
                    height={140}
                    alt={livro.titulo}
                    style={{
                      borderRadius: 6,
                      objectFit: 'cover',
                      marginBottom: 10,
                      cursor: 'pointer'
                    }}
                  />
                )}
                {!livro.capa_url && (
                  <div style={{
                    width: 100,
                    height: 140,
                    backgroundColor: '#f0f0f0',
                    borderRadius: 6,
                    marginBottom: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    color: '#999'
                  }}>
                    📚
                  </div>
                )}
                <h3 style={{ fontSize: 14, margin: "8px 0 4px", color: "#333" }}>
                  {livro.titulo}
                </h3>
                <p style={{ fontSize: 12, color: "#666", margin: 0 }}>
                  {livro.autor}
                </p>
                <p style={{ fontSize: 12, color: "#999", margin: "4px 0 0" }}>
                  {livro.genero_nome}
                </p>
                <p style={{
                  fontSize: 13,
                  color: "#f5a623",
                  marginTop: 8,
                  fontWeight: "bold"
                }}>
                  ⭐ {livro.total_votos} {livro.total_votos === 1 ? 'voto' : 'votos'}
                </p>
              </Link>
              <button
                onClick={() => handleVotar(livro.id)}
                disabled={votando === livro.id}
                style={{
                  ...smallVotarButton,
                  opacity: votando === livro.id ? 0.6 : 1
                }}
              >
                {votando === livro.id ? "..." : "Votar"}
              </button>
            </div>
          ))}
        </div>
      )}

      <hr style={{ margin: "30px 0" }} />

    
      <h2>📝 Avaliações recentes ({feed.length})</h2>

      {feed.length === 0 ? (
        <p>Nenhuma avaliação ainda.</p>
      ) : (
        <div style={gridFeed}>
          {feed.slice(0, 6).map((avaliacao: any) => (
            <Link href={`/livros/${avaliacao.livro_id}`} key={avaliacao.id} style={{ textDecoration: 'none' }}>
              <div style={avaliacaoCard}>
                <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>
                  {avaliacao.usuario?.nome || "Usuário"}
                </p>
                <p style={{ margin: '5px 0', fontSize: 14 }}>
                  {"⭐".repeat(avaliacao.nota)}{"☆".repeat(5 - avaliacao.nota)} ({avaliacao.nota}/5)
                </p>
                <p style={{ fontSize: 12, color: "#666", margin: 0 }}>
                  {avaliacao.comentario?.substring(0, 80) || "Sem comentário"}
                  {avaliacao.comentario?.length > 80 ? "..." : ""}
                </p>
                <p style={{ fontSize: 10, color: "#999", marginTop: 8 }}>
                  {new Date(avaliacao.criado_em).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
    </RouteGuard>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
  gap: 20,
  marginTop: 20,
};

const gridFeed = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: 20,
  marginTop: 20,
};

const card = {
  display: "flex",
  gap: 20,
  padding: 20,
  border: "1px solid #e0e0e0",
  borderRadius: 12,
  marginBottom: 20,
  backgroundColor: "#f9f9f9",
  alignItems: "center" as const,
  flexWrap: "wrap" as const,
};

const miniCard = {
  padding: 12,
  border: "1px solid #eee",
  borderRadius: 10,
  transition: "transform 0.2s, box-shadow 0.2s",
  cursor: "pointer",
  backgroundColor: "#fff",
  height: "100%",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center" as const,
};

const rankingCard = {
  ...miniCard,
  position: "relative" as const,
  padding: "12px 12px 16px",
};

const avaliacaoCard = {
  padding: 12,
  border: "1px solid #eee",
  borderRadius: 10,
  transition: "transform 0.2s, box-shadow 0.2s",
  cursor: "pointer",
  backgroundColor: "#fff",
  height: "100%",
  display: "flex",
  flexDirection: "column" as const,
};

const medalhaContainer = {
  position: "absolute" as const,
  top: -8,
  left: -8,
  zIndex: 1,
};

const medalhaStyle = (posicao: number): React.CSSProperties => ({
  display: "inline-block",
  background: posicao === 1 ? "#FFD700" : posicao === 2 ? "#C0C0C0" : "#CD7F32",
  color: posicao === 1 ? "#B8860B" : "#666",
  borderRadius: "50%",
  width: 32,
  height: 32,
  lineHeight: "32px",
  textAlign: "center",
  fontWeight: "bold",
  fontSize: 14,
  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
});

const votarButton = {
  marginTop: 10,
  padding: "8px 16px",
  backgroundColor: "#f5a623",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: "bold",
};

const smallVotarButton = {
  marginTop: 8,
  padding: "4px 12px",
  fontSize: 12,
  backgroundColor: "#f5a623",
  color: "white",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontWeight: "bold",
};