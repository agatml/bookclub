export interface Genero {
  id: string;
  nome: string;
  descricao?: string;
}

export interface Livro {
  id: string;
  titulo: string;
  autor: string;
  genero: Genero;
  capa_url: string;
  ano_publicacao: number;
  media_avaliacoes?: number;
  total_avaliacoes?: number;
  votos_mes?: number;
}