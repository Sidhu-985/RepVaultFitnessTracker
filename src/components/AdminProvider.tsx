"use client";

import { AdminAuthProvider } from '@/contexts/AdminAuth';
import { ThemeProvider } from '@/contexts/ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AdminAuthProvider>
          {children}
      </AdminAuthProvider>
    </ThemeProvider>
  );
}
