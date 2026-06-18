'use client';

type Props = {
  onClose: () => void;
  onPick: (type: 'culto' | 'atividade') => void;
};


const TYPES = [
  {
    type: 'culto' as const,
    title: 'Culto',
    desc: 'Culto regular, vigília, especial',
    accent: '#2E5AAC',
    accentBg: '#EEF2FF',
  },
  {
    type: 'atividade' as const,
    title: 'Atividade',
    desc: 'Reuniões e eventos ministeriais',
    accent: '#1D9E75',
    accentBg: '#F0FBF6',
  },
];

export function EventTypePickerDialog({ onClose, onPick }: Props) {
  return (
    <div
      onClick={onClose}
      className="vpn-modal-bg"
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(16,24,40,0.45)', backdropFilter: 'blur(6px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="vpn-modal"
        style={{ background: '#fff', borderRadius: 12, padding: '28px 28px 24px', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(16,24,40,0.18)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="4" width="16" height="14" rx="2.5" fill="#2E5AAC" opacity="0.15" />
                <rect x="2" y="4" width="16" height="14" rx="2.5" stroke="#2E5AAC" strokeWidth="1.5" />
                <rect x="2" y="7.5" width="16" height="1.5" fill="#2E5AAC" />
                <rect x="5.5" y="2" width="2" height="4" rx="1" fill="#2E5AAC" />
                <rect x="12.5" y="2" width="2" height="4" rx="1" fill="#2E5AAC" />
                <rect x="5" y="11" width="2.5" height="2.5" rx="0.75" fill="#2E5AAC" opacity="0.7" />
                <rect x="8.75" y="11" width="2.5" height="2.5" rx="0.75" fill="#2E5AAC" opacity="0.4" />
                <rect x="12.5" y="11" width="2.5" height="2.5" rx="0.75" fill="#2E5AAC" opacity="0.4" />
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#101828', margin: 0 }}>Novo Evento</h2>
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6', border: 'none', cursor: 'pointer', fontSize: 18, color: '#6B7280', borderRadius: 8, lineHeight: 1 }}
          >×</button>
        </div>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 22, margin: '6px 0 22px' }}>Que tipo de evento deseja criar?</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {TYPES.map(c => (
            <button
              key={c.type}
              onClick={() => onPick(c.type)}
              style={{
                background: '#FAFBFC',
                border: '1.5px solid #E5E7EB',
                borderRadius: 18,
                padding: '26px 16px 20px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.18s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0,
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.borderColor = c.accent;
                el.style.background = c.accentBg;
                el.style.transform = 'translateY(-2px)';
                el.style.boxShadow = `0 8px 24px ${c.accent}22`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.borderColor = '#E5E7EB';
                el.style.background = '#FAFBFC';
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: '#101828', marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: '#6B7280', lineHeight: '1.45' }}>{c.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
