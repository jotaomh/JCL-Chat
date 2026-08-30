// components/layout/ChannelSidebar.tsx — Lista lateral (coluna 2)
//
// Dependendo da seleção no trilho de ícones:
//   - "Amigos" -> lista de amigos (hoje vazia, reaproveita /api/friends)
//   - grupo    -> lista de canais do grupo (por ora, só "lobby")
//
// Deixe o ChatArea decidir o que renderizar no painel; aqui só
// fornecemos os dados de navegação lateral.

import { ServerItem, AppSelection } from '../../types';

interface ChannelSidebarProps {
  servers: ServerItem[];
  selection: AppSelection;
  onSelectChannel: (serverId: string, channelId: string) => void;
}

export function ChannelSidebar({
  servers,
  selection,
  onSelectChannel,
}: ChannelSidebarProps) {
  if (selection.type === 'friends') {
    return (
      <aside className="channel-sidebar">
        <div className="sidebar-heading">
          <input
            type="text"
            className="sidebar-search"
            placeholder="Buscar"
            readOnly
          />
        </div>
        <div className="sidebar-section">
          <h3 className="sidebar-section-title">Amigos</h3>
          <ul className="sidebar-list">
            <li className="sidebar-list-item">
              <span className="friends-count">0 online — lista de amigos virá aqui</span>
            </li>
          </ul>
        </div>
      </aside>
    );
  }

  const server = servers.find((s) => s.id === selection.serverId);

  if (!server) {
    return (
      <aside className="channel-sidebar">
        <p className="sidebar-empty">Nenhum grupo selecionado.</p>
      </aside>
    );
  }

  return (
    <aside className="channel-sidebar">
      <div className="sidebar-server-name">
        <span className="server-name-text">{server.name}</span>
        <span className="server-name-chevron">▾</span>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-section-title">Canais de texto</h3>
        <ul className="sidebar-list">
          {server.channels.map((channel) => {
            const active =
              selection.type === 'channel' &&
              selection.channelId === channel.id;
            return (
              <li key={channel.id}>
                <button
                  type="button"
                  className={`sidebar-channel ${active ? 'active' : ''}`}
                  onClick={() => onSelectChannel(server.id, channel.id)}
                >
                  <span className="channel-hash">#</span>
                  <span className="channel-name">{channel.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
