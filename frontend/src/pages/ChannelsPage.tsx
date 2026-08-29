// pages/ChannelsPage.tsx — Página principal de canais e grupos
//
// Onde o usuário vê seus grupos, canais de texto/voz
// e pode iniciar chamadas.
//
// use: página principal após o login

import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export function ChannelsPage() {
  const { logout } = useAuth();

  return (
    <div className="channels-page">
      <header className="app-header">
        <h1>JCL-Chat</h1>
        <div className="header-actions">
          <button onClick={logout}>Sair</button>
        </div>
      </header>

      <main className="channels-main">
        <aside className="sidebar">
          {/* Lista de amigos, grupos, etc. */}
          <h2>Seus Grupos</h2>
          <p>Lista de grupos e amigos aparecerá aqui</p>
        </aside>

        <section className="channels-content">
          {/* Conteúdo do canal selecionado */}
          <h2>Bem-vindo ao JCL-Chat!</h2>
          <p>Selecione um canal para começar a conversar.</p>
          <nav>
            <Link to="/call">📹 Iniciar Chamada</Link>
          </nav>
        </section>
      </main>
    </div>
  );
}
