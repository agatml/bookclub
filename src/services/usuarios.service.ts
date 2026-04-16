import { apiFetch } from "./api";
import { Usuario } from "@/types/usuario";

export async function buscarUsuario(id: string) {
  return apiFetch<Usuario>(`/usuarios/${id}`);
}