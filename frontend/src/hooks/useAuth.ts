// hooks/useAuth.ts — Hook customizado para autenticação
//
// O que é um "hook" no React?
// Um hook é uma função especial que permite "reutilizar" estado e lógica
// de componentes React. O prefixo "use" é obrigatório por convenção.
//
// useAuth encapsula toda a lógica de login, logout e verificação
// do usuário atual, para que qualquer componente possa usar sem
// repetir código.

import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
    error: null,
  });

  // Na inicialização, verifica se há um token salvo
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setState({ user: JSON.parse(storedUser), token, loading: false, error: null });
    } else {
      setState({ user: null, token: null, loading: false, error: null });
    }
  }, []);

  const login = useCallback((user: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setState({ user, token, loading: false, error: null });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({ user: null, token: null, loading: false, error: null });
  }, []);

  const setError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  return {
    ...state,
    login,
    logout,
    setError,
    isAuthenticated: state.token !== null,
  };
}
