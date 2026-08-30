// components/layout/ServerRail.tsx — Trilho de ícones (coluna 1)
//
// Coluna estreita (~72px) com um ícone fixo para "Amigos/DMs" no topo
// e um ícone por grupo/comunidade (por ora, só o círculo com a inicial).
// Nesta fase os grupos de verdade ainda não existem — usamos o "lobby"
// fixo, então a estrutura já está pronta pra lista crescer depois.

import { ServerItem, AppSelection } from '../../types';

interface ServerRailProps {
  servers: ServerItem[];
  selection: AppSelection;
  onSelect: (selection: AppSelection) => void;
}

export function ServerRail({ servers, selection, onSelect }: ServerRailProps) {
  const friendsActive = selection.type === 'friends';

  return (
    <nav className="server-rail" aria-label="Servidores">
      <button
        type="button"
        className={`rail-item rail-friends ${friendsActive ? 'active' : ''}`}
        onClick={() => onSelect({ type: 'friends' })}
        title="Amigos / Mensagens diretas"
      >
        <span className="rail-friends-icon">💬</span>
      </button>

      <div className="rail-divider" />

      {servers.map((server) => {
        const selected =
          selection.type === 'channel' && selection.serverId === server.id;
        return (
          <button
            key={server.id}
            type="button"
            className={`rail-item rail-server ${selected ? 'active' : ''}`}
            onClick={() =>
              onSelect({
                type: 'channel',
                serverId: server.id,
                channelId: server.channels[0]?.id ?? 'lobby',
              })
            }
            title={server.name}
          >
            <span className="rail-server-avatar">
              {server.name.charAt(0).toUpperCase()}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
