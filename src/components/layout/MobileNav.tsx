'use client';
import { usePathname, useRouter } from 'next/navigation';

const IconHome = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
    <path d="M3 9.5L12 3L21 9.5V20C21 20.552 20.552 21 20 21H15V15H9V21H4C3.448 21 3 20.552 3 20V9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
    <path d="M8 2V5M16 2V5M3 8H21M5 4H19C20.105 4 21 4.895 21 6V19C21 20.105 20.105 21 19 21H5C3.895 21 3 20.105 3 19V6C3 4.895 3.895 4 5 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconPeople = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
    <path d="M17 21V19C17 16.791 15.209 15 13 15H5C2.791 15 1 16.791 1 19V21M23 21V19C22.999 17.153 21.765 15.537 20 15.09M16 3.13C17.769 3.579 19.006 5.198 19.006 7.05C19.006 8.902 17.769 10.521 16 10.97M9 11C11.209 11 13 9.209 13 7C13 4.791 11.209 3 9 3C6.791 3 5 4.791 5 7C5 9.209 6.791 11 9 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconOrg = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
    <path d="M3 21H21M6 21V8L12 3L18 8V21M9 21V15H15V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconPlus = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const NAV = [
  { id: 'home',        icon: IconHome,     label: 'Home',       path: '/home' },
  { id: 'calendario',  icon: IconCalendar, label: 'Calendário', path: '/calendario' },
  { id: 'pessoas',     icon: IconPeople,   label: 'Pessoas',    path: '/pessoas' },
  { id: 'organizacao', icon: IconOrg,      label: 'Organização',path: '/organizacao' },
];

type Props = { onAddEvent?: () => void };

export function MobileNav({ onAddEvent }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const activePath = '/' + pathname.split('/')[1];

  return (
    <nav style={{
      flexShrink: 0, background: '#fff',
      borderTop: '1px solid #E5E7EB',
      display: 'flex', alignItems: 'stretch',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 50,
    }}>
      {NAV.slice(0, 2).map(item => {
        const Icon = item.icon;
        const isActive = activePath === item.path;
        return (
          <button
            key={item.id}
            onClick={() => router.push(item.path)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 3, padding: '8px 4px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: isActive ? '#2E5AAC' : '#9AA3B5',
            }}
          >
            <Icon />
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
          </button>
        );
      })}

      {/* Botão central de adicionar evento */}
      <button
        onClick={onAddEvent}
        style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 3, padding: '6px 4px',
          background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: '50%', background: '#2E5AAC',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', boxShadow: '0 4px 12px rgba(46,90,172,0.35)',
          marginTop: -16,
        }}>
          <IconPlus />
        </div>
      </button>

      {NAV.slice(2).map(item => {
        const Icon = item.icon;
        const isActive = activePath === item.path;
        return (
          <button
            key={item.id}
            onClick={() => router.push(item.path)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 3, padding: '8px 4px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: isActive ? '#2E5AAC' : '#9AA3B5',
            }}
          >
            <Icon />
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
