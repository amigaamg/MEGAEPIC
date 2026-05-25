'use client';
import React, { createContext, useContext, useEffect } from 'react';
import { THEMES, Theme } from './themes.config';
import { useUIStore } from '../../state/uiStore';

const ThemeContext = createContext<Theme>(THEMES.light);
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const themeId = useUIStore((s) => s.themeId);
  const theme = THEMES[themeId] || THEMES.light;

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, val]) => {
      root.style.setProperty(`--color-${key}`, val);
    });
    root.style.setProperty('--font-family', theme.typography.font);
    root.style.setProperty('--mono-family', theme.typography.mono);
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
