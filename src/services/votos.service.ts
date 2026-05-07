
import { apiFetch } from "./api";
import { Livro } from "@/types/livros";
import { CriarVotoPayload } from "@/types/requests";

export interface Voto {
  id: string;
  livro_id: string;
  usuario_id: string;
  criado_em: string;
  livro?: Livro;
}

export interface LivroDoMesResponse {
  livro: Livro;
  total_votos: number;
}

export function getLivroDoMes() {
  return apiFetch<LivroDoMesResponse>("/votos/mes-atual");
}

export function getVotoUsuario(usuarioId: string) {
  return apiFetch<Voto[]>(`/votos/usuario/${usuarioId}`);
}

export async function votar(usuario_id: string, livro_id: string) {
  const payload: CriarVotoPayload = {
    livro_id,
    usuario_id,
  };

  return apiFetch("/votos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getVotosDoLivroSeForLivroDoMes(livroId: string): Promise<{ isLivroDoMes: boolean; totalVotos: number }> {
  try {
    const livroDoMes = await getLivroDoMes();

    if (livroDoMes && livroDoMes.livro && livroDoMes.livro.id === livroId) {
      return {
        isLivroDoMes: true,
        totalVotos: livroDoMes.total_votos || 0
      };
    }

    return {
      isLivroDoMes: false,
      totalVotos: 0
    };
  } catch (error) {
    console.error("Erro ao verificar livro do mês:", error);
    return {
      isLivroDoMes: false,
      totalVotos: 0
    };
  }
}


export function limparVotoLocalStorage() {
  localStorage.removeItem("voto-do-mes");
}


export function getVotoLocalStorage(): string | null {
  return localStorage.getItem("voto-do-mes");
}