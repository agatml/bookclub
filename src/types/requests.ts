export interface CriarUsuarioPayload {
    nome: string;
    avatar_url: string | null;
}

export interface CriarLivroPayload {
    titulo: string;
    autor: string;
    genero_id: string;
    sinopse: string;
    capa_url: string;
    ano_publicacao: number;
    cadastrado_por: string;
}

export interface CriarGeneroPayload {
    nome: string;
    descricao: string;
}

export interface CriarAvaliacaoPayload {
    nota: number;
    comentario: string;
    usuario_id: string;
}

export interface CriarVotoPayload {
    livro_id: string;
    usuario_id: string;
}