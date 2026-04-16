"use client";

export default function Error({
    error,
    reset,
}: {
    error:Error;
    reset:() => void;
}) {
    return (
        <main style={{padding: 20}}>
            <h2>❌ Algo deu errado</h2>
            <p>{error.message}</p>

            <button onClick={() => reset()}>
                Tentar novamente
            </button>
        </main>
    );
}