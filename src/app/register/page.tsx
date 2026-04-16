"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/services/api";
import { Usuario } from "@/types/usuario";
import { useUser } from "@/contexts/UserContext";

export default function RegisterPage() {
  const router = useRouter();
const { login } = useUser();
  const [nome, setNome] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    try {
      const user = await apiFetch<Usuario>("/usuarios", {
        method: "POST",
        body: JSON.stringify({
          nome,
          avatar_url: avatarUrl || null,
        }),
      });;


      login(user);;

      alert("Usuário criado!");
      router.push("/");

    } catch (error) {
      console.error("ERRO COMPLETO:", error);
      alert("Erro ao criar usuário");

    }
  }

  return (
    <main>
      <h1>Criar usuário</h1>

      <form onSubmit={handleRegister}>
        <input
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <input
          placeholder="URL do avatar (opcional)"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
        />

        <button type="submit">
          Criar conta
        </button>
      </form>
    </main>
  );
}