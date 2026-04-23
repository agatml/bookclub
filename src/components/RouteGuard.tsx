// components/RouteGuard.tsx
"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { verificando } = useAuthGuard();

  if (verificando) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <p>Verificando acesso...</p>
      </div>
    );
  }

  return <>{children}</>;
}