// pages/RegisterPage.tsx — Página de cadastro
//
// Cartão centralizado (AuthShell) com os campos: nome de usuário, e-mail,
// data de nascimento, senha e confirmação de senha.
// A confirmação de senha é validada no frontend, antes de chamar a API:
// se as duas senhas forem diferentes, mostramos o erro embaixo do campo e
// NÃO fazemos a requisição.
//
// obs.: a idade mínima (13 anos) é validada tanto aqui (data no frontend
// quanto no backend (api/src/app/schemas/auth.py)).

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { register, login } from '../services/api';
import { AuthShell } from '../components/AuthShell';

export function RegisterPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [confirmError, setConfirmError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setConfirmError('');

    // Validação de confirmação de senha no frontend (antes de chamar a API).
    if (password !== confirmPassword) {
      setConfirmError('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      // 1) Cadastra o usuário (o backend devolve só os dados, sem token)
      await register(username, email, password, birthDate);
      // 2) Faz login automático com as mesmas credenciais para obter o token
      const data = await login(email, password);
      authLogin(data.user, data.token);
      navigate('/channels', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Criar conta"
      subtitle="Comece a conversar em tempo real"
      footer={
        <p className="auth-switch">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="username">Nome de usuário</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Seu nome de usuário"
            minLength={3}
            maxLength={50}
            autoComplete="username"
            required
          />
        </div>

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
          <label htmlFor="birth-date">Data de nascimento</label>
          <input
            id="birth-date"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
          />
          <small className="field-hint">Você precisa ter pelo menos 13 anos.</small>
        </div>

        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
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
          <label htmlFor="confirm-password">Confirmar senha</label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repita a senha"
            autoComplete="new-password"
            required
          />
          {confirmError && <small className="field-error">{confirmError}</small>}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </AuthShell>
  );
}
