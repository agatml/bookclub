// hooks/useVotoMes.ts
import { useState, useEffect } from "react";
import { getVotoUsuario } from "@/services/votos.service";

const STORAGE_KEY = "voto-do-mes";

export function useVotoMes(livroId: string | undefined, usuarioId: string | undefined) {
  const [jaVotou, setJaVotou] = useState(false);
  const [votoConfirmado, setVotoConfirmado] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar localStorage e backend
  useEffect(() => {
    async function verificarVoto() {
      if (!livroId || !usuarioId) {
        setLoading(false);
        return;
      }

      // 1. Primeiro, verificar no localStorage
      const votoSalvo = localStorage.getItem(STORAGE_KEY);
      
      if (votoSalvo === livroId) {
        // Usuário já votou neste livro (pelo localStorage)
        setJaVotou(true);
        setLoading(false);
        return;
      }

      // 2. Fallback: verificar no backend (caso o localStorage esteja vazio ou diferente)
      try {
        const votos = await getVotoUsuario(usuarioId);
        const votouNoBackend = Array.isArray(votos) 
          ? votos.some(voto => voto.livro_id === livroId)
          : false;
        
        if (votouNoBackend) {
          // Sincronizar com localStorage
          localStorage.setItem(STORAGE_KEY, livroId);
          setJaVotou(true);
        } else {
          setJaVotou(false);
        }
      } catch (error) {
        console.error("Erro ao verificar voto no backend:", error);
        // Em caso de erro, confiar apenas no localStorage
        setJaVotou(votoSalvo === livroId);
      } finally {
        setLoading(false);
      }
    }

    verificarVoto();
  }, [livroId, usuarioId]);

  // Função para registrar o voto
  const registrarVoto = async (votarFn: () => Promise<void>) => {
    if (!livroId) return false;

    try {
     
      await votarFn();
      
      
      localStorage.setItem(STORAGE_KEY, livroId);
      setJaVotou(true);
      setVotoConfirmado(true);
      
      return true;
    } catch (error) {
      console.error("Erro ao registrar voto:", error);
      return false;
    }
  };

  return { jaVotou, votoConfirmado, loading, registrarVoto };
}