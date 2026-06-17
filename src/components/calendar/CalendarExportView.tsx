'use client';
import { CalendarEvent } from '@/types';
import { getColor } from '@/lib/colors';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAYS = ['SEG','TER','QUA','QUI','SEX','SÁB','DOM'];

function fd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

type Props = {
  date: Date;
  events: CalendarEvent[];
};

export function CalendarExportView({ date, events }: Props) {
  const y = date.getFullYear(), m = date.getMonth();
  const first = new Date(y, m, 1);
  let dow = first.getDay(); dow = dow === 0 ? 6 : dow - 1;
  const start = new Date(y, m, 1 - dow);

  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const ds = fd(d);
    const inMo = d.getMonth() === m;
    const dayEvs = inMo ? events.filter(e => e.data === ds) : [];
    return { ds, day: d.getDate(), inMo, dayEvs };
  });

  // Remove last row if empty
  const rows = [];
  for (let r = 0; r < 6; r++) {
    const row = cells.slice(r * 7, r * 7 + 7);
    if (row.some(c => c.inMo)) rows.push(row);
  }

  return (
    <div style={{
      width: 1400,
      background: '#fff',
      fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '32px 32px 40px',
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, paddingBottom: 20, borderBottom: '2px solid #E5E7EB' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-azul.png" alt="Logo" style={{ width: 64, height: 64, borderRadius: 12 }} />
          <div>
            <div style={{ fontSize: 13, color: '#9AA3B5', fontWeight: 400 }}>Casa Apostólica</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1B2230' }}>Voz para as Nações</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#101828' }}>{MONTHS[m]}</div>
          <div style={{ fontSize: 16, color: '#9AA3B5', fontWeight: 400 }}>{y}</div>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 0', background: '#F7F9FC', borderRadius: 4 }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {row.map(cell => (
              <div
                key={cell.ds}
                style={{
                  minHeight: 110,
                  background: cell.inMo ? '#fff' : '#FAFBFD',
                  border: `1px solid ${cell.inMo ? '#E5E7EB' : '#F0F2F5'}`,
                  borderRadius: 6,
                  padding: '7px 7px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 5,
                }}
              >
                {/* Day number */}
                <div style={{
                  fontSize: 13,
                  fontWeight: cell.inMo ? 600 : 400,
                  color: cell.inMo ? '#374151' : '#C4C9D4',
                  marginBottom: 3,
                  lineHeight: 1,
                }}>{cell.day}</div>

                {/* Events */}
                {cell.dayEvs.map(ev => {
                  const cl = getColor(ev.cor);
                  const hora = ev.hora ? ev.hora.slice(0, 5) : '';
                  const adoracaoNomes = [ev.adoracao?.responsavel, ...(ev.adoracao?.membros ?? [])].filter(Boolean).join(', ');
                  const organizacaoNomes = [ev.organizacao?.responsavel, ...(ev.organizacao?.membros ?? [])].filter(Boolean).join(', ');
                  return (
                    <div
                      key={ev.id}
                      style={{
                        background: cl.bg,
                        borderLeft: `3px solid ${cl.dot}`,
                        borderRadius: 4,
                        padding: '6px 8px',
                        fontSize: 11,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      {/* Nome — sem ícone, negrito */}
                      <div style={{ fontWeight: 700, color: cl.text, lineHeight: 1.3 }}>
                        {ev.nome}
                      </div>
                      {/* Horário */}
                      {hora && (
                        <div style={{ color: cl.text, opacity: 0.85 }}>
                          <span style={{ opacity: 0.55, fontWeight: 500 }}>Horário: </span>{hora}
                        </div>
                      )}
                      {/* Pastor */}
                      {ev.pastor && (
                        <div style={{ color: cl.text, opacity: 0.85 }}>
                          <span style={{ opacity: 0.55, fontWeight: 500 }}>Pastor: </span>{ev.pastor}
                        </div>
                      )}
                      {/* Responsável (atividades) */}
                      {ev.responsavel && !ev.pastor && (
                        <div style={{ color: cl.text, opacity: 0.85 }}>
                          <span style={{ opacity: 0.55, fontWeight: 500 }}>Responsável: </span>{ev.responsavel}
                        </div>
                      )}
                      {/* Adoração */}
                      {adoracaoNomes && (
                        <div style={{ color: cl.text, opacity: 0.85 }}>
                          <span style={{ opacity: 0.55, fontWeight: 500 }}>Adoração: </span>{adoracaoNomes}
                        </div>
                      )}
                      {/* Organização */}
                      {organizacaoNomes && (
                        <div style={{ color: cl.text, opacity: 0.85 }}>
                          <span style={{ opacity: 0.55, fontWeight: 500 }}>Organização: </span>{organizacaoNomes}
                        </div>
                      )}
                      {/* Equipe */}
                      {(ev.equipe?.length ?? 0) > 0 && (
                        <div style={{ color: cl.text, opacity: 0.8 }}>
                          <span style={{ opacity: 0.55, fontWeight: 500 }}>Equipe: </span>{ev.equipe!.join(', ')}
                        </div>
                      )}
                      {/* Observação */}
                      {ev.observacao && (
                        <div style={{ color: cl.text, opacity: 0.65, fontStyle: 'italic' }}>
                          {ev.observacao}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: '#C4C9D4' }}>Casa Apostólica Voz para as Nações — Escala {MONTHS[m]} {y}</div>
        <div style={{ fontSize: 11, color: '#C4C9D4' }}>{events.filter(e => { const [ey, em] = e.data.split('-').map(Number); return ey === y && em === m + 1; }).length} evento(s) no mês</div>
      </div>
    </div>
  );
}
