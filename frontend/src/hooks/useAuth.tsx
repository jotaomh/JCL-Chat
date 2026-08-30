// hooks/useAuth.ts — Autenticação compartilhada (React Context)
//
// O que é um hook? Uma função especial que permite reutilizar estado e
// lógica de componentes React (prefixo "use" obrigatório por convenção).
//
// Importante: usamos um <AuthProvider> (React Context) para que TODOS os
// componentes (App, páginas, hooks como useChat) compartilhem o MESMO estado
// de autenticação. Isso garante que, ao fazer logout em uma página (ex:
// ChannelsPage), o App saiba imediatamente e redirecione para o login.
//
// useAuth encapsula toda a lógica de login, logout e verificação do usuário
// atual, para qualquer componente usar sem repetir código.

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
  setError: (error: string) => void;
  isAuthenticated: boolean;
}

// Context padrão indefinido — o useAuth() lança erro se usado fora do provider.
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
    error: null,
  });

  // Na inicialização, verifica se há um token salvo no localStorage.
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setState({
          user: JSON.parse(storedUser),
          token,
          loading: false,
          error: null,
        });
      } catch {
        // se o JSON salvo estiver corrompido, desloga
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setState({ user: null, token: null, loading: false, error: null });
      }
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
    // Limpa o token e os dados do usuário do estado e do localStorage.
    // O socket do Phoenix é desconectado de forma reativa: o useChat()
    // depende do "token", e quando ele vira null o seu useEffect limpa a
    // conexão (ch.leave() + socket.disconnect()).
    // Como compartilhamos o estado via context, o App reage na hora e
    // redireciona para a tela de login.
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({ user: null, token: null, loading: false, error: null });
    // OBSERVAÇÃO (comportamento esperado, NÃO é bug): como o JWT é
    // stateless, o logout no backend não invalida o token em si — ele
    // simplesmente continua válido até expirar sozinho (por padrão 24h).
    // Por enquanto isso é aceitável nesta fase; revogação imediata exigiria
    // uma blacklist/sessões no backend. Aqui apenas descartamos o token no
    // cliente, o que já desloga o usuário desta sessão e desconecta o socket.
  }, []);

  const setError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    setError,
    isAuthenticated: state.token !== null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return ctx;
}
