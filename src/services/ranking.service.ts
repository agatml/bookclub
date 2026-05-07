
import { apiFetch } from "./api";

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

export async function getRanking(): Promise<RankingPorGenero[]> {
  try {
    const response = await apiFetch<any>("/ranking?limit=20");
    console.log("Ranking API response COMPLETO:", JSON.stringify(response, null, 2));


    if (Array.isArray(response) && response.length > 0) {

      if (response[0].genero_id !== undefined && response[0].livros !== undefined) {
        return response as RankingPorGenero[];
      }


      if (response[0]?.genero && response[0]?.livros) {
        const rankingAgrupado: RankingPorGenero[] = response.map((generoItem: any, indexGenero: number) => {
          const livrosRanking: LivroRanking[] = (generoItem.livros || [])
            .map((item: any, index: number) => ({
              id: item.livro?.id || item.id,
              titulo: item.livro?.titulo || item.titulo,
              autor: item.livro?.autor || item.autor,
              capa_url: item.livro?.capa_url || item.capa_url,
              total_votos: item.total || item.total_votos || 0,
              posicao: index + 1
            }))
            .filter((livro: LivroRanking) => livro.id && livro.titulo);

          return {
            genero_id: generoItem.genero?.id || generoItem.genero_id,
            genero_nome: generoItem.genero?.nome || generoItem.genero_nome || "Sem gênero",
            livros: livrosRanking
          };
        });

        console.log("Ranking agrupado por gênero:", rankingAgrupado);
        return rankingAgrupado;
      }


      const livrosPlanos = response.filter((item: any) => item.id && item.titulo);

      if (livrosPlanos.length > 0) {

        const grupos = new Map<string, RankingPorGenero>();

        for (const livro of livrosPlanos) {
          const generoId = livro.genero_id || livro.genero?.id || "outros";
          const generoNome = livro.genero_nome || livro.genero?.nome || "Outros gêneros";

          if (!grupos.has(generoId)) {
            grupos.set(generoId, {
              genero_id: generoId,
              genero_nome: generoNome,
              livros: []
            });
          }

          grupos.get(generoId)!.livros.push({
            id: livro.id,
            titulo: livro.titulo,
            autor: livro.autor,
            capa_url: livro.capa_url,
            total_votos: livro.total_votos || 0,
            posicao: 0
          });
        }


        const resultado: RankingPorGenero[] = Array.from(grupos.values());

        for (const genero of resultado) {
          genero.livros.sort((a, b) => b.total_votos - a.total_votos);
          genero.livros.forEach((livro, idx) => {
            livro.posicao = idx + 1;
          });
        }


        resultado.sort((a, b) => {
          const aMaxVotos = a.livros[0]?.total_votos || 0;
          const bMaxVotos = b.livros[0]?.total_votos || 0;
          return bMaxVotos - aMaxVotos;
        });

        console.log("Ranking agrupado a partir de lista plana:", resultado);
        return resultado;
      }
    }

    return [];
  } catch (error) {
    console.error("Erro no ranking:", error);
    return [];
  }
}