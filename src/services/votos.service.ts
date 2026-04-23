import { apiFetch } from "./api";
import { Livro } from "@/types/livros";

export function getLivroDoMes() {
  return apiFetch<Livro>("/votos/mes-atual");
}

export function getVotoUsuario(usuarioId: string) {
  return apiFetch(`/votos/usuario/${usuarioId}`);
}


export async function votar(usuario_id: string, livro_id: string) {
  return apiFetch("/votos", {
    method: "POST",
    body: JSON.stringify({
      livro_id: livro_id,  
      usuario_id: usuario_id,  
    }),
  });
}