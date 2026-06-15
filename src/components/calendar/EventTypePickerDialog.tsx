'use client';

type Props = {
  onClose: () => void;
  onPick: (type: 'culto' | 'atividade') => void;
};

const TYPES = [
  { type: 'culto' as const, icon: '⛪', title: 'Culto', desc: 'Culto regular, vigília, especial' },
  { type: 'atividade' as const, icon: '📅', title: 'Atividade', desc: 'Reuniões e eventos ministeriais' },
];

export function EventTypePickerDialog({ onClose, onPick }: Props) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(16,24,40,0.35)', backdropFilter: 'blur(4px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 16px 48px rgba(16,24,40,0.16)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#101828', margin: 0 }}>Novo Evento</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#9AA3B5', padding: 4, borderRadius: 8 }}>×</button>
        </div>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>Que tipo de evento deseja criar?</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {TYPES.map(c => (
            <button
              key={c.type}
              onClick={() => onPick(c.type)}
              style={{ background: '#F7F9FC', border: '2px solid #E5E7EB', borderRadius: 16, padding: '22px 14px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#2E5AAC'; (e.currentTarget as HTMLButtonElement).style.background = '#F0F7FE'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLButtonElement).style.background = '#F7F9FC'; }}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>{c.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#101828', marginBottom: 4 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: '#6B7280', lineHeight: '1.4' }}>{c.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
