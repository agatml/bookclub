
import { apiFetch } from "./api";
import { Livro } from "@/types/livros";

type VotoPayload = {
  usuario_id: string;
  livro_id: string;
  valor: number;
};


export function getLivroDoMes() {
  return apiFetch<Livro>("/votos/mes-atual");
}


export function getVotoUsuario(usuarioId: string) {
  return apiFetch(`/votos/usuario/${usuarioId}`);
}


export function votarLivro(payload: VotoPayload) {
  return apiFetch("/votos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type VotoResponse = {
  mensagem: string;
};

export async function votar(
  usuario_id: string,
  livro_id: string
) {
  return apiFetch<VotoResponse>("/votos", {
    method: "POST",
    body: JSON.stringify({
      usuario_id,
      livro_id,
    }),
  });
}