'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { authService } from '@/services/authService';
import { AuthUser } from '@/types';

function initials(nome?: string, email?: string) {
  if (nome) return nome.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
  return (email ?? '?')[0].toUpperCase();
}

const IconHome = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
    <path d="M3 9.5L12 3L21 9.5V20C21 20.552 20.552 21 20 21H15V15H9V21H4C3.448 21 3 20.552 3 20V9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
    <path d="M8 2V5M16 2V5M3 8H21M5 4H19C20.105 4 21 4.895 21 6V19C21 20.105 20.105 21 19 21H5C3.895 21 3 20.105 3 19V6C3 4.895 3.895 4 5 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconPeople = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
    <path d="M17 21V19C17 16.791 15.209 15 13 15H5C2.791 15 1 16.791 1 19V21M23 21V19C22.999 17.153 21.765 15.537 20 15.09M16 3.13C17.769 3.579 19.006 5.198 19.006 7.05C19.006 8.902 17.769 10.521 16 10.97M9 11C11.209 11 13 9.209 13 7C13 4.791 11.209 3 9 3C6.791 3 5 4.791 5 7C5 9.209 6.791 11 9 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconOrg = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
    <path d="M3 21H21M6 21V8L12 3L18 8V21M9 21V15H15V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconMusic = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
    <path d="M9 18V5L21 3V16M9 18C9 19.105 7.657 20 6 20C4.343 20 3 19.105 3 18C3 16.895 4.343 16 6 16C7.657 16 9 16.895 9 18ZM21 16C21 17.105 19.657 18 18 18C16.343 18 15 17.105 15 16C15 14.895 16.343 14 18 14C19.657 14 21 14.895 21 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconChart = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
    <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconSettings = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
    <path d="M12 15C13.657 15 15 13.657 15 12C15 10.343 13.657 9 12 9C10.343 9 9 10.343 9 12C9 13.657 10.343 15 12 15Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const NAV_GROUPS = [
  {
    label: 'Menu',
    items: [
      { id: 'home',        icon: IconHome,     label: 'Home',        path: '/home' },
      { id: 'calendario',  icon: IconCalendar, label: 'Calendário',  path: '/calendario' },
      { id: 'pessoas',     icon: IconPeople,   label: 'Pessoas',     path: '/pessoas' },
      { id: 'organizacao', icon: IconOrg,      label: 'Organização', path: '/organizacao' },
    ],
  },
  {
    label: 'Outros',
    items: [
      { id: 'louvor',     icon: IconMusic, label: 'Louvor',      path: '/louvor',     soon: true },
      { id: 'relatorios', icon: IconChart, label: 'Relatórios',  path: '/relatorios', soon: true },
    ],
  },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    authService.getCurrentUser().then(setUser).catch(() => {});
  }, []);

  const activePath = '/' + pathname.split('/')[1];

  return (
    <aside style={{
      width: 240, background: '#fff', borderRight: '1px solid #E5E7EB',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      overflow: 'hidden', height: '100vh',
    }}>

      {/* Logo */}
      <div
        onClick={() => router.push('/home')}
        style={{ padding: '18px 18px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}
      >
        <Image src="/logo-azul.png" alt="Logo VPN" width={38} height={38} style={{ borderRadius: 10, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: '#5e636c', lineHeight: 1.3 }}>Casa Apostólica</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#101828', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Voz para as Nações</div>
        </div>
      </div>

      <div style={{ width: 'calc(100% - 36px)', height: 1, background: '#F0F2F5', margin: '0 18px 8px' }} />

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 10px' }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label} style={{ marginBottom: gi < NAV_GROUPS.length - 1 ? 16 : 0 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#B0B8C8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 8px 6px', marginBottom: 2 }}>
              {group.label}
            </div>
            {group.items.map(item => {
              const Icon = item.icon;
              const isActive = activePath === item.path;
              const isSoon = 'soon' in item && item.soon;
              return (
                <button
                  key={item.id}
                  onClick={() => !isSoon && router.push(item.path)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 8, border: 'none',
                    cursor: isSoon ? 'default' : 'pointer',
                    background: isActive ? '#EEF2FF' : 'transparent',
                    color: isActive ? '#2E5AAC' : isSoon ? '#C4CAD4' : '#5A6070',
                    fontSize: 13, fontWeight: isActive ? 500 : 400,
                    textAlign: 'left', marginBottom: 1,
                    transition: 'background 0.12s, color 0.12s',
                  }}
                  onMouseEnter={e => { if (!isActive && !isSoon) { (e.currentTarget as HTMLButtonElement).style.background = '#F5F7FA'; (e.currentTarget as HTMLButtonElement).style.color = '#101828'; } }}
                  onMouseLeave={e => { if (!isActive && !isSoon) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#5A6070'; } }}
                >
                  <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    <Icon />
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {isSoon && (
                    <span style={{ fontSize: 9, fontWeight: 600, background: '#F3F4F6', color: '#9AA3B5', padding: '2px 6px', borderRadius: 4, letterSpacing: '0.04em' }}>
                      em breve
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom fixed items */}
      <div style={{ borderTop: '1px solid #F0F2F5', padding: '8px 10px 4px', flexShrink: 0 }}>
        {(() => {
          const isActive = activePath === '/conta';
          return (
            <button
              onClick={() => router.push('/conta')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 8, border: 'none',
                cursor: 'pointer',
                background: isActive ? '#EEF2FF' : 'transparent',
                color: isActive ? '#2E5AAC' : '#5A6070',
                fontSize: 13, fontWeight: isActive ? 500 : 400,
                textAlign: 'left', transition: 'background 0.12s, color 0.12s',
              }}
              onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = '#F5F7FA'; (e.currentTarget as HTMLButtonElement).style.color = '#101828'; } }}
              onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#5A6070'; } }}
            >
              <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}><IconSettings /></span>
              <span>Configurações</span>
            </button>
          );
        })()}
        <button
          onClick={async () => { await authService.signOut(); router.push('/login'); }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 8, border: 'none',
            cursor: 'pointer', background: 'transparent', color: '#5A6070',
            fontSize: 13, fontWeight: 400, textAlign: 'left', transition: 'background 0.12s, color 0.12s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#5A6070'; }}
        >
          <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span>Sair</span>
        </button>
      </div>

      {/* User profile */}
      <div style={{ borderTop: '1px solid #F0F2F5', padding: '12px 14px', flexShrink: 0 }}>
        <button
          onClick={() => router.push('/conta')}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 6px', borderRadius: 8, textAlign: 'left', transition: 'background 0.12s' }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#F5F7FA'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
        >
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#1C3568', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {initials(user?.nome, user?.email)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.nome ?? 'Usuário'}
            </div>
            <div style={{ fontSize: 11, color: '#9AA3B5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
              {user?.email ?? ''}
            </div>
          </div>
        </button>
      </div>

    </aside>
  );
}
