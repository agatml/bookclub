
"use client";

import { Livro } from "@/types/livros";
import Link from "next/link";
import styles from "./BookCard.module.css";

type Props = {
  livro: Livro;
  generoNome?: string;
  onEdit?: (livro: Livro) => void;  
};

export default function BookCard({ livro, generoNome, onEdit }: Props) {
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (onEdit) {
      onEdit(livro);
    }
  };

  return (
    <div className={styles.cardContainer}>
      <Link href={`/livros/${livro.id}`}>
        <div className={styles.card} style={{ cursor: "pointer" }}>
          <img src={livro.capa_url} alt={livro.titulo} />
          <h3>{livro.titulo}</h3>
          <p>{livro.autor}</p>
          <p>{generoNome ?? livro.genero?.nome}</p>
        </div>
      </Link>
      
      {onEdit && (
        <button 
          onClick={handleEditClick}
          className={styles.editButton}
          title="Editar livro"
        >
          
        </button>
      )}
    </div>
  );
}