// hooks/useAuthGuard.ts
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { verificarUsuarioExistente } from "@/services/usuarios.service";

export function useAuthGuard() {
  const { usuario, loading, logout } = useUser();
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    async function verificarAcesso() {
      // Se ainda está carregando o contexto, aguarda
      if (loading) return;

      // Se não tem usuário no contexto, redireciona
      if (!usuario) {
        router.replace("/");
        setVerificando(false);
        return;
      }

      // Verifica se o usuário realmente existe na API
      const usuarioExistente = await verificarUsuarioExistente(usuario.id);

      if (!usuarioExistente) {
        // Usuário não existe mais na API, faz logout e redireciona
        console.warn("Usuário inválido ou deletado da API");
        logout();
        router.replace("/");
      } else {
        // Usuário válido, pode acessar
        setVerificando(false);
      }
    }

    verificarAcesso();
  }, [usuario, loading, router, logout]);

  return { verificando, usuario };
}