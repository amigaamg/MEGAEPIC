// AMEXAN Theme Engine - React Context
// Constitutional Principle: Theme is never CSS. Theme is data.

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme, getTheme, themes } from '@/lib/design/theme-engine';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Record<string, Theme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ 
  children: ReactNode; 
  defaultTheme?: string 
}> = ({ children, defaultTheme = 'clinical' }) => {
  const [theme, setThemeState] = useState<Theme>(getTheme(defaultTheme));

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('amexan-theme');
    if (savedTheme && themes[savedTheme]) {
      setThemeState(getTheme(savedTheme));
    } else {
      setThemeState(getTheme(defaultTheme));
    }
  }, [defaultTheme]);

  // Apply CSS variables for theme tokens
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // Apply color tokens
      Object.entries(theme.colors.primary).forEach(([key, value]) => {
        root.style.setProperty(`--color-primary${key === 'DEFAULT' ? '' : `-${key.toLowerCase()}`}`, value);
      });
      
      // Apply spacing tokens
      Object.entries(theme.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--space-${key}`, `${value}px`);
      });
      
      // Apply breakpoint tokens
      Object.entries(theme.breakpoints).forEach(([key, value]) => {
        root.style.setProperty(`--breakpoint-${key}`, `${value.min}px`);
      });
      
      // Apply theme class
      root.setAttribute('data-theme', theme.id);
    }
  }, [theme]);

  const setTheme = (themeId: string) => {
    const newTheme = getTheme(themeId);
    setThemeState(newTheme);
    localStorage.setItem('amexan-theme', themeId);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
