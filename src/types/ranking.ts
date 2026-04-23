export interface RankingPorGenero {
  genero_id: string;
  genero_nome: string;
  livros: LivroRanking[];
}

export interface LivroRanking {
  id: string;
  titulo: string;
  autor: string;
  capa_url: string;
  total_votos: number;
  posicao: number;
}