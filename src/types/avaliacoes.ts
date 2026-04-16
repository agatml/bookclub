export type Avaliacao = {
  id: string;
  nota: number;
  comentario: string;
  livro_id: string;
  usuario_id: string;
  criado_em: string;
  usuario: {
    id: string;
    nome: string;
    avatar_url: string;
  };
};