'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function fd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

type HeaderProps = {
  onAddEvent?: () => void;
  onAddPerson?: () => void;
  onAddTeam?: () => void;
};

export function Header({ onAddEvent, onAddPerson, onAddTeam }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const page = pathname.split('/')[1] ?? 'home';

  const viewParam = params.get('view') ?? 'mes';
  const dateParam = params.get('date');
  const currentDate = dateParam ? new Date(dateParam + 'T12:00:00') : new Date(2026, 5, 15);

  const periodLabel = () => {
    const y = currentDate.getFullYear(), m = currentDate.getMonth();
    if (viewParam === 'mes') return `${MONTHS[m]}, ${y}`;
    if (viewParam === 'semana') {
      const ws = weekStart(currentDate);
      const we = new Date(ws); we.setDate(ws.getDate() + 6);
      if (ws.getMonth() === we.getMonth()) return `${ws.getDate()}–${we.getDate()} de ${MONTHS[m]} ${y}`;
      return `${ws.getDate()} ${MONTHS[ws.getMonth()].slice(0,3)} – ${we.getDate()} ${MONTHS[we.getMonth()].slice(0,3)} ${y}`;
    }
    return `${currentDate.getDate()} de ${MONTHS[m]} ${y}`;
  };

  function weekStart(d: Date) {
    const r = new Date(d); let dw = r.getDay(); dw = dw === 0 ? 6 : dw - 1; r.setDate(r.getDate() - dw); return r;
  }

  const titles: Record<string, string> = {
    home: 'Home',
    calendario: periodLabel(),
    pessoas: 'Pessoas',
    organizacao: 'Organização',
    louvor: 'Louvor',
    relatorios: 'Relatórios',
  };

  const setParam = (key: string, val: string) => {
    const p = new URLSearchParams(params.toString());
    p.set(key, val);
    router.push(`/${page}?${p.toString()}`);
  };

  const navDate = (dir: number) => {
    const d = new Date(currentDate);
    if (viewParam === 'mes') d.setMonth(d.getMonth() + dir);
    else if (viewParam === 'semana') d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setParam('date', fd(d));
  };

  const viewBtn = (v: string, lbl: string) => (
    <button
      key={v}
      onClick={() => setParam('view', v)}
      style={{
        padding: '5px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
        fontSize: 13, fontWeight: 600, background: viewParam === v ? '#fff' : 'transparent',
        color: viewParam === v ? '#101828' : '#6B7280',
        boxShadow: viewParam === v ? '0 1px 3px rgba(16,24,40,0.10)' : 'none',
        transition: 'all 0.15s',
      }}
    >{lbl}</button>
  );

  return (
    <header style={{
      background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '0 20px 0 24px',
      height: 60, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
    }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#101828', letterSpacing: '-0.02em', flexShrink: 0, whiteSpace: 'nowrap' }}>
        {titles[page] ?? page}
      </div>
      <div style={{ flex: 1 }} />

      {page === 'calendario' && (
        <div style={{ display: 'flex', background: '#EEF1F6', borderRadius: 999, padding: 3, gap: 1 }}>
          {viewBtn('mes', 'Mês')}{viewBtn('semana', 'Semana')}{viewBtn('dia', 'Dia')}
        </div>
      )}

      {page === 'calendario' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={() => navDate(-1)} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#374151', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <button onClick={() => setParam('date', fd(new Date(2026, 5, 15)))} style={{ padding: '5px 12px', borderRadius: 999, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#374151', fontSize: 13, fontWeight: 600 }}>Hoje</button>
          <button onClick={() => navDate(1)} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#374151', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
        </div>
      )}

      {page === 'calendario' && (
        <button onClick={onAddEvent} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10, border: 'none', background: '#2E5AAC', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Adicionar
        </button>
      )}

      {page === 'pessoas' && (
        <button onClick={onAddPerson} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10, border: 'none', background: '#2E5AAC', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Membro
        </button>
      )}

      {page === 'organizacao' && (
        <button onClick={onAddTeam} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10, border: 'none', background: '#2E5AAC', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Equipe
        </button>
      )}
    </header>
  );
}
