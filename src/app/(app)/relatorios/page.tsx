'use client';
import { AppShell } from '@/components/layout/AppShell';

export default function RelatoriosPage() {
  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40, textAlign: 'center', minHeight: 400 }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>📊</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#101828', margin: '0 0 8px' }}>Relatórios</h2>
        <p style={{ fontSize: 15, color: '#6B7280', maxWidth: 340, margin: '0 0 20px', lineHeight: '1.5' }}>
          Relatórios detalhados de presença, eventos e equipes.
        </p>
        <span style={{ padding: '5px 16px', borderRadius: 999, background: '#E6F1FB', color: '#2E5AAC', fontSize: 13, fontWeight: 600 }}>Em breve</span>
      </div>
    </AppShell>
  );
}
