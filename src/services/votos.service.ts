import { apiFetch } from "./api";
import { Livro } from "@/types/livros";
import { CriarVotoPayload } from "@/types/requests";

export function getLivroDoMes() {
  return apiFetch<Livro>("/votos/mes-atual");
}

export function getVotoUsuario(usuarioId: string) {
  return apiFetch(`/votos/usuario/${usuarioId}`);
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