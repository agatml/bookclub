
import { apiFetch } from "./api";
import { Livro } from "@/types/livros";


export function getRanking() {
  return apiFetch<Livro[]>("/ranking");
}