import { apiFetch } from "./api";
import { Usuario } from "@/types/usuario";

export async function buscarUsuario(id: string) {
  return apiFetch<Usuario>(`/usuarios/${id}`);
}

export async function verificarUsuarioExistente(id: string): Promise<Usuario | null> {
  try {
    const usuario = await apiFetch<Usuario>(`/usuarios/${id}`);
    return usuario;
  } catch (error) {
    console.error("Usuário não encontrado ou erro na API:", error);
    return null;
  }
}