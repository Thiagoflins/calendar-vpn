'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useIsMobile } from '@/hooks/useIsMobile';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function fd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

type HeaderProps = {
  onAddEvent?: () => void;
  onAddPerson?: () => void;
  onAddTeam?: () => void;
};

export function Header({ onAddEvent }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const page = pathname.split('/')[1] ?? 'home';
  const isMobile = useIsMobile();

  const viewParam = params.get('view') ?? 'mes';
  const dateParam = params.get('date');
  const currentDate = dateParam ? new Date(dateParam + 'T12:00:00') : new Date();

  function weekStart(d: Date) {
    const r = new Date(d); let dw = r.getDay(); dw = dw === 0 ? 6 : dw - 1; r.setDate(r.getDate() - dw); return r;
  }

  const periodLabel = () => {
    const y = currentDate.getFullYear(), m = currentDate.getMonth();
    if (viewParam === 'mes') return isMobile ? `${MONTHS[m].slice(0,3)} ${y}` : `${MONTHS[m]}, ${y}`;
    if (viewParam === 'semana') {
      const ws = weekStart(currentDate);
      const we = new Date(ws); we.setDate(ws.getDate() + 6);
      if (isMobile) return `${ws.getDate()}–${we.getDate()} ${MONTHS[m].slice(0,3)}`;
      if (ws.getMonth() === we.getMonth()) return `${ws.getDate()}–${we.getDate()} de ${MONTHS[m]} ${y}`;
      return `${ws.getDate()} ${MONTHS[ws.getMonth()].slice(0,3)} – ${we.getDate()} ${MONTHS[we.getMonth()].slice(0,3)} ${y}`;
    }
    return `${currentDate.getDate()} de ${MONTHS[m]}${isMobile ? '' : ` ${y}`}`;
  };

  const titles: Record<string, string> = {
    home: 'Home',
    calendario: periodLabel(),
    pessoas: 'Pessoas',
    organizacao: 'Organização',
    louvor: 'Louvor',
    relatorios: 'Relatórios',
    conta: 'Minha Conta',
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
        padding: isMobile ? '4px 10px' : '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
        fontSize: isMobile ? 12 : 13, fontWeight: viewParam === v ? 500 : 400,
        background: viewParam === v ? '#fff' : 'transparent',
        color: viewParam === v ? '#101828' : '#6B7280',
        boxShadow: viewParam === v ? '0 1px 3px rgba(16,24,40,0.10)' : 'none',
        transition: 'all 0.15s', whiteSpace: 'nowrap',
      }}
    >{lbl}</button>
  );

  return (
    <header style={{
      background: '#fff', borderBottom: '1px solid #E5E7EB',
      padding: isMobile ? '0 12px' : '0 20px 0 24px',
      height: isMobile ? 52 : 60,
      display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 12,
      flexShrink: 0, boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
    }}>
      <div style={{ fontSize: isMobile ? 17 : 22, fontWeight: 600, color: '#101828', letterSpacing: '-0.01em', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: isMobile ? 140 : 'none' }}>
        {titles[page] ?? page}
      </div>
      <div style={{ flex: 1 }} />

      {page === 'calendario' && (
        <div style={{ display: 'flex', background: '#EEF1F6', borderRadius: 6, padding: isMobile ? 2 : 3, gap: 1 }}>
          {viewBtn('mes', 'Mês')}{viewBtn('semana', isMobile ? 'Sem' : 'Semana')}{viewBtn('dia', 'Dia')}
        </div>
      )}

      {page === 'calendario' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 2 : 4 }}>
          <button onClick={() => navDate(-1)} style={{ width: isMobile ? 26 : 30, height: isMobile ? 26 : 30, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#374151', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          {!isMobile && <button onClick={() => setParam('date', fd(new Date()))} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#374151', fontSize: 13 }}>Hoje</button>}
          <button onClick={() => navDate(1)} style={{ width: isMobile ? 26 : 30, height: isMobile ? 26 : 30, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#374151', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
        </div>
      )}

      {page === 'calendario' && !isMobile && (
        <button onClick={onAddEvent} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 6, border: 'none', background: '#2E5AAC', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Adicionar
        </button>
      )}
    </header>
  );
}
