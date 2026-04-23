// contexts/UserContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Usuario } from "@/types/usuario";
import { verificarUsuarioExistente } from "@/services/usuarios.service";

interface UserContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (usuario: Usuario) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function validarUsuarioStorage() {
      const storedUser = localStorage.getItem("usuario");

      if (!storedUser) {
        setLoading(false);
        return;
      }

      try {
        const user = JSON.parse(storedUser);
        
        // Valida se o usuário ainda existe na API
        const usuarioExistente = await verificarUsuarioExistente(user.id);
        
        if (usuarioExistente) {
          setUsuario(usuarioExistente);
          // Atualiza o localStorage com dados mais recentes
          localStorage.setItem("usuario", JSON.stringify(usuarioExistente));
        } else {
          // Usuário inválido, limpa localStorage
          localStorage.removeItem("usuario");
          setUsuario(null);
        }
      } catch (error) {
        console.error("Erro ao validar usuário:", error);
        localStorage.removeItem("usuario");
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    }

    validarUsuarioStorage();
  }, []);

  function login(user: Usuario) {
    localStorage.setItem("usuario", JSON.stringify(user));
    setUsuario(user);
  }

  function logout() {
    localStorage.removeItem("usuario");
    setUsuario(null);
  }

  return (
    <UserContext.Provider value={{ usuario, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser usado dentro do UserProvider");
  }
  return context;
}