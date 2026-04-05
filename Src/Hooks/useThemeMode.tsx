import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';

type ThemeMode = 'light' | 'dark';

type ThemePalette = {
  background: string;
  surface: string;
  surfaceAlt: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  accent: string;
  accentMuted: string;
  destructive: string;
  overlay: string;
  chip: string;
  chipText: string;
};

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemePalette;
  toggleTheme: () => void;
};

const lightColors: ThemePalette = {
  background: '#FCF6EF',
  surface: '#FFFFFF',
  surfaceAlt: '#F9F2E8',
  textPrimary: '#3d2b1a',
  textSecondary: '#8b6340',
  textMuted: '#bba98c',
  border: '#D0B99A',
  accent: '#BA8047',
  accentMuted: '#f3e6d7',
  destructive: '#d75442',
  overlay: 'rgba(0,0,0,0.48)',
  chip: '#f6eee3',
  chipText: '#BA8047',
};

const darkColors: ThemePalette = {
  background: '#121212',
  surface: '#1d1d1d',
  surfaceAlt: '#262626',
  textPrimary: '#f7efe7',
  textSecondary: '#d8c0a4',
  textMuted: '#a5927e',
  border: '#3f3227',
  accent: '#d19b5f',
  accentMuted: '#34281f',
  destructive: '#ff7f6f',
  overlay: 'rgba(0,0,0,0.68)',
  chip: '#2c241e',
  chipText: '#f2c38f',
};

const ThemeModeContext = createContext<ThemeContextValue | null>(null);

export function ThemeModeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>('light');

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === 'dark',
      colors: mode === 'dark' ? darkColors : lightColors,
      toggleTheme: () =>
        setMode(currentMode => (currentMode === 'dark' ? 'light' : 'dark')),
    }),
    [mode],
  );

  return React.createElement(ThemeModeContext.Provider, { value }, children);
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider.');
  }

  return context;
}
