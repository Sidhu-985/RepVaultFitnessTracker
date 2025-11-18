"use client";

import { AdminAuthProvider } from '@/contexts/AdminAuth';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <AdminAuthProvider>
        {children}
      </AdminAuthProvider>
    </ThemeProvider>
  );
}
