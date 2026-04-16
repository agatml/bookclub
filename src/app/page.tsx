"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "@/styles/globals.css";

import { apiFetch } from "@/services/api";
import { Usuario } from "@/types/usuario";
import { useUser } from "@/contexts/UserContext";

export default function RegisterPage() {
  const [nome, setNome] = useState("");
  const router = useRouter();
  const { usuario, login, loading } = useUser();


  useEffect(() => {
    if (loading) return;

    if (usuario) {
      router.replace("/homepage");
    }
  }, [usuario, loading, router]);


  if (loading) return null;

  async function handleRegister(e: React.FormEvent) {
  e.preventDefault();

  if (!nome.trim()) return;

  try {
    const novoUsuario = await apiFetch<Usuario>("/usuarios", {
      method: "POST",
      body: JSON.stringify({
        nome,
        avatar_url: null,
      }),
    });

    await login(novoUsuario);

  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao criar usuário");
  }
}

  return (
    <main
      style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form
        onSubmit={handleRegister}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "280px",
        }}
      >
        <h1 style={{ display: "flex", justifyContent: "center" }}>
          BookClub
        </h1>

        <input
          type="text"
          placeholder="Informe seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <button type="submit">Entrar</button>
      </form>
    </main>
  );
}