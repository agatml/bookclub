import { Livro } from "@/types/livros";
import Link from "next/link";
import styles from "./BookCard.module.css";

type Props = {
  livro: Livro;
  generoNome?: string;
};

export default function BookCard({ livro, generoNome }: Props) {
  return (
    <Link href={`/livros/${livro.id}`}>
      <div className={styles.card} style={{ cursor: "pointer" }}>
        <img src={livro.capa_url} alt={livro.titulo} />

        <h3>{livro.titulo}</h3>
        <p>{livro.autor}</p>

        <p>{generoNome ?? livro.genero?.nome}</p>
      </div>
    </Link>
  );
}