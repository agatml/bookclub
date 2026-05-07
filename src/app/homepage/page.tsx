// homepage (versão atualizada com localStorage)
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import { getFeed } from "@/services/feed.service";
import { getLivroDoMes, votar, getVotoLocalStorage } from "@/services/votos.service";
import Link from "next/link";
import { RouteGuard } from "@/components/RouteGuard";
import { getRanking, RankingPorGenero } from "@/services/ranking.service";
import BookImage from "@/components/BookImage"

export default function HomePage() {
  const { usuario, loading } = useUser();

  const [feed, setFeed] = useState<any[]>([]);
  const [ranking, setRanking] = useState<RankingPorGenero[]>([]);
  const [livroMes, setLivroMes] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [votando, setVotando] = useState<string | null>(null);
  const [jaVotouLivroMes, setJaVotouLivroMes] = useState(false);

  const dadosCarregados = useRef(false);



  
  const verificarVotoLocalStorage = useCallback((livroDoMesId: string) => {
    const votoSalvo = getVotoLocalStorage();
    setJaVotouLivroMes(votoSalvo === livroDoMesId);
  }, []);

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

      
      if (livroMesData?.livro?.id) {
        verificarVotoLocalStorage(livroMesData.livro.id);
      }

      if (recarregarRanking) {
        const rankingData = await getRanking();
        setRanking(rankingData);
        console.log("Ranking carregado:", rankingData.length, "gêneros");
      }

    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setLoadingData(false);
    }
  }, [usuario, verificarVotoLocalStorage]);

  useEffect(() => {
    if (usuario && !loading && !dadosCarregados.current) {
      dadosCarregados.current = true;
      carregarDados(true);
    }
  }, [usuario, loading, carregarDados]);

  async function handleVotar(livroId: string, isLivroDoMes: boolean = false) {
    if (!usuario) {
      alert("Faça login para votar!");
      return;
    }

    
    if (isLivroDoMes && jaVotouLivroMes) {
      alert("Você já votou no livro do mês este mês!");
      return;
    }

    setVotando(livroId);
    try {
      console.log("Votando:", livroId);
      await votar(usuario.id, livroId);

      
      if (isLivroDoMes) {
        localStorage.setItem("voto-do-mes", livroId);
        setJaVotouLivroMes(true);
      }

      alert("Voto registrado com sucesso!");

      const [novoRanking, novoLivroMes] = await Promise.all([
        getRanking(),
        getLivroDoMes(),
      ]);

      setRanking(novoRanking);
      setLivroMes(novoLivroMes || null);

    } catch (error: any) {
      console.error("Erro ao votar:", error);

     
      if (error?.message?.includes("já votou") || error?.status === 409) {
        if (isLivroDoMes) {
          localStorage.setItem("voto-do-mes", livroId);
          setJaVotouLivroMes(true);
        }
        alert("Você já havia votado neste livro! Voto confirmado.");
      } else {
        alert("Erro ao registrar voto. Tente novamente.");
      }
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

  const botaoVotarDesabilitado = jaVotouLivroMes || votando === livroDoMesId;

  return (
    <RouteGuard>
      <main style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
        <h1>Bem-vindo(a), {usuario.nome}.</h1>

        {livroDoMesObj && (
          <>
            <h2>Livro do mês</h2>
            <div style={card}>



              <BookImage
                src={livroDoMesCapa}
                title={livroDoMesTitulo || "Livro"}
                width={120}
                height={160}
                style={{ marginBottom: 10, cursor: 'pointer', borderRadius: 8 }}
              />
              <div>
                <h3>{livroDoMesTitulo || "Sem título"}</h3>
                <p><strong>Autor:</strong> {livroDoMesAutor || "Desconhecido"}</p>
                <p><strong>Gênero:</strong> {livroDoMesGenero || "Não definido"}</p>
                <p><strong>Total de votos no mês:</strong> {livroDoMesVotos}</p>

                {jaVotouLivroMes && (
                  <p style={{ color: "#28a745", fontSize: 14, marginBottom: 8 }}>
                    ✅ Você já votou no livro do mês este mês!
                  </p>
                )}

                <button
                  onClick={() => handleVotar(livroDoMesId, true)}
                  disabled={botaoVotarDesabilitado}
                  style={{
                    ...votarButton,
                    opacity: botaoVotarDesabilitado ? 0.6 : 1,
                    backgroundColor: jaVotouLivroMes ? "#6c757d" : "#f5a623"
                  }}
                >
                  {votando === livroDoMesId
                    ? "Votando..."
                    : jaVotouLivroMes
                      ? "✓ Voto realizado"
                      : "⭐ Votar neste livro"}
                </button>
              </div>
            </div>
          </>
        )}

        <hr style={{ margin: "30px 0" }} />

        <h2>🏆 Ranking de Livros</h2>

        {ranking.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, backgroundColor: '#f9f9f9', borderRadius: 8 }}>
            <p>Nenhum livro no ranking ainda.</p>
            <p style={{ fontSize: 14, color: '#666' }}>Os livros com mais votos aparecerão aqui!</p>
          </div>
        ) : (
          ranking.map((genero) => (
            <div key={genero.genero_id} style={{ marginBottom: 40 }}>
              <h3 style={{
                fontSize: 24,
                color: '#333',
                borderBottom: '3px solid #f5a623',
                paddingBottom: 8,
                marginBottom: 20
              }}>
                🏷️ {genero.genero_nome}
              </h3>
              <div style={grid}>
                {genero.livros.map((livro) => (
                  <div key={livro.id} style={rankingCard}>
                    <div style={medalhaContainer}>
                      <span style={medalhaStyle(livro.posicao)}>
                        {livro.posicao === 1 ? "🥇" : livro.posicao === 2 ? "🥈" : livro.posicao === 3 ? "🥉" : `${livro.posicao}º`}
                      </span>
                    </div>
                    <Link href={`/livros/${livro.id}`} style={{ textDecoration: 'none' }}>
                      <BookImage
                        src={livro.capa_url}
                        title={livro.titulo}
                        width={100}
                        height={140}
                        style={{ marginBottom: 10, cursor: 'pointer', borderRadius: 6 }}
                      />
                      <h3 style={{ fontSize: 14, margin: "8px 0 4px", color: "#333" }}>
                        {livro.titulo}
                      </h3>
                      <p style={{ fontSize: 12, color: "#666", margin: 0 }}>
                        {livro.autor}
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
                      onClick={() => handleVotar(livro.id, false)}
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
            </div>
          ))
        )}

        <hr style={{ margin: "30px 0" }} />

        <h2>Avaliações recentes ({feed.length})</h2>

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