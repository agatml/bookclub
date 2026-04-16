
import { apiFetch } from "./api";
import { Livro } from "@/types/livros";


export function getFeed() {
  return apiFetch<Livro[]>("/feed");
}