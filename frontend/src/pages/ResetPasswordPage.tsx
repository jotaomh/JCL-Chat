// pages/ResetPasswordPage.tsx — "Definir nova senha" (via link/token)
//
// Acessada por /reset-password?token=... — o token vem na URL do link de
// recuperação (que nesta fase é logado no console do servidor).
// Pede a nova senha 2x, com a mesma validação de confirmação do cadastro
// (valida no frontend antes de chamar a API).

import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/api';
import { AuthShell } from '../components/AuthShell';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [confirmError, setConfirmError] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setConfirmError('');

    // Mesma validação do cadastro: senhas precisam ser idênticas.
    if (password !== confirmPassword) {
      setConfirmError('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir a senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Definir nova senha"
      subtitle="Escolha uma nova senha para a sua conta"
      footer={
        <p className="auth-switch">
          Lembrou a senha? <Link to="/login">Entrar</Link>
        </p>
      }
    >
      {done ? (
        <div className="auth-form">
          <p className="auth-success-message">
            Senha redefinida com sucesso! Agora é só entrar com a nova senha.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="new-password">Nova senha</label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              minLength={6}
              maxLength={128}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-new-password">Confirmar nova senha</label>
            <input
              id="confirm-new-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha"
              autoComplete="new-password"
              required
            />
            {confirmError && <small className="field-error">{confirmError}</small>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading || !token}>
            {loading ? 'Salvando...' : 'Redefinir senha'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
