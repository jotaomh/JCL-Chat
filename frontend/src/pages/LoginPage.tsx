// pages/LoginPage.tsx — Página de login e cadastro
//
// Página que contém:
//   - Formulário de login (email + senha)
//   - Link para cadastro
//   - Validação básica dos campos
//
// use: quando o usuário não está autenticado, é redirecionado para aqui

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { login } from '../services/api';

export function LoginPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        // TODO: implementar cadastro real
        // const data = await register(username, email, password);
        alert('Cadastro em breve!');
      } else {
        const data = await login(email, password);
        authLogin(data.user, data.token);
        navigate('/channels');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao autenticar');
    }
  };

  return (
    <div className="login-page">
      {/* Botão para alternar tema */}
      <button onClick={toggleTheme} className="theme-toggle">
        Tema atual: {theme === 'gamer' ? '🎮 Gamer' : '🏢 Escritório'} — Clique para alternar
      </button>

      <form onSubmit={handleSubmit} className="auth-form">
        <h1>JCL-Chat</h1>
        <p>Chamadas de voz/vídeo e chat em tempo real</p>

        {error && <div className="error-message">{error}</div>}

        {isSignUp && (
          <div className="form-group">
            <label htmlFor="username">Nome de usuário</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Seu nome de usuário"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
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
            required
          />
        </div>

        <button type="submit" className="btn-primary">
          {isSignUp ? 'Cadastrar' : 'Entrar'}
        </button>

        <button type="button" className="btn-secondary" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
        </button>
      </form>
    </div>
  );
}
