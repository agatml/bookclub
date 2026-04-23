import { apiFetch } from "./api";

export async function getRanking() {
  try {
    const response = await apiFetch<any>("/ranking?limit=20");
    console.log("Ranking API response COMPLETO:", JSON.stringify(response, null, 2));
    
   
    if (Array.isArray(response)) {
      
      const todosLivros = [];
      
      for (const genero of response) {
        if (genero.livros && Array.isArray(genero.livros)) {
          for (const item of genero.livros) {
            if (item.livro) {
              todosLivros.push({
                id: item.livro.id,
                titulo: item.livro.titulo,
                autor: item.livro.autor,
                capa_url: item.livro.capa_url,
                total_votos: item.total || 0,
                genero_id: genero.genero?.id,
                genero_nome: genero.genero?.nome,
                media_notas: item.media || 0
              });
            }
          }
        }
      }
      
      
      todosLivros.sort((a, b) => b.total_votos - a.total_votos);
      
      console.log("Livros extraídos do ranking:", todosLivros);
      return todosLivros;
    }
    
    return [];
  } catch (error) {
    console.error("Erro no ranking:", error);
    return [];
  }
}