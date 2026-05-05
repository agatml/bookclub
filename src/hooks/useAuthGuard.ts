
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

      if (loading) return;


      if (!usuario) {
        router.replace("/");
        setVerificando(false);
        return;
      }

      const usuarioExistente = await verificarUsuarioExistente(usuario.id);

      if (!usuarioExistente) {

        console.warn("Usuário inválido ou deletado da API");
        logout();
        router.replace("/");
      } else {

        setVerificando(false);
      }
    }

    verificarAcesso();
  }, [usuario, loading, router, logout]);

  return { verificando, usuario };
}