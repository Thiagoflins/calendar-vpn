'use client';
import { Suspense } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

type Props = {
  children: React.ReactNode;
  onAddEvent?: () => void;
  onAddPerson?: () => void;
  onAddTeam?: () => void;
};

export function AppShell({ children, onAddEvent, onAddPerson, onAddTeam }: Props) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F7F9FC', color: '#101828', fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Suspense fallback={<div style={{ height: 60, background: '#fff', borderBottom: '1px solid #E5E7EB' }} />}>
          <Header onAddEvent={onAddEvent} onAddPerson={onAddPerson} onAddTeam={onAddTeam} />
        </Suspense>
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
