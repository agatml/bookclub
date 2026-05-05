// pagina livro (com estatísticas completas)
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/services/api";
import { Livro } from "@/types/livros";
import { Avaliacao } from "@/types/avaliacoes";
import { useUser } from "@/contexts/UserContext";
import { RouteGuard } from "@/components/RouteGuard";
import { votar, getVotoUsuario, getVotosDoLivroSeForLivroDoMes } from "@/services/votos.service";
import { CriarAvaliacaoPayload } from "@/types/requests";

export default function LivroPage() {
  const { usuario } = useUser();
  const params = useParams();
  const id = params?.id as string;

  const [livro, setLivro] = useState<Livro | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [comentario, setComentario] = useState("");
  const [nota, setNota] = useState(5);
  const [loading, setLoading] = useState(true);
  const [jaVotou, setJaVotou] = useState(false);
  const [votando, setVotando] = useState(false);
  const [infoVotosMes, setInfoVotosMes] = useState({ isLivroDoMes: false, totalVotos: 0 });

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
      const data = await apiFetch<Avaliacao[]>(`/livros/${id}/avaliacoes`);
      setAvaliacoes(data);
    } catch (err) {
      console.error("Erro ao carregar avaliações:", err);
    }
  }

  async function verificarVotoUsuario() {
    if (!usuario) return;

    try {
      const votos = await getVotoUsuario(usuario.id);
      const votou = Array.isArray(votos) 
        ? votos.some(voto => voto.livro_id === id)
        : false;
      
      setJaVotou(votou);
    } catch (err) {
      console.error("Erro ao verificar voto:", err);
      setJaVotou(false);
    }
  }

  async function verificarStatusLivroMes() {
    const info = await getVotosDoLivroSeForLivroDoMes(id);
    setInfoVotosMes(info);
  }

  async function handleVotar() {
    if (!usuario) {
      alert("Faça login para votar");
      return;
    }

    if (jaVotou) {
      alert("Você já votou neste livro!");
      return;
    }

    setVotando(true);
    try {
      await votar(usuario.id, id);
      alert("Voto registrado com sucesso! ✅");
      setJaVotou(true);
      
      // Se for o livro do mês, recarregar os votos
      if (infoVotosMes.isLivroDoMes) {
        const info = await getVotosDoLivroSeForLivroDoMes(id);
        setInfoVotosMes(info);
      }
    } catch (err) {
      console.error("Erro ao votar:", err);
      alert("Erro ao registrar voto. Tente novamente.");
    } finally {
      setVotando(false);
    }
  }

  useEffect(() => {
    if (!id) return;

    async function carregarTudo() {
      setLoading(true);
      await Promise.all([
        carregarLivro(),
        carregarAvaliacoes(),
        verificarVotoUsuario(),
        verificarStatusLivroMes(),
      ]);
      setLoading(false);
    }

    carregarTudo();
  }, [id, usuario]);

  async function criarAvaliacao(e: React.FormEvent) {
    e.preventDefault();

    if (!usuario) {
      alert("Faça login para avaliar");
      return;
    }

    try {
      const payload: CriarAvaliacaoPayload = {
        nota,
        comentario,
        usuario_id: usuario.id,
      };

      await apiFetch(`/livros/${id}/avaliacoes`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setComentario("");
      setNota(5);
      await carregarAvaliacoes();
      alert("Avaliação enviada com sucesso! 📝");
    } catch (err) {
      console.error("Erro ao avaliar:", err);
      alert("Erro ao enviar avaliação");
    }
  }

  const calcularMediaNotas = () => {
    if (avaliacoes.length === 0) return null;
    const soma = avaliacoes.reduce((acc, av) => acc + av.nota, 0);
    return soma / avaliacoes.length;
  };

  const mediaNotas = calcularMediaNotas();
  const totalAvaliacoes = avaliacoes.length;

  if (loading) return <p>Carregando...</p>;
  if (!livro) return <p>Livro não encontrado.</p>;

  return (
    <RouteGuard>
      <main style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
        {/* INFO DO LIVRO */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {livro.capa_url && (
            <img
              src={livro.capa_url}
              width={150}
              height={200}
              style={{ objectFit: "cover", borderRadius: 8 }}
              alt={livro.titulo}
            />
          )}

          <div style={{ flex: 1 }}>
            <h1>{livro.titulo}</h1>
            <p><strong>Autor:</strong> {livro.autor}</p>
            {livro.genero && (
              <p><strong>Gênero:</strong> {livro.genero.nome}</p>
            )}

            <div style={{
              marginTop: 20,
              padding: 15,
              backgroundColor: "#f8f9fa",
              borderRadius: 8,
              border: "1px solid #e9ecef"
            }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "1rem" }}>
                📊 Estatísticas do Livro
              </h3>

              <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
                {/* Nota média */}
                <div>
                  <div style={{ fontSize: 28, fontWeight: "bold", color: "#ffc107" }}>
                    {mediaNotas !== null ? mediaNotas.toFixed(1) : "N/A"}
                  </div>
                  <div style={{ fontSize: 14, color: "#666" }}>⭐ Nota média</div>
                  <div style={{ fontSize: 12, color: "#999" }}>
                    ({totalAvaliacoes} {totalAvaliacoes === 1 ? "avaliação" : "avaliações"})
                  </div>
                </div>

                {/* Total de avaliações */}
                <div>
                  <div style={{ fontSize: 28, fontWeight: "bold", color: "#28a745" }}>
                    {totalAvaliacoes}
                  </div>
                  <div style={{ fontSize: 14, color: "#666" }}>📝 Total de avaliações</div>
                </div>

                {/* Votos no mês (apenas se for o livro do mês) */}
                <div>
                  <div style={{ 
                    fontSize: 28, 
                    fontWeight: "bold", 
                    color: infoVotosMes.isLivroDoMes ? "#f5a623" : "#adb5bd" 
                  }}>
                    {infoVotosMes.isLivroDoMes ? infoVotosMes.totalVotos : "—"}
                  </div>
                  <div style={{ fontSize: 14, color: "#666" }}>🗳️ Votos no mês</div>
                  <div style={{ fontSize: 12, color: "#999" }}>
                    {infoVotosMes.isLivroDoMes 
                      ? "Total de votos recebidos neste mês" 
                      : "Não é o livro do mês atual"}
                  </div>
                </div>

                {/* Status do voto do usuário */}
                <div>
                  <div style={{ fontSize: 28, fontWeight: "bold", color: "#6c757d" }}>
                    {jaVotou ? "✓" : "○"}
                  </div>
                  <div style={{ fontSize: 14, color: "#666" }}>🗳️ Seu voto</div>
                  <div style={{ fontSize: 12, color: "#999" }}>
                    {jaVotou ? "Você já votou neste livro" : "Você ainda não votou"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr style={{ margin: "20px 0" }} />

        {/* Seção de votação */}
        <div style={{ marginBottom: 30 }}>
          <h2>🎯 Votar no Livro do Mês</h2>
          
          {infoVotosMes.isLivroDoMes && (
            <div style={{
              marginBottom: 15,
              padding: 10,
              backgroundColor: "#fff3e0",
              borderRadius: 5,
              borderLeft: "4px solid #f5a623"
            }}>
              <p style={{ margin: 0, fontSize: 14 }}>
                📊 Este livro é o <strong>Livro do Mês</strong> e já recebeu <strong>{infoVotosMes.totalVotos} votos</strong>!
              </p>
            </div>
          )}
          
          {!infoVotosMes.isLivroDoMes && (
            <div style={{
              marginBottom: 15,
              padding: 10,
              backgroundColor: "#e7f3ff",
              borderRadius: 5,
              borderLeft: "4px solid #007bff"
            }}>
              <p style={{ margin: 0, fontSize: 14 }}>
                ℹ️ Votar neste livro ajuda ele a se tornar o <strong>Livro do Mês</strong>!
              </p>
            </div>
          )}
          
          <button
            onClick={handleVotar}
            disabled={jaVotou || votando}
            style={{
              padding: "12px 24px",
              fontSize: 16,
              cursor: (jaVotou || votando) ? "not-allowed" : "pointer",
              backgroundColor: jaVotou ? "#6c757d" : (infoVotosMes.isLivroDoMes ? "#f5a623" : "#007bff"),
              color: "white",
              border: "none",
              borderRadius: 5,
              transition: "background-color 0.2s"
            }}
          >
            {votando ? "💫 Processando..." : jaVotou ? "✓ Voto confirmado" : "⭐ Votar neste livro"}
          </button>
          <p style={{ fontSize: 14, color: "#666", marginTop: 8 }}>
            O livro mais votado do mês será destaque no ranking e como Livro do Mês!
          </p>
        </div>

        <hr style={{ margin: "20px 0" }} />

        {/* Seção de avaliação */}
        <div style={{ marginBottom: 30 }}>
          <h2>✍️ Avaliar livro</h2>
          <form onSubmit={criarAvaliacao} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                Nota:
              </label>
              <select
                value={nota}
                onChange={(e) => setNota(Number(e.target.value))}
                style={{ padding: 8, borderRadius: 5, border: "1px solid #ddd" }}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} ⭐ {n === 1 ? "(Muito Ruim)" : n === 5 ? "(Excelente)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                Comentário:
              </label>
              <textarea
                placeholder="Compartilhe sua opinião sobre o livro..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={4}
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 5,
                  border: "1px solid #ddd",
                  fontFamily: "inherit"
                }}
                required
              />
            </div>

            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
                fontSize: 16
              }}
            >
              Enviar avaliação
            </button>
          </form>
        </div>

        <hr style={{ margin: "20px 0" }} />

        {/* Lista de avaliações */}
        <div>
          <h2>💬 Avaliações ({totalAvaliacoes})</h2>

          {avaliacoes.length === 0 ? (
            <p style={{ color: "#666", textAlign: "center", padding: 20 }}>
              Nenhuma avaliação ainda. Seja o primeiro a avaliar!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              {avaliacoes.map((avaliacao) => (
                <div
                  key={avaliacao.id}
                  style={{
                    padding: 15,
                    border: "1px solid #e0e0e0",
                    borderRadius: 8,
                    backgroundColor: "#fff"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <strong style={{ fontSize: 16 }}>
                      {avaliacao.usuario?.nome || "Usuário"}
                    </strong>
                    <span style={{ color: "#ffc107", fontWeight: "bold" }}>
                      {"⭐".repeat(avaliacao.nota)}
                    </span>
                  </div>
                  <p style={{ margin: "8px 0 0 0", color: "#333", lineHeight: 1.5 }}>
                    {avaliacao.comentario}
                  </p>
                  {avaliacao.data_criacao && (
                    <small style={{ color: "#999", display: "block", marginTop: 8 }}>
                      {new Date(avaliacao.data_criacao).toLocaleDateString("pt-BR")}
                    </small>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </RouteGuard>
  );
}