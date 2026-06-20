'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, padding: 24 }}>
      <p style={{ color: '#374151', fontSize: 14 }}>Algo deu errado: {error.message}</p>
      <button
        onClick={reset}
        style={{ padding: '7px 18px', borderRadius: 8, border: 'none', background: '#2E5AAC', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
      >
        Tentar novamente
      </button>
    </div>
  );
}
