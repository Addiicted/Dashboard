// app/layout.tsx
import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Finanças - Gestão Financeira',
  description: 'Dashboard Financeiro',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}