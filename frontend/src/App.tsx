// App.tsx — Componente raiz do aplicativo JCL-Chat
// Responsável por renderizar a estrutura principal (router, layout, temas)
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ChannelsPage } from './pages/ChannelsPage';
import { CallPage } from './pages/CallPage';

// Componente App: é o componente principal que envolve toda a aplicação.
// Usamos BrowserRouter para habilitar o roteamento no lado do cliente.
//
// Conceitos importantes:
//   - "Routes"/"Route": define quais componentes renderizar por URL
//   - "Navigate": redireciona para outra rota
//   - "useAuth": hook para saber se o usuário está logado
function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter
      future={{
        // Habilita as future flags do React Router v7 com antecedência,
        // evitando os warnings de deprecação no console e surpresas na próxima
        // atualização (v7_startTransition e v7_relativeSplatPath).
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="app">
        <Routes>
          {/* Se autenticado, vai para os canais; senão, para o login */}
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/channels" replace /> : <Navigate to="/login" replace />
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          {/* Rota protegida: apenas mostra canais se estiver autenticado */}
          <Route
            path="/channels"
            element={isAuthenticated ? <ChannelsPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/call"
            element={isAuthenticated ? <CallPage /> : <Navigate to="/login" replace />}
          />
          {/* Fallback para URLs desconhecidas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
