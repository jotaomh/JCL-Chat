// pages/CallPage.tsx — Página de chamadas de voz/vídeo
//
// Aqui será implementada a lógica de chamadas WebRTC.
// Nesta versão inicial, apenas o esqueleto da página.
//
// Futuro: integração com WebRTC (PeerJS ou simples library)
// para chamadas de áudio/vídeo e compartilhamento de tela.

export function CallPage() {
  return (
    <div className="call-page">
      <h1>📹 Chamadas</h1>
      <p>Chamadas de voz/vídeo e compartilhamento de tela</p>

      <div className="call-controls">
        <button className="btn-call">📹 Iniciar Chamada de Vídeo</button>
        <button className="btn-call">🎤 Iniciar Chamada de Voz</button>
        <button className="btn-call">🖥️ Compartilhar Tela</button>
      </div>
    </div>
  );
}
