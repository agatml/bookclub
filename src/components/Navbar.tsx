"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();

  
  const rotasSemNavbar = ["/"];

  
  if (rotasSemNavbar.includes(pathname)) {
    return null;
  }

  return (
     <aside className={styles.sidebar}>
      <h1 className={styles.logo}>BookClub</h1>

      <nav className={styles.nav}>
        <a href="/">Home</a>
        <a href="/catalogo">Catálogo</a>
      </nav>
    </aside>
  );
}