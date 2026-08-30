// components/layout/ChatArea.tsx — Área principal de chat (coluna 3)
//
// Cabeçalho fixo com o nome do canal, lista de mensagens rolável
// (mais recente embaixo) e barra de digitar fixa embaixo.

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ChatMessage } from '../../types';

interface ChatAreaProps {
  roomName: string;
  connected: boolean;
  messages: ChatMessage[];
  onSend: (body: string) => void;
}

export function ChatArea({ roomName, connected, messages, onSend }: ChatAreaProps) {
  const { user } = useAuth();
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  // Rola para a mais recente sempre que novas mensagens chegam
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setDraft('');
  };

  return (
    <section className="chat-area">
      <header className="chat-header">
        <span className="chat-header-hash">#</span>
        <h2 className="chat-header-title">{roomName}</h2>
        <span className={`chat-status ${connected ? 'online' : 'offline'}`}>
          {connected ? 'conectado' : 'conectando…'}
        </span>
      </header>

      <div className="chat-messages" ref={listRef}>
        {messages.length === 0 ? (
          <p className="chat-empty">
            Bem-vindo ao <strong>#{roomName}</strong>! Seja o primeiro a mandar uma
            mensagem.
          </p>
        ) : (
          messages.map((msg, i) => {
            const isMine = user != null && msg.user_id === user.id;
            return (
              <div
                key={`${msg.timestamp}-${i}`}
                className={`chat-message ${isMine ? 'mine' : ''}`}
              >
                <span className="chat-message-author">{msg.username}</span>
                <span className="chat-message-body">{msg.body}</span>
              </div>
            );
          })
        )}
      </div>

      <div className="chat-composer">
        <input
          type="text"
          className="chat-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          placeholder="Digite sua mensagem…"
        />
        <button
          type="button"
          className="chat-send"
          onClick={submit}
          disabled={!draft.trim()}
        >
          Enviar
        </button>
      </div>
    </section>
  );
}
