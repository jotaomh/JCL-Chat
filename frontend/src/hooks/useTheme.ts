// hooks/useTheme.ts — Hook para alternar entre temas (gamer/escritório)
//
// Permite que o usuário troque entre:
//   - "gamer": dark mode com vermelho destaque (padrão)
//   - "office": tema claro/neutro
//
// O tema é salvo no localStorage para persistir entre sessões.

import { useState, useEffect, useCallback } from 'react';

type Theme = 'gamer' | 'office';

export function useTheme() {
  // Lê o tema salvo ou padrão para 'gamer'
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme | null;
    return saved || 'gamer';
  });

  // Aplica o tema ao carregar e quando ele muda
  useEffect(() => {
    const root = document.documentElement;
    // Remove a classe de tema anterior e adiciona a atual
    root.classList.remove('gamer-theme', 'office-theme');

    if (theme === 'office') {
      root.classList.add('office-theme');
    } else {
      root.classList.add('gamer-theme');
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'gamer' ? 'office' : 'gamer'));
  }, []);

  return { theme, toggleTheme };
}
