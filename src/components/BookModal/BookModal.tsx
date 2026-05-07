// SRC/COMPONENTS/BOOKMODAL/BOOKMODAL.TSX
"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/services/api";
import { Genero } from "@/types/generos";
import { Livro } from "@/types/livros";
import { useUser } from "@/contexts/UserContext";
import { CriarLivroPayload } from "@/types/requests";

type Props = {
  fechar: () => void;
  onSuccess: () => void;  
  livro?: Livro | null;   
};

export default function BookModal({ fechar, onSuccess, livro }: Props) {
  const isEditMode = !!livro; 

  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [genero_id, setGenero] = useState("");
  const [sinopse, setSinopse] = useState("");
  const [ano, setAno] = useState("");
  const [capa_url, setCapa] = useState("");
  const [loading, setLoading] = useState(false);
  const { usuario } = useUser();
  const [generos, setGeneros] = useState<Genero[]>([]);

 
  useEffect(() => {
    async function carregarGeneros() {
      const data = await apiFetch<Genero[]>("/generos");
      setGeneros(data);
    }
    carregarGeneros();
  }, []);


  useEffect(() => {
    if (livro && isEditMode) {
      setTitulo(livro.titulo || "");
      setAutor(livro.autor || "");
      setGenero(livro.genero?.id || "");
      setSinopse(livro.sinopse || "");
      setAno(livro.ano_publicacao?.toString() || "");
      setCapa(livro.capa_url || "");
    }
  }, [livro, isEditMode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!usuario) {
      alert("Faça login para " + (isEditMode ? "editar" : "cadastrar") + " livros");
      return;
    }

    setLoading(true);

    try {
      if (isEditMode && livro) {
        
        const payload = {
          titulo,
          autor,
          genero_id,
          sinopse,
          capa_url,
          ano_publicacao: Number(ano),
        };

        await apiFetch(`/livros/${livro.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        alert("Livro atualizado com sucesso! ");
      } else {
        
        const payload: CriarLivroPayload = {
          titulo,
          autor,
          genero_id,
          sinopse,
          capa_url,
          ano_publicacao: Number(ano),
          cadastrado_por: usuario?.nome ?? "anonimo",
        };

        await apiFetch("/livros", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        alert("Livro cadastrado com sucesso!");
      }

      onSuccess();
      fechar();
    } catch (error) {
      console.error("Erro ao salvar livro:", error);
      alert("Erro ao " + (isEditMode ? "atualizar" : "cadastrar") + " livro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={fechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <form style={modalStyles} onSubmit={handleSubmit}>
          <h2>{isEditMode ? " Editar Livro" : "Novo Livro"}</h2>

          <input
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            disabled={loading}
          />

          <input
            placeholder="Autor"
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            required
            disabled={loading}
          />

          <select
            value={genero_id}
            onChange={(e) => setGenero(e.target.value)}
            required
            disabled={loading}
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
            disabled={loading}
          />

          <input
            type="number"
            placeholder="Ano de publicação"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            required
            disabled={loading}
          />

          <textarea
            placeholder="Sinopse"
            value={sinopse}
            onChange={(e) => setSinopse(e.target.value)}
            required
            disabled={loading}
            rows={4}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{
                backgroundColor: loading ? "#ccc" : (isEditMode ? "#f5a623" : "#28a745"),
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Salvando..." : (isEditMode ? "Atualizar" : "Salvar")}
            </button>

            <button type="button" onClick={fechar} disabled={loading}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const modalStyles = {
  background: "white",
  padding: 20,
  borderRadius: 8,
  display: "flex",
  flexDirection: "column" as const,
  gap: 10,
  minWidth: 300,
  maxWidth: 500,
  width: "100%",
};