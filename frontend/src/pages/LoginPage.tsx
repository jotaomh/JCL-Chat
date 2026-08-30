// pages/LoginPage.tsx — Página de login
//
// Fica num cartão centralizado com título de boas-vindas, campos de
// e-mail/senha e um link para recuperação de senha e para o cadastro.
// Usa o mesmo cartão (AuthShell) das demais telas de autenticação.

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { login } from '../services/api';
import { AuthShell } from '../components/AuthShell';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      authLogin(data.user, data.token);
      navigate(location.state?.from?.pathname || '/channels', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Bem-vindo de volta!"
      subtitle="Entre para continuar suas conversas"
      footer={
        <>
          <Link to="/forgot-password" className="auth-link">
            Esqueceu sua senha?
          </Link>
          <p className="auth-switch">
            Não tem conta? <Link to="/register">Cadastre-se</Link>
          </p>
        </>
      }
    >
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

        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha"
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </AuthShell>
  );
}
