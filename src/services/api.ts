const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {

  if (endpoint.startsWith("/api")) {
    console.warn("Não inclua /api/v1 no endpoint:", endpoint);
  }

  const response = await fetch(
    `${API_URL}/api/v1${endpoint}`,
    {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY!,
        ...options.headers,
      },
      ...options,
    }
  );

  if (!response.ok) {
    const erro = await response.text();
    console.error("ERRO API:", erro);
    throw new Error(`Erro ${response.status}`);
  }

  return response.json();
}