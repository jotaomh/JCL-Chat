// components/AuthShell.tsx — Moldura comum das telas de autenticação
//
// Fornece o layout "cartão centralizado" compartilhado pelas telas de
// login, cadastro, esqueci minha senha e redefinir senha:
//   - fundo de tela cheia usando a cor de fundo do tema atual
//   - cartão centralizado (largura fixa) com título, subtítulo, conteúdo
//     (o formulário) e um rodapé com links de navegação entre as telas
//   - um <div> vazio reservado pras ilustrações decorativas do fundo
//
// Os dois temas (gamer/escritório) funcionam aqui porque tudo usa as
// variáveis CSS do tema (--color-*), ativadas pela classe no <html>.

import { ReactNode } from 'react';
import { useTheme } from '../hooks/useTheme';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="auth-screen">
      {/* Botão para alternar tema (gamer/escritório) — funciona nas telas de auth */}
      <button type="button" className="theme-toggle" onClick={toggleTheme} title="Alternar tema">
        Tema: {theme === 'gamer' ? 'Gamer' : 'Escritório'} — alternar
      </button>

      {/*
        Espaço reservado para as ilustrações decorativas que vamos adicionar
        depois (tema gamer/escritório). Por enquanto é só a estrutura pronta:
        um div vazio e discreto, sem nada visível, ocupando o fundo da tela.
        Quando as ilustrações entrarem, basta adicionar imagens/SVG aqui
        (ex.: dentro deste container) e estilizar com classes CSS.
      */}
      <div className="background-illustrations" aria-hidden="true" />

      <div className="auth-card">
        <h1 className="auth-card-title">{title}</h1>
        {subtitle && <p className="auth-card-subtitle">{subtitle}</p>}
        {children}
        {footer && <div className="auth-card-footer">{footer}</div>}
      </div>
    </div>
  );
}
