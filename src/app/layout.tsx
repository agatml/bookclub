import Navbar from "@/components/Navbar";
import { UserProvider } from "@/contexts/UserContext";
import "@/styles/globals.css";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>
        <UserProvider>
          <div className="layout">
            <Navbar />
            <main className="content">{children}</main>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}