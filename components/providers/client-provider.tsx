'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { ReactNode } from 'react';

interface ClientProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark';
}

export function ClientProvider({ children, defaultTheme = 'dark' }: ClientProviderProps) {
  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      {children}
    </ThemeProvider>
  );
}
