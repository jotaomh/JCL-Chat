// pages/ForgotPasswordPage.tsx — "Esqueci minha senha"
//
// Pede o e-mail e, ao enviar, mostra SEMPRE a mesma mensagem genérica
// ("se este e-mail existir, um link foi enviado") — por segurança, para
// não revelar ao atacante se um e-mail está cadastrado no sistema.
//
// obs.: nesta fase ainda não há serviço de e-mail; o link de recuperação é
// apenas LOGADO no console do servidor (ver api/src/app/routers/auth.py).

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';
import { AuthShell } from '../components/AuthShell';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await forgotPassword(email);
      // Sempre mostramos a mesma confirmação genérica, existindo ou não o
      // e-mail cadastrado (o backend também responde sempre igual).
      setSent(true);
    } catch (err) {
      // Se a requisição falhar por um problema de rede/servidor, mostramos
      // o erro (diferente da mensagem "enviado" acima, que é sempre a mesma).
      setError(err instanceof Error ? err.message : 'Erro ao solicitar recuperação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Recuperar senha"
      subtitle="Informe seu e-mail para redefinir a senha"
      footer={
        <p className="auth-switch">
          Lembrou a senha? <Link to="/login">Entrar</Link>
        </p>
      }
    >
      {sent ? (
        <div className="auth-form">
          <p className="auth-success-message">
            Se este e-mail existir, um link de recuperação foi enviado. Verifique sua caixa de
            entrada.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
