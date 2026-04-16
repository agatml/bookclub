import {apiFetch} from "./api";
import { Livro } from "@/types/livros";

export function getLivros() {
    return apiFetch<Livro[]>("/livros");
}