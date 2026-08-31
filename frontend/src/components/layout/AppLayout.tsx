// components/layout/AppLayout.tsx — Orquestra as colunas do layout estilo Discord
//
// Organiza em CSS Grid:
//   coluna 1: <ServerRail /> (trilho de ícones)
//   coluna 2: <ChannelSidebar /> (lista lateral)
//   coluna 3: área principal (chat)
//
// Responsivo: em telas estreitas a lista lateral (e futura coluna 4) podem
// ser escondidas/reveladas por um menu hambúrguer, mostrando o chat
// por padrão.

import { useState, ReactNode } from 'react';
import { ServerItem, AppSelection } from '../../types';
import { ServerRail } from './ServerRail';
import { ChannelSidebar } from './ChannelSidebar';

interface AppLayoutProps {
  servers: ServerItem[];
  selection: AppSelection;
  onSelect: (selection: AppSelection) => void;
  userLabel?: string;
  children: ReactNode; // área principal (ChatArea)
  onLogout?: () => void;
  onToggleTheme?: () => void;
}

export function AppLayout({
  servers,
  selection,
  onSelect,
  userLabel,
  children,
  onLogout,
  onToggleTheme,
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSelectChannel = (serverId: string, channelId: string) => {
    onSelect({ type: 'channel', serverId, channelId });
    // Fecha o menu lateral em mobile após escolher um canal
    setSidebarOpen(false);
  };

  const handleSelectFriend = (friendId: string, username: string) => {
    onSelect({ type: 'dm', friendId, friendUsername: username });
    // Fecha o menu lateral em mobile após escolher uma conversa
    setSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      {/* Barra superior com hambúrguer (mobile) e identidade */}
      <header className="topbar">
        <button
          type="button"
          className="topbar-hamburger"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Alternar menu lateral"
        >
          ☰
        </button>
        <span className="topbar-title">JCL-Chat</span>
        <div className="topbar-actions">
          {userLabel && <span className="topbar-user">👤 {userLabel}</span>}
          {onToggleTheme && (
            <button type="button" className="topbar-btn" onClick={onToggleTheme}>
              Tema
            </button>
          )}
          {onLogout && (
            <button type="button" className="topbar-btn" onClick={onLogout}>
              Sair
            </button>
          )}
        </div>
      </header>

      <div className="layout-body">
        {/* Coluna 1 — trilho de ícones (sempre visível) */}
        <ServerRail servers={servers} selection={selection} onSelect={onSelect} />

        {/* Coluna 2 — lista lateral (revelada por padrão no desktop, via toggle no mobile) */}
        <div className={`layout-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ChannelSidebar
            servers={servers}
            selection={selection}
            onSelectChannel={handleSelectChannel}
            onSelectFriend={handleSelectFriend}
          />
        </div>
        {sidebarOpen && (
          <button
            type="button"
            className="sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fechar menu lateral"
          />
        )}

        {/* Coluna 3 — área principal */}
        <div className="layout-main">{children}</div>
      </div>
    </div>
  );
}
